import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import api from '../../api';
import toast from 'react-hot-toast';

const API_ORIGIN = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const resolveImage = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : '/' + path}`;
};

const ROLE_BADGES = {
  admin: { label: '🛡️ System Administrator', bg: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c' },
  manager: { label: '👔 General Manager', bg: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6' },
  receptionist: { label: '🛎️ Front Desk Receptionist', bg: 'rgba(52, 152, 219, 0.15)', color: '#2980b9' },
  housekeeping: { label: '🧹 Housekeeping Specialist', bg: 'rgba(39, 174, 96, 0.15)', color: '#27ae60' },
  customer: { label: '👑 5-Star VIP Guest Member', bg: 'rgba(240, 165, 0, 0.15)', color: '#d4af37' }
};

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const isStaff = ['admin', 'manager', 'receptionist', 'housekeeping'].includes(user?.role);

  const [form, setForm] = useState({
    username: user?.username || '',
    firstName: user?.firstName || user?.first_name || '',
    lastName: user?.lastName || user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(resolveImage(user?.profile_image));
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="inside luxury-page-container" style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center', padding: '30px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-dark)' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Please log in to manage your guest profile and security credentials.</p>
      </div>
    );
  }

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (form.newPassword || form.confirmNewPassword || form.currentPassword) {
      if (!form.currentPassword) {
        toast.error('Enter your current password to verify identity');
        return;
      }
      if (form.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (form.newPassword !== form.confirmNewPassword) {
        toast.error('New passwords do not match');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = new FormData();
      if (!isStaff && form.username) payload.append('username', form.username);
      payload.append('firstName', form.firstName || '');
      payload.append('lastName', form.lastName || '');
      payload.append('phone', form.phone || '');
      payload.append('address', form.address || '');
      if (form.newPassword) {
        payload.append('currentPassword', form.currentPassword);
        payload.append('newPassword', form.newPassword);
      }
      if (imageFile) payload.append('profileImage', imageFile);

      let res;
      try {
        res = await api.post('/auth/profile', payload);
      } catch (err1) {
        res = await api.put('/auth/profile', payload);
      }

      if (res.data.success && res.data.user) {
        updateUser(res.data.user);
        try {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (_) {}
        toast.success(res.data.message || 'VIP Profile updated successfully!');
        setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
        setImageFile(null);
        if (res.data.user.profile_image) {
          setPreview(resolveImage(res.data.user.profile_image));
        }
      } else {
        toast.error(res.data.message || 'Failed to update profile');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      if (String(msg).toLowerCase().includes('payment')) {
        toast.error('Profile update failed. Please try again.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const roleInfo = ROLE_BADGES[user.role] || ROLE_BADGES.customer;

  return (
    <div className="inside luxury-page-container" style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px 40px' }}>
      {/* 5-Star Luxury Header */}
      <div className="luxury-header-box text-center" style={{ marginBottom: 24, padding: '28px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <LuxuryLogo size="medium" showText={false} />
        </div>
        <div className="luxury-badge">👑 VIP IDENTITY &amp; ACCOUNT CREDENTIALS</div>
        <h1 className="page-title" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', margin: '6px 0 8px' }}>
          Personal Profile &amp; Security
        </h1>
        <p className="page-subtitle" style={{ fontSize: 14, maxWidth: 540, margin: '0 auto', color: 'var(--text-muted)' }}>
          Manage your contact information, biometric identity picture, and login credentials.
        </p>
      </div>

      <div className="luxury-section-panel" style={{ padding: '30px 28px' }}>
        {/* Profile Card Header with Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(240, 165, 0, 0.2) 0%, rgba(212, 175, 55, 0.08) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2.5px solid var(--accent)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {preview ? (
                <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>
                  {(form.firstName || user.username || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, color: 'var(--text-dark)', fontFamily: 'var(--font-heading)' }}>
                {user.first_name || user.firstName || user.username} {user.last_name || user.lastName || ''}
              </h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                📧 {user.email || 'Member on file'}
              </div>
              <span style={{
                background: roleInfo.bg,
                color: roleInfo.color,
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-block'
              }}>
                {roleInfo.label}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-upload-input"
              className="btn btn-luxury-outline btn-sm"
              style={{ cursor: 'pointer', padding: '8px 16px', display: 'inline-block' }}
            >
              📷 Change Photo
            </label>
            <input
              id="profile-upload-input"
              type="file"
              accept="image/*"
              onChange={handleImagePick}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {!isStaff && (
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                Username:
              </label>
              <input
                className="clean-input"
                value={form.username}
                onChange={handleChange('username')}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                First Name:
              </label>
              <input
                className="clean-input"
                value={form.firstName}
                onChange={handleChange('firstName')}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                Last Name:
              </label>
              <input
                className="clean-input"
                value={form.lastName}
                onChange={handleChange('lastName')}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                Phone Number:
              </label>
              <input
                className="clean-input"
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="+251 9..."
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                Residential Address / City:
              </label>
              <input
                className="clean-input"
                value={form.address}
                onChange={handleChange('address')}
                placeholder="e.g. Debre Markos, Kebele 04"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ margin: '14px 0 6px', paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--text-dark)', fontFamily: 'var(--font-heading)' }}>
              🔑 Security &amp; Password Update (Optional)
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              Leave blank if you do not wish to change your password.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                Current Password:
              </label>
              <input
                type="password"
                className="clean-input"
                value={form.currentPassword}
                onChange={handleChange('currentPassword')}
                autoComplete="current-password"
                placeholder="••••••••"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                New Password:
              </label>
              <input
                type="password"
                className="clean-input"
                value={form.newPassword}
                onChange={handleChange('newPassword')}
                autoComplete="new-password"
                placeholder="••••••••"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                Confirm Password:
              </label>
              <input
                type="password"
                className="clean-input"
                value={form.confirmNewPassword}
                onChange={handleChange('confirmNewPassword')}
                autoComplete="new-password"
                placeholder="••••••••"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-luxury-gold"
            disabled={saving}
            style={{ padding: '13px', fontSize: 14, fontWeight: 800, marginTop: 12 }}
          >
            {saving ? 'Encrypting & Saving...' : '💾 Save Profile & Security Updates'}
          </button>
        </form>
      </div>
    </div>
  );
}
