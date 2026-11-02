import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';

export default function MobileBottomNav() {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.username === 'housekeeping' || user.role === 'housekeeping') return '/dashboard/housekeeping';
    if (user.role === 'receptionist') return '/dashboard/receptionist';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'manager') return '/dashboard/manager';
    return '/dashboard/customer';
  };

  const navItems = [
    { icon: '🏠', label: t('home', 'Home'), path: '/home' },
    { icon: '🛏️', label: t('rooms', 'Rooms'), path: '/rooms' },
    { icon: '🍕', label: t('dining', 'Dining'), path: '/order-food' },
    { icon: '📊', label: t('bookings', 'Bookings'), path: getDashboardPath() },
    { icon: '👤', label: user ? t('profile', 'Profile') : t('login', 'Sign In'), path: user ? '/profile' : '/login' }
  ];

  return (
    <nav className="mobile-bottom-nav no-print" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path !== '/home' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={idx}
              to={item.path}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
              {isActive && <span className="mobile-nav-active-dot" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
