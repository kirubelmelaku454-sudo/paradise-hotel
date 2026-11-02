import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import api from '../../api';
import toast from 'react-hot-toast';

const lettersOnly = (value) => value.replace(/[^A-Za-z ]/g, '').replace(/  +/g, ' ');
const digitsOnlyPhone = (value) => value.replace(/\D/g, '').slice(0, 15);

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useContext(LanguageContext);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const em = searchParams.get('email');
    const fn = searchParams.get('firstName');
    const ln = searchParams.get('lastName');
    if (em || fn || ln) {
      setFormData((prev) => ({
        ...prev,
        email: em || prev.email || '',
        firstName: fn || prev.firstName || '',
        lastName: ln || prev.lastName || '',
      }));
    }
  }, [searchParams]);

  const onNameChange = (field) => (e) => {
    const raw = e.target.value;
    const v = lettersOnly(raw);
    if (v !== raw) toast.error('Only letters and spaces are allowed in the name', { id: 'name-key' });
    setFormData((prev) => ({ ...prev, [field]: v }));
  };

  const onPhoneChange = (e) => {
    setFormData((prev) => ({ ...prev, phone: digitsOnlyPhone(e.target.value) }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    const nameRe = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    if (!nameRe.test(formData.firstName.trim()) || !nameRe.test(formData.lastName.trim())) {
      toast.error('Full name may only contain letters and spaces');
      return;
    }
    const email = formData.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    const phoneDigits = String(formData.phone || '').replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 15) {
      toast.error('Phone number must be between 10 and 15 digits');
      return;
    }
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strong.test(formData.password)) {
      toast.error('Password must be 8+ characters with uppercase, lowercase, a number, and a special character');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (response.data.success) {
        toast.success(
          response.data.message ||
          'Registration complete! Please sign in to your new account.',
          { duration: 6000 }
        );
        navigate('/login');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
            ★★★★★ FIVE-STAR GUEST PRIVILEGES
          </div>

          <h1 className="auth-brand-heading">
            Join Our Distinguished Circle of Guests
          </h1>

          <p className="auth-brand-desc">
            Create your complimentary Paradise membership to unlock bespoke rates, express dining service, seamless room folios, and exclusive loyalty rewards.
          </p>

          <ul className="auth-feature-list">
            <li>
              <span className="check-icon">✓</span>
              <span>Exclusive Member-Only Room &amp; Dining Discounts</span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span>Priority Suite Allocation &amp; Late Check-Out</span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span>Instant Digital Key &amp; Contactless Experience</span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span>Direct Communication with Hotel Management</span>
            </li>
          </ul>

          {/* Testimonial Quote Card */}
          <div className="auth-testimonial-box">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              "From the personalized greeting to the exquisite dining, Paradise Hotel redefined hospitality in Ethiopia."
            </p>
            <div className="testimonial-author">— Luxury Travel Ethiopia Review</div>
          </div>
        </div>

        {/* Right Side: Clean Registration Form */}
        <div className="auth-form-side">
          <div className="form-eyebrow">COMPLIMENTARY REGISTRATION</div>
          <h2 className="form-main-title">Create Your Paradise Account</h2>
          <p className="form-main-subtitle">
            Enter your details below to become a registered luxury guest
          </p>

          <form onSubmit={handleSubmit} className="auth-clean-form">
            <div className="clean-grid-2">
              <div className="form-group-clean">
                <label className="clean-label">First Name <span className="req">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  className="clean-input"
                  value={formData.firstName}
                  onChange={onNameChange('firstName')}
                  placeholder="e.g. Abebe"
                  required
                />
              </div>

              <div className="form-group-clean">
                <label className="clean-label">Last Name <span className="req">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  className="clean-input"
                  value={formData.lastName}
                  onChange={onNameChange('lastName')}
                  placeholder="e.g. Kebede"
                  required
                />
              </div>
            </div>

            <div className="clean-grid-2">
              <div className="form-group-clean">
                <label className="clean-label">
                  <span>✉️</span> Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="clean-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="form-group-clean">
                <label className="clean-label">
                  <span>📱</span> Phone Number <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="clean-input"
                  value={formData.phone}
                  onChange={onPhoneChange}
                  placeholder="0912345678"
                  required
                />
              </div>
            </div>

            <div className="clean-grid-2">
              <div className="form-group-clean">
                <label className="clean-label">Password <span className="req">*</span> (8+ chars)</label>
                <div className="input-wrap-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="clean-input with-toggle"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={8}
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

              <div className="form-group-clean">
                <label className="clean-label">Confirm Password <span className="req">*</span></label>
                <div className="input-wrap-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="clean-input with-toggle"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-gold-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Luxury Account...' : '➔ Create Luxury Account'}
            </button>
          </form>

          {/* Separator */}
          <div className="auth-or-separator">
            <span className="sep-line" />
            <span className="sep-text">OR REGISTER WITH</span>
            <span className="sep-line" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="google-clean-btn"
            onClick={() => toast('Select Google sign-in on the Sign In page', { icon: 'ℹ️' })}
          >
            <svg className="google-svg" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Bottom Nav */}
          <div className="auth-bottom-nav">
            <span>Already have an account? </span>
            <Link to="/login" className="bottom-gold-link">
              Sign In to Your Account ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
