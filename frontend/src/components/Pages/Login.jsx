import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import api from '../../api';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const Login = () => {
  const { t } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // forgot password states: null | 'request' | 'otp' | 'password'
  const [forgotStep, setForgotStep] = useState(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpCheckRef = useRef(false);

  const { login, setAuthFromToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const redirectByRole = (role, userObj) => {
    const r = (role || '').toLowerCase();
    const u = (userObj?.username || localStorage.getItem('username') || '').toLowerCase();
    if (u === 'housekeeping' || r === 'housekeeping') {
      navigate('/dashboard/housekeeping');
    } else if (r === 'admin') navigate('/dashboard/admin');
    else if (r === 'manager') navigate('/dashboard/manager');
    else if (r === 'receptionist') navigate('/dashboard/receptionist');
    else navigate('/dashboard/customer');
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleGoogleCredential = useCallback(
    async (response) => {
      try {
        setLoading(true);
        if (!response?.credential) {
          toast.error('Google did not return a credential. Try again.');
          return;
        }
        const res = await api.post('/auth/google', { credential: response.credential });
        if (res.data && res.data.success === true && res.data.token) {
          localStorage.setItem('token', res.data.token);
          if (typeof setAuthFromToken === 'function') {
            await setAuthFromToken(res.data.token, res.data.user);
          } else {
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/dashboard/customer';
            return;
          }
          toast.success('Signed in with Google');
          redirectByRole(res.data.user?.role, res.data.user);
          return;
        }
        if (res.data?.code === 'NOT_REGISTERED' || res.data?.requireRegistration) {
          toast.error(res.data.message || 'Please register this email first.');
          const params = new URLSearchParams();
          if (res.data.email) params.set('email', res.data.email);
          if (res.data.firstName) params.set('firstName', res.data.firstName);
          if (res.data.lastName) params.set('lastName', res.data.lastName);
          navigate('/register' + (params.toString() ? '?' + params.toString() : ''));
          return;
        }
        toast.error(res.data?.message || 'Google sign-in failed');
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data || {};
        if (data.code === 'NOT_REGISTERED' || data.requireRegistration || status === 403 || status === 404) {
          toast.error(data.message || 'This Google email is not registered. Please register first.');
          const params = new URLSearchParams();
          if (data.email) params.set('email', data.email);
          if (data.firstName) params.set('firstName', data.firstName);
          if (data.lastName) params.set('lastName', data.lastName);
          navigate('/register' + (params.toString() ? '?' + params.toString() : ''));
          return;
        }
        toast.error(data.message || err.message || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    [setAuthFromToken, navigate]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || forgotStep) return;
    const scriptId = 'google-gsi';
    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      const el = document.getElementById('google-btn');
      if (el) {
        el.innerHTML = '';
        window.google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        });
      }
    };
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = init;
      document.body.appendChild(s);
    } else {
      init();
    }
  }, [handleGoogleCredential, forgotStep]);

  // Countdown timer for OTP
  useEffect(() => {
    if (forgotStep !== 'otp' || otpSecondsLeft <= 0) return undefined;
    const tInterval = setInterval(() => {
      setOtpSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(tInterval);
  }, [forgotStep, otpSecondsLeft]);

  // Verify OTP
  const verifyOtpNow = useCallback(async (code) => {
    const digits = String(code || '').replace(/\D/g, '').slice(0, 5);
    if (digits.length !== 5) return;
    if (otpCheckRef.current || otpVerified) return;
    otpCheckRef.current = true;
    setOtpVerifying(true);
    try {
      const res = await api.post(
        '/auth/verify-reset-otp',
        { email: forgotEmail.trim().toLowerCase(), otp: digits },
        { timeout: 8000 }
      );
      if (res.data && res.data.success) {
        setOtpVerified(true);
        setOtp(digits);
        toast.success('OTP verified successfully');
        setForgotStep('password');
      } else {
        toast.error(res.data?.message || 'Invalid OTP code');
        setOtp('');
        otpCheckRef.current = false;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP code');
      setOtp('');
      otpCheckRef.current = false;
    } finally {
      setOtpVerifying(false);
    }
  }, [forgotEmail, otpVerified]);

  const onOtpChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 5);
    setOtp(digits);
    if (digits.length === 5) {
      verifyOtpNow(digits);
    } else {
      otpCheckRef.current = false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanLoginId = email.trim().replace(/[\s\)\(\]\}>]+$/, '');
    if (!cleanLoginId || !password) {
      toast.error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const result = await login(cleanLoginId, password);
      if (result?.success === false) {
        toast.error(result.message || 'Login failed');
        return;
      }
      toast.success('Welcome back to Paradise Hotel!');
      redirectByRole(result?.user?.role || localStorage.getItem('role'), result?.user);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const startOtpTimer = () => {
    setOtp('');
    setOtpVerified(false);
    otpCheckRef.current = false;
    setOtpSecondsLeft(120);
    setForgotStep('otp');
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    const em = forgotEmail.trim().toLowerCase();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      toast.error('Enter a valid registered email address');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: em });
      if (res.data.emailSent) {
        toast.success(res.data.message || 'OTP sent to your email (valid 2 minutes)');
      } else {
        toast.error(res.data.message || 'Could not send email. Check backend terminal for OTP.', {
          duration: 8000,
        });
      }
      startOtpTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpSecondsLeft > 0 || loading) return;
    const em = forgotEmail.trim().toLowerCase();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: em });
      toast.success(res.data.message || 'New OTP sent to your email');
      startOtpTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const code = String(otp || '').trim();
    if (!/^\d{5}$/.test(code)) {
      toast.error('OTP missing — go back and enter code');
      setForgotStep('otp');
      return;
    }
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strong.test(newPassword)) {
      toast.error('Password must be 8+ chars with upper, lower, number, and special character');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail.trim().toLowerCase(),
        otp: code,
        newPassword,
      });
      toast.success(res.data.message || 'Password updated! Please sign in.');
      setForgotStep(null);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setEmail(forgotEmail.trim().toLowerCase());
      setPassword('');
      setOtpSecondsLeft(0);
      setOtpVerified(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — OTP may be invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-card">
        {/* Left Side: Dark Luxury Hospitality Brand Showcase */}
        <div className="auth-brand-side">
          <div className="auth-brand-header">
            <LuxuryLogo size="medium" />
          </div>

          <div className="auth-portal-badge">
            ★★★★★ FIVE-STAR GUEST PORTAL
          </div>

          <h1 className="auth-brand-heading">
            Your Haven of Luxury &amp; Hospitality
          </h1>

          <p className="auth-brand-desc">
            Experience premier hospitality in Debre Markos. Access room folios, dining reservations, contactless mobile check-in, and member rewards.
          </p>

          <ul className="auth-feature-list">
            <li>
              <span className="check-icon">✓</span>
              <span>Seamless Room &amp; Table Reservations</span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span>Paperless QR Contactless Check-In</span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span>24/7 AI Concierge &amp; Front Desk Support</span>
            </li>
          </ul>

          {/* Testimonial Quote Card */}
          <div className="auth-testimonial-box">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              "An oasis of tranquility, world-class comfort, and genuine warmth in Debre Markos."
            </p>
            <div className="testimonial-author">— Verified Guest Review</div>
          </div>
        </div>

        {/* Right Side: Clean Form Panel */}
        <div className="auth-form-side">
          {!forgotStep && (
            <>
              <div className="form-eyebrow">SECURE ACCESS</div>
              <h2 className="form-main-title">{t('signInToParadise', 'Sign In to Paradise')}</h2>
              <p className="form-main-subtitle">
                Enter your registered credentials to access your account
              </p>

              <form onSubmit={handleLogin} className="auth-clean-form">
                <div className="form-group-clean">
                  <label className="clean-label">
                    <span>📧</span> {t('usernameOrEmail', 'Username or Email Address')} <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="clean-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin or name@example.com"
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="form-group-clean">
                  <div className="label-flex-row">
                    <label className="clean-label">
                      <span>🔒</span> {t('password', 'Password')} <span className="req">*</span>
                    </label>
                    <button
                      type="button"
                      className="clean-forgot-btn"
                      onClick={() => {
                        setForgotStep('request');
                        setForgotEmail(email);
                      }}
                    >
                      {t('forgotPassword', 'Forgot password?')}
                    </button>
                  </div>
                  <div className="input-wrap-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="clean-input with-toggle"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="input-eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-gold-submit-btn"
                  disabled={loading}
                >
                  {loading ? t('loading', 'Signing In...') : `➔ ${t('signIn', 'Sign In to Your Account')}`}
                </button>
              </form>

              {/* Separator */}
              <div className="auth-or-separator">
                <span className="sep-line" />
                <span className="sep-text">{t('orContinueWith', 'OR CONTINUE WITH')}</span>
                <span className="sep-line" />
              </div>

              {/* Google Button */}
              {GOOGLE_CLIENT_ID ? (
                <div id="google-btn" style={{ display: 'flex', justifyContent: 'center' }} />
              ) : (
                <button
                  type="button"
                  className="google-clean-btn"
                  onClick={() => toast('Google Sign-In is active once Google Client ID is configured in .env', { icon: 'ℹ️' })}
                >
                  <svg className="google-svg" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{t('continueWithGoogle', 'Continue with Google')}</span>
                </button>
              )}

              {/* Bottom Registration Link */}
              <div className="auth-bottom-nav">
                <span>{t('dontHaveAccount', "Don't have an account yet?")} </span>
                <Link to="/register" className="bottom-gold-link">
                  {t('createAccount', 'Create Account ➔')}
                </Link>
              </div>
            </>
          )}

          {/* Forgot Password Flow */}
          {forgotStep === 'request' && (
            <div className="forgot-flow-pane">
              <div className="form-eyebrow">PASSWORD RECOVERY</div>
              <h2 className="form-main-title">Reset Your Password</h2>
              <p className="form-main-subtitle">
                Enter your registered email address to receive a secure 5-digit verification code.
              </p>

              <form onSubmit={handleForgotRequest} className="auth-clean-form">
                <div className="form-group-clean">
                  <label className="clean-label">
                    <span>✉️</span> Registered Email Address <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    className="clean-input"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                </div>

                <button type="submit" className="auth-gold-submit-btn" disabled={loading}>
                  {loading ? 'Sending OTP Code...' : '✉️ Send 5-Digit OTP Code'}
                </button>

                <button
                  type="button"
                  className="auth-cancel-btn"
                  onClick={() => setForgotStep(null)}
                >
                  ← Back to Sign In
                </button>
              </form>
            </div>
          )}

          {forgotStep === 'otp' && (
            <div className="forgot-flow-pane">
              <div className="form-eyebrow">SECURE VERIFICATION</div>
              <h2 className="form-main-title">Verify 5-Digit OTP</h2>
              <p className="form-main-subtitle">
                Enter the code sent to <strong>{forgotEmail}</strong>. Verification occurs automatically once 5 digits are entered.
              </p>

              <div className="form-group-clean" style={{ textAlign: 'center' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={5}
                  value={otp}
                  onChange={onOtpChange}
                  placeholder="•••••"
                  className="otp-clean-input"
                  autoFocus
                />
              </div>

              <div className={`otp-timer-pill ${otpSecondsLeft > 0 ? 'active' : 'expired'}`}>
                {otpSecondsLeft > 0 ? (
                  <span>⏳ Code expires in {formatTimer(otpSecondsLeft)}</span>
                ) : (
                  <span>⚠️ Code expired. Please request a new one.</span>
                )}
              </div>

              {otpVerifying && (
                <div className="otp-status-text">
                  Verifying OTP code...
                </div>
              )}

              <div className="otp-actions-col">
                <button
                  type="button"
                  className="auth-gold-submit-btn"
                  onClick={handleResendOtp}
                  disabled={loading || otpSecondsLeft > 0}
                >
                  {loading ? 'Sending...' : '🔄 Resend OTP Code'}
                </button>
                <button
                  type="button"
                  className="auth-cancel-btn"
                  onClick={() => setForgotStep(null)}
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}

          {forgotStep === 'password' && (
            <div className="forgot-flow-pane">
              <div className="form-eyebrow">NEW CREDENTIALS</div>
              <h2 className="form-main-title">Create New Password</h2>
              <p className="form-main-subtitle">
                OTP verified successfully. Create a strong password (8+ characters with uppercase, lowercase, numbers &amp; symbols).
              </p>

              <form onSubmit={handleResetPassword} className="auth-clean-form">
                <div className="form-group-clean">
                  <label className="clean-label">New Password <span className="req">*</span></label>
                  <input
                    type="password"
                    className="clean-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 8 characters"
                  />
                </div>

                <div className="form-group-clean">
                  <label className="clean-label">Confirm New Password <span className="req">*</span></label>
                  <input
                    type="password"
                    className="clean-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                  />
                </div>

                <button type="submit" className="auth-gold-submit-btn" disabled={loading}>
                  {loading ? 'Updating Password...' : '👑 Save Password & Sign In'}
                </button>

                <button
                  type="button"
                  className="auth-cancel-btn"
                  onClick={() => setForgotStep(null)}
                >
                  ← Back to Sign In
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
