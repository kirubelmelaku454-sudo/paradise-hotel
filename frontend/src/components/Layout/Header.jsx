import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { LanguageContext } from '../../context/LanguageContext';
import NotificationBell from '../NotificationBell';
import LuxuryLogo from '../Common/LuxuryLogo';
import LiveWeatherWidget from '../Common/LiveWeatherWidget';
import toast from 'react-hot-toast';

const Header = ({ sidebarOpen, onSidebarToggle }) => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme, isDark } = useContext(ThemeContext);
    const { currency, toggleCurrency } = useContext(CurrencyContext);
    const { lang, setLang, t, languages } = useContext(LanguageContext);

    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);
    const langRef = useRef(null);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
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

    const getInitials = () => {
        if (!user) return '?';
        const first = user.first_name || user.firstName || '';
        const last = user.last_name || user.lastName || '';
        return (first[0] || '') + (last[0] || first[1] || '');
    };

    const currentLangObj = languages.find(l => l.code === lang) || languages[0];

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="site-header luxury-header">
            {/* Left: Mobile Toggle & Brand Logo */}
            <div className="header-left">
                {onSidebarToggle && (
                    <button
                        type="button"
                        className="header-sidebar-toggle"
                        onClick={onSidebarToggle}
                        title="Toggle Navigation"
                    >
                        <span>☰</span>
                    </button>
                )}
                <Link to="/home" className="header-logo" style={{ textDecoration: 'none' }} title="Paradise Hotel - Home">
                    <LuxuryLogo size="medium" />
                </Link>
            </div>

            {/* Center/Nav: Core Links */}
            <nav className="header-nav-links">
                <Link to="/home" className="header-link">{t('home', 'Home')}</Link>
                <Link to="/rooms" className="header-link">{t('reserveRooms', 'Rooms')}</Link>
                <Link to="/reserve-desk" className="header-link">{t('reserveDesk', 'Desks')}</Link>
                <Link to="/order-food" className="header-link">{t('orderFood', 'Dining')}</Link>
                <Link to="/gallery" className="header-link">{t('gallery', 'Gallery')}</Link>
                <Link to="/discounts" className="header-link">{t('discounts', 'Discounts')}</Link>
                <Link to="/about" className="header-link">{t('about', 'About')}</Link>
                <Link to="/contact" className="header-link">{t('contact', 'Contact')}</Link>
            </nav>

            {/* Right: Actions, Controls & Profile */}
            <div className="header-actions">
                {/* 0. Live Weather & Mountain Forecast Pill */}
                <LiveWeatherWidget />

                {/* 1. Currency Switcher Pill */}
                <button
                    type="button"
                    className="header-control-pill currency-pill"
                    onClick={toggleCurrency}
                    title="Toggle Currency (ETB / USD)"
                >
                    <span className="control-flag">{currency === 'USD' ? '💵' : '🇪🇹'}</span>
                    <strong className="control-label">{currency}</strong>
                </button>

                {/* 2. Language Selector Dropdown */}
                <div className="header-lang-wrapper" ref={langRef}>
                    <button
                        type="button"
                        className="header-control-pill lang-pill"
                        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                        title="Change Language"
                    >
                        <span className="control-flag">{currentLangObj.flag}</span>
                        <span className="control-label">{currentLangObj.code.toUpperCase()}</span>
                        <span className="control-caret">▾</span>
                    </button>

                    {langDropdownOpen && (
                        <div className="header-dropdown lang-menu animate-fade-in">
                            <div className="dropdown-title">Select Language / ቋንቋ ይምረጡ</div>
                            {languages.map((l) => (
                                <button
                                    key={l.code}
                                    type="button"
                                    className={`lang-option ${lang === l.code ? 'active' : ''}`}
                                    onClick={() => {
                                        setLang(l.code);
                                        setLangDropdownOpen(false);
                                        toast.success(`🌐 ${l.native} (${l.name})`);
                                    }}
                                >
                                    <span className="lang-flag">{l.flag}</span>
                                    <div className="lang-text-wrap">
                                        <div className="lang-native">{l.native}</div>
                                        <div className="lang-name">{l.name}</div>
                                    </div>
                                    {lang === l.code && <span className="lang-check">✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Dark/Light Mode Toggle */}
                <button
                    type="button"
                    className="header-control-pill theme-pill"
                    onClick={toggleTheme}
                    title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                >
                    <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
                    <span className="control-label hide-mobile">
                        {isDark ? t('themeLight', 'Light') : t('themeDark', 'Dark')}
                    </span>
                </button>

                {/* 4. Notifications */}
                {user && <NotificationBell />}

                {/* 5. User Profile / Sign In */}
                {user ? (
                    <div
                        className={`header-user ${dropdownOpen ? 'open' : ''}`}
                        ref={dropdownRef}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="header-avatar">
                            {user.profile_image ? (
                                <img
                                    src={user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:5000${user.profile_image}`}
                                    alt="Profile"
                                />
                            ) : (
                                <span>{getInitials().toUpperCase() || '?'}</span>
                            )}
                        </div>
                        <div className="header-welcome hide-mobile">
                            <span className="welcome-sub">{t('welcome', 'Welcome')},</span>
                            <span className="welcome-name">
                                {(user.first_name || user.firstName || '').trim()
                                    || (user.fullName || user.full_name || '').trim().split(/\s+/)[0]
                                    || (user.username && !String(user.username).includes('@') ? user.username : '')
                                    || t('guest', 'Guest')}
                            </span>
                        </div>
                        <span className="header-caret">▾</span>

                        {dropdownOpen && (
                            <div className="header-dropdown profile-menu animate-fade-in">
                                <div className="dropdown-user-badge">
                                    <div className="badge-role">{(user.role || 'customer').toUpperCase()}</div>
                                    <div className="badge-email">{user.email || user.username}</div>
                                </div>
                                <hr />
                                <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                                    <span>👤</span> {t('profile', 'Update Profile')}
                                </Link>
                                <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)}>
                                    <span>📊</span> {t('dashboard', 'Dashboard')}
                                </Link>
                                {user.role === 'customer' && (
                                    <Link to="/my-accounts" onClick={() => setDropdownOpen(false)}>
                                        <span>🏦</span> {t('myAccounts', 'My Accounts')}
                                    </Link>
                                )}
                                <hr />
                                <button type="button" onClick={handleLogout} className="logout-btn">
                                    <span>🚪</span> {t('logout', 'Logout')}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="header-auth-btns">
                        <Link to="/login">
                            <button type="button" className="header-btn header-btn-gold">
                                🔑 {t('signIn', 'Sign In')}
                            </button>
                        </Link>
                        <Link to="/register" className="hide-mobile">
                            <button type="button" className="header-btn header-btn-outline">
                                {t('register', 'Register')}
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
