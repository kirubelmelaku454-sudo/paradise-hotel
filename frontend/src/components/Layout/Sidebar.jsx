import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import api, { getMediaUrl } from '../../api';

const getNavItems = (role, hasDiscount, t, user) => {
    const discountItem = [
        { icon: '🏷️', label: t('navOffers', 'Offers'), path: '/discounts' }
    ];

    const customer = [
        { icon: '🏠', label: t('navHome', 'Home'), path: '/home' },
        { icon: '🛏️', label: t('navRooms', 'Rooms'), path: '/rooms' },
        { icon: '🍽️', label: t('navDesks', 'Dining Desks'), path: '/reserve-desk' },
        { icon: '🍕', label: t('navDining', 'Dining'), path: '/order-food' },
        { icon: '🖼️', label: t('navGallery', '3D Tour & Gallery'), path: '/gallery' },
        ...discountItem,
        { icon: '📊', label: t('myBookings', 'My Bookings'), path: '/dashboard/customer' },
        { icon: 'ℹ️', label: t('navAbout', 'About Hotel'), path: '/about' },
        { icon: '📨', label: t('navContact', 'Contact'), path: '/contact' },
        { icon: '💬', label: t('feedback', 'Feedback'), path: '/feedback' },
        { icon: '⚠️', label: t('suggestions', 'Give Suggestion'), path: '/report-problem' },
    ];

    const customerLoggedIn = [
        { icon: '🏠', label: t('navHome', 'Home'), path: '/home' },
        { icon: '🛏️', label: t('navRooms', 'Rooms'), path: '/rooms' },
        { icon: '🍽️', label: t('navDesks', 'Dining Desks'), path: '/reserve-desk' },
        { icon: '🍕', label: t('navDining', 'Dining'), path: '/order-food' },
        { icon: '🖼️', label: t('navGallery', '3D Tour & Gallery'), path: '/gallery' },
        ...discountItem,
        { icon: '📊', label: t('myBookings', 'My Bookings'), path: '/dashboard/customer' },
        { icon: '🏦', label: t('myAccounts', 'My Accounts'), path: '/my-accounts' },
        { icon: 'ℹ️', label: t('navAbout', 'About Hotel'), path: '/about' },
        { icon: '📨', label: t('navContact', 'Contact'), path: '/contact' },
        { icon: '💬', label: t('feedback', 'Feedback'), path: '/feedback' },
        { icon: '⚠️', label: t('suggestions', 'Give Suggestion'), path: '/report-problem' },
    ];

    const admin = [
        { icon: '📊', label: 'Revenue & Analytics', path: '/dashboard/admin', query: 'analytics' },
        { icon: '👥', label: 'Users Management', path: '/dashboard/admin', query: 'users' },
        { icon: '🛏️', label: t('roomBooking', 'Rooms Management'), path: '/dashboard/admin', query: 'rooms' },
        { icon: '🍽️', label: t('deskBooking', 'Desks Management'), path: '/dashboard/admin', query: 'desks' },
        { icon: '🍕', label: t('foodOrdering', 'Food Menu Management'), path: '/dashboard/admin', query: 'foods' },
        { icon: '🏷️', label: t('discounts', 'Discounts & Offers'), path: '/dashboard/admin', query: 'discounts' },
        { icon: '📜', label: 'Audit & Activity Logs', path: '/dashboard/admin', query: 'logs' },
        { icon: '⚙️', label: 'Hotel System Settings', path: '/dashboard/admin', query: 'settings' },
        { icon: '📨', label: t('messagesAndInquiries', 'Messages & Inquiries'), path: '/dashboard/admin', query: 'messages' },
        { icon: '💬', label: t('feedback', 'Customer Feedback'), path: '/dashboard/admin', query: 'feedback' },
    ];

    const manager = [
        { icon: '🏠', label: t('home', 'Home'), path: '/dashboard/customer' },
        { icon: '📨', label: t('messagesAndInquiries', 'Messages & Inquiries'), path: '/dashboard/manager', query: 'messages' },
        { icon: '👥', label: 'Employees', path: '/dashboard/manager', query: 'employees' },
        { icon: '🛏️', label: t('roomBooking', 'Rooms'), path: '/dashboard/manager', query: 'rooms' },
        { icon: '🍽️', label: t('deskBooking', 'Desks'), path: '/dashboard/manager', query: 'desks' },
        { icon: '🍕', label: t('foodOrdering', 'Food Menu'), path: '/dashboard/manager', query: 'foods' },
        { icon: '👤', label: 'User Management', path: '/dashboard/manager', query: 'users' },
        { icon: '🏷️', label: t('discounts', 'Discounts'), path: '/dashboard/manager', query: 'discounts' },
        { icon: '💰', label: 'Cancellation Penalty', path: '/dashboard/manager', query: 'penalties' },
        { icon: '📋', label: 'Reports', path: '/dashboard/manager', query: 'reports' },
        { icon: '⚠️', label: t('suggestions', 'Customer Suggestions'), path: '/dashboard/manager', query: 'customer-reports' },
        { icon: '📄', label: `${t('about', 'About')} & ${t('contact', 'Contact')}`, path: '/dashboard/manager', query: 'pages' },
    ];

    const receptionist = [
        { icon: '🏠', label: t('home', 'Home'), path: '/dashboard/receptionist' },
        { icon: '📨', label: t('messagesAndInquiries', 'Messages & Inquiries'), path: '/dashboard/receptionist', query: 'messages' },
        { icon: '💳', label: 'Payments', path: '/dashboard/receptionist', query: 'payments' },
        { icon: '🛏️', label: t('roomBooking', 'Rooms'), path: '/dashboard/receptionist', query: 'rooms' },
        { icon: '🧹', label: 'Housekeeping (ጽዳት)', path: '/dashboard/receptionist', query: 'housekeeping' },
        { icon: '📋', label: 'Police Manifest (የፖሊስ መዝገብ)', path: '/dashboard/receptionist', query: 'manifest' },
        { icon: '👨‍🍳', label: 'Kitchen Display (KDS)', path: '/dashboard/receptionist', query: 'kds' },
        { icon: '🍽️', label: t('deskBooking', 'Desks'), path: '/dashboard/receptionist', query: 'desks' },
        { icon: '🍕', label: t('foodOrdering', 'Food Orders'), path: '/dashboard/receptionist', query: 'food' },
        { icon: '💵', label: 'Shift & Till Audit', path: '/dashboard/receptionist', query: 'shift' },
        { icon: '👥', label: 'Customers', path: '/dashboard/receptionist', query: 'customers' },
        { icon: '🔍', label: t('search', 'Search'), path: '/dashboard/receptionist', query: 'search' },
    ];

    const housekeeping = [
        { icon: '🧹', label: 'Housekeeping Center', path: '/dashboard/housekeeping' },
        { icon: '🛏️', label: t('roomBooking', 'Rooms Directory'), path: '/rooms' },
        { icon: '👤', label: 'My Profile', path: '/profile' },
    ];

    if (user?.username === 'housekeeping' || role === 'housekeeping') return housekeeping;
    if (!role) return customer;
    switch (role) {
        case 'admin': return admin;
        case 'manager': return manager;
        case 'receptionist': return receptionist;
        case 'customer': return customerLoggedIn;
        default: return customer;
    }
};

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useContext(AuthContext);
    const { t, lang, setLang, languages } = useContext(LanguageContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [hasDiscount, setHasDiscount] = useState(false);

    const handleLogout = () => {
        logout();
        if (onClose) onClose();
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (!user) return '/dashboard/customer';
        if (user.username === 'housekeeping' || user.role === 'housekeeping') {
            return '/dashboard/housekeeping';
        }
        switch (user.role) {
            case 'admin': return '/dashboard/admin';
            case 'manager': return '/dashboard/manager';
            case 'receptionist': return '/dashboard/receptionist';
            default: return '/dashboard/customer';
        }
    };

    const role = user?.role || null;
    const isCustomerView = !role || role === 'customer';

    useEffect(() => {
        if (!isCustomerView) return undefined;
        let cancelled = false;
        const load = () => {
            api.get('/food/discounts/active')
                .then((res) => {
                    if (cancelled) return;
                    setHasDiscount(!!(res.data?.hasDiscount || (res.data?.discounts || []).length));
                })
                .catch(() => {
                    if (!cancelled) setHasDiscount(false);
                });
        };
        load();
        const tInterval = setInterval(load, 60000);
        return () => {
            cancelled = true;
            clearInterval(tInterval);
        };
    }, [isCustomerView]);

    const navItems = getNavItems(role, hasDiscount, t, user);

    const isActive = (item) => {
        if (item.query) {
            const currentTab = searchParams.get('tab');
            return location.pathname === item.path && currentTab === item.query;
        }
        return location.pathname === item.path;
    };

    return (
        <aside className={`site-sidebar luxury-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <Link to="/home" className="sidebar-brand" onClick={onClose} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <LuxuryLogo size="small" showText={false} />
                    <div>
                        <div className="sidebar-brand-title">Paradise Hotel</div>
                        <div className="sidebar-brand-badge">{role ? role.toUpperCase() : 'GUEST'}</div>
                    </div>
                </Link>
                {onClose && (
                    <button type="button" className="sidebar-close-btn" onClick={onClose}>
                        ✕
                    </button>
                )}
            </div>

            {/* Mobile User Profile & Instant Logout Card */}
            {user ? (
                <div className="sidebar-user-card">
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-avatar">
                            {user.profile_image ? (
                                <img src={getMediaUrl(user.profile_image)} alt="Profile" />
                            ) : (
                                <span>{(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}</span>
                            )}
                        </div>
                        <div className="sidebar-user-details">
                            <div className="sidebar-user-name">
                                {(user.first_name || user.firstName || '').trim()
                                    ? `${user.first_name || user.firstName} ${user.last_name || user.lastName || ''}`.trim()
                                    : (user.username || 'VIP Guest')}
                            </div>
                            <div className="sidebar-user-role">
                                {user.role ? user.role.toUpperCase() : 'GUEST'}
                            </div>
                            <div className="sidebar-user-email">{user.email || user.username}</div>
                        </div>
                    </div>

                    <div className="sidebar-user-actions">
                        <Link to="/profile" className="sidebar-user-link" onClick={onClose}>
                            <span>👤</span> {t('profile', 'Profile')}
                        </Link>
                        <Link to={getDashboardLink()} className="sidebar-user-link" onClick={onClose}>
                            <span>📊</span> {t('dashboard', 'Dashboard')}
                        </Link>
                    </div>

                    <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
                        <span>🚪</span>
                        <span>{t('logout', 'Logout')}</span>
                    </button>
                </div>
            ) : (
                <div className="sidebar-guest-card">
                    <div className="sidebar-guest-title">👑 Paradise 5-Star Hotel</div>
                    <div className="sidebar-guest-sub">{t('welcome', 'Welcome, Guest!')}</div>
                    <div className="sidebar-guest-btns">
                        <Link to="/login" className="sidebar-guest-btn signin" onClick={onClose}>
                            <span>🔑</span> {t('signIn', 'Sign In')}
                        </Link>
                        <Link to="/register" className="sidebar-guest-btn register" onClick={onClose}>
                            <span>✨</span> {t('register', 'Register')}
                        </Link>
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                <div className="sidebar-section-title">Navigation</div>
                {navItems.map((item, idx) => {
                    const to = item.query ? `${item.path}?tab=${item.query}` : item.path;
                    const active = isActive(item);
                    return (
                        <Link
                            key={idx}
                            to={to}
                            className={`sidebar-nav-item ${active ? 'active' : ''}`}
                            onClick={() => {
                                if (window.innerWidth <= 768 && onClose) onClose();
                            }}
                        >
                            <span className="sidebar-item-icon">{item.icon}</span>
                            <span className="sidebar-item-label">{item.label}</span>
                            {active && <span className="sidebar-active-indicator" />}
                        </Link>
                    );
                })}

                {user && (
                    <div style={{ padding: '14px 10px 6px' }}>
                        <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
                            <span>🚪</span>
                            <span>{t('logout', 'Logout')}</span>
                        </button>
                    </div>
                )}
            </nav>

            <div className="sidebar-footer">
                {/* Multilingual Selector inside Sidebar */}
                <div style={{ padding: '0 8px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                        🌐 Language / ቋንቋ
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {languages.map((l) => (
                            <button
                                key={l.code}
                                type="button"
                                onClick={() => setLang(l.code)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '6px 8px',
                                    borderRadius: 8,
                                    fontSize: 11.5,
                                    fontWeight: lang === l.code ? 700 : 500,
                                    background: lang === l.code ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                    color: lang === l.code ? 'var(--accent)' : '#cbd5e1',
                                    border: lang === l.code ? '1.5px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <span>{l.flag}</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.native}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sidebar-hotel-info">
                    <div className="info-title">📍 Debre Markos</div>
                    <div className="info-sub">Reception 24/7: +251 58 771 0000</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
