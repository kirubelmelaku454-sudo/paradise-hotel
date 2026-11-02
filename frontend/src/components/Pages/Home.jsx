import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { LanguageContext } from '../../context/LanguageContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import FAQSection from '../Common/FAQSection';
import TypewriterText from '../Common/TypewriterText';

const Home = () => {
    const { t } = useContext(LanguageContext);
    const { formatPrice } = useContext(CurrencyContext);

    const [stats, setStats] = useState({ rooms: 0, testimonials: [] });
    const [loading, setLoading] = useState(true);
    const [hasDiscount, setHasDiscount] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const videoRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomsRes, commentsRes, discRes] = await Promise.all([
                    api.get('/rooms/available').catch(() => ({ data: { rooms: [] } })),
                    api.get('/comments/approved').catch(() => ({ data: { comments: [] } })),
                    api.get('/food/discounts/active').catch(() => ({ data: { hasDiscount: false } })),
                ]);
                setStats({
                    rooms: roomsRes.data?.rooms?.length || 0,
                    testimonials: commentsRes.data?.comments || [],
                });
                setHasDiscount(!!(discRes.data?.hasDiscount || (discRes.data?.discounts || []).length));
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleAudio = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    return (
        <div className="home-page full-bleed-home">
            {/* Cinematic 100% Full-Screen Edge-to-Edge Hero Video Banner */}
            <section className="home-hero-full-screen">
                {/* Background Video */}
                <video
                    ref={videoRef}
                    className="hero-video-full-screen"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    preload="auto"
                >
                    <source src="/paradise.mp4" type="video/mp4" />
                </video>

                {/* Dark Vignette & Gold Atmospheric Overlay */}
                <div className="hero-video-overlay" />

                {/* Audio Toggle Button */}
                <button
                    type="button"
                    className="hero-video-audio-btn"
                    onClick={toggleAudio}
                    title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
                >
                    {isMuted ? t('soundOff', '🔇 Sound Off') : t('soundOn', '🔊 Sound On')}
                </button>

                {/* Hero Foreground Content */}
                <div className="hero-foreground-content">
                    <div className="hero-crest-wrap">
                        <LuxuryLogo size="large" showText={false} />
                    </div>

                    <div className="luxury-badge">{t('heroBadge', '👑 5-STAR LUXURY HOSPITALITY IN DEBRE MARKOS')}</div>
                    
                    <h1 className="home-hero-title">
                        {t('heroTitleMain', 'Experience Unrivaled Comfort at')}{' '}
                        <span className="gold-text">
                            <TypewriterText text="Paradise Hotel" speed={85} delay={350} />
                        </span>
                    </h1>
                    
                    <p className="home-hero-sub">
                        {t('heroSubtitle', 'Debre Markos, Amhara Region, Ethiopia · Executive Accommodation, Gourmet Dining & Co-Working Desks')}
                    </p>

                    {hasDiscount && (
                        <div className="hero-discount-pill">
                            <Link to="/discounts">
                                🏷️ {t('heroOffersActive', 'Exclusive Offers Active: View special seasonal rates on Rooms, Dining & Desks →')}
                            </Link>
                        </div>
                    )}

                    <div className="hero-cta-group">
                        <Link to="/rooms" className="btn btn-luxury-gold btn-large">
                            🛏️ {t('bookLuxuryRoom', 'Book a Luxury Room')}
                        </Link>
                        <Link to="/reserve-desk" className="btn btn-luxury-outline btn-large hero-btn-light">
                            🍽️ {t('reserveDiningDesk', 'Reserve Dining Desk')}
                        </Link>
                        <Link to="/order-food" className="btn btn-luxury-outline btn-large hero-btn-light">
                            🍕 {t('exploreCuisine', 'Explore Cuisine')}
                        </Link>
                    </div>

                    {/* Quick Highlights Banner */}
                    <div className="hero-stats-bar">
                        <div className="hero-stat-box">
                            <span className="stat-num">{loading ? '...' : stats.rooms}</span>
                            <span className="stat-desc">{t('roomsReadyAvailable', 'Rooms Ready & Available')}</span>
                        </div>
                        <div className="hero-stat-box">
                            <span className="stat-num">24/7</span>
                            <span className="stat-desc">{t('frontDeskConcierge', 'Front Desk & Concierge')}</span>
                        </div>
                        <div className="hero-stat-box">
                            <span className="stat-num">ETB &amp; USD</span>
                            <span className="stat-desc">{t('multiCurrencyAccepted', 'Multi-Currency Accepted')}</span>
                        </div>
                        <div className="hero-stat-box">
                            <span className="stat-num">4.9 ★</span>
                            <span className="stat-desc">{t('guestSatisfactionScore', 'Guest Satisfaction Score')}</span>
                        </div>
                    </div>
                </div>

                {/* Smooth Scroll Indicator */}
                <div className="hero-scroll-indicator" onClick={() => window.scrollTo({ top: window.innerHeight - 70, behavior: 'smooth' })}>
                    <span className="scroll-text">{t('details', 'Explore Services & Amenities')}</span>
                    <span className="scroll-chevron">⌄</span>
                </div>
            </section>

            {/* Padded Container for Sections Below Full-Screen Hero */}
            <div className="home-body-content">
                {/* Core Services Section */}
                <div className="home-services-section">
                <div className="section-title-wrap text-center">
                    <span className="section-eyebrow">{t('distinguishedServices', 'DISTINGUISHED SERVICES')}</span>
                    <h2>{t('servicesHeadline', 'Tailored for Leisure, Business & Dining')}</h2>
                    <p className="section-desc">{t('servicesSubheadline', 'Everything you need for an unforgettable experience in Debre Markos.')}</p>
                </div>

                <div className="services-luxury-grid">
                    <Link to="/rooms" className="service-card luxury-card">
                        <div className="service-card-top">
                            <span className="service-icon">🛏️</span>
                            <span className="service-badge">{t('roomBooking', 'Luxury Suites')}</span>
                        </div>
                        <h3>{t('luxurySuitesTitle', 'Executive & Deluxe Rooms')}</h3>
                        <p>{t('luxurySuitesDesc', 'Comfortable king-size beds, en-suite bathrooms, high-speed WiFi, panoramic views, and 24-hour room service.')}</p>
                        <div className="service-card-footer">
                            <span className="explore-link">{t('exploreRooms', 'Explore Rooms →')}</span>
                        </div>
                    </Link>

                    <Link to="/reserve-desk" className="service-card luxury-card">
                        <div className="service-card-top">
                            <span className="service-icon">🍽️</span>
                            <span className="service-badge">{t('freePerkBadge', '100% Free')}</span>
                        </div>
                        <h3>{t('desksTitle', 'Dining & Co-Working Desks')}</h3>
                        <p>{t('desksDesc', 'Comfortable work & dining tables with power outlets. Order food and your desk reservation is 100% Free!')}</p>
                        <div className="service-card-footer">
                            <span className="explore-link">{t('reserveADesk', 'Reserve a Desk →')}</span>
                        </div>
                    </Link>

                    <Link to="/order-food" className="service-card luxury-card">
                        <div className="service-card-top">
                            <span className="service-icon">🍕</span>
                            <span className="service-badge">{t('foodOrdering', 'Gourmet')}</span>
                        </div>
                        <h3>{t('cuisineTitle', 'Authentic Ethiopian & International Cuisine')}</h3>
                        <p>{t('cuisineDesc', 'Indulge in Doro Wat, Special Kitfo, Beyaynetu, pasta, steaks, burgers, fresh juices, and traditional Jebena Buna.')}</p>
                        <div className="service-card-footer">
                            <span className="explore-link">{t('viewFullMenu', 'View Full Menu →')}</span>
                        </div>
                    </Link>

                    <Link to="/contact" className="service-card luxury-card">
                        <div className="service-card-top">
                            <span className="service-icon">📞</span>
                            <span className="service-badge">{t('available247Badge', '24/7 Available')}</span>
                        </div>
                        <h3>{t('conciergeSupportTitle', 'Concierge & Direct Support')}</h3>
                        <p>{t('conciergeSupportDesc', 'Connect instantly with our reception, management, and concierge team with real-time response and direct reply.')}</p>
                        <div className="service-card-footer">
                            <span className="explore-link">{t('getInTouch', 'Get in Touch →')}</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Testimonials Section */}
            {stats.testimonials.length > 0 && (
                <div className="home-testimonials-section">
                    <div className="section-title-wrap text-center">
                        <span className="section-eyebrow">{t('guestExperiences', 'GUEST EXPERIENCES')}</span>
                        <h2>{t('whatGuestsSay', 'What Our Guests Say About Paradise Hotel')}</h2>
                    </div>

                    <div className="testimonials-luxury-grid">
                        {stats.testimonials.slice(0, 4).map((tItem, idx) => (
                            <div key={idx} className="testimonial-card luxury-card">
                                <div className="stars">★★★★★</div>
                                <p className="quote">"{tItem.feedback}"</p>
                                <div className="author-wrap">
                                    <div className="author-avatar">{(tItem.username || 'G')[0].toUpperCase()}</div>
                                    <div>
                                        <div className="author-name">{tItem.username || 'Verified Guest'}</div>
                                        <div className="author-role">{tItem.job_title || 'Debre Markos Visitor'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Frequently Asked Questions (FAQ) Section */}
            <FAQSection />

            {/* Call to Action Banner */}
            <div className="home-cta-box luxury-card">
                <div>
                    <h2>{t('readyToExperience', 'Ready to Experience Paradise in Debre Markos?')}</h2>
                    <p>{t('readyToExperienceSub', 'Book online seamlessly with CBE Birr, Telebirr, or International Currency.')}</p>
                </div>
                <div className="cta-actions">
                    <Link to="/rooms" className="btn btn-luxury-gold btn-large">
                        {t('bookYourStayNow', 'Book Your Stay Now')}
                    </Link>
                    <Link to="/contact" className="btn btn-luxury-outline btn-large">
                        {t('contactConcierge', 'Contact Concierge')}
                    </Link>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Home;
