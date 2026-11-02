import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { LanguageContext } from '../../context/LanguageContext';
import TypewriterText from '../Common/TypewriterText';

const FALLBACK = {
    about_title: 'About Paradise Hotel',
    about_body:
        'Paradise Hotel (also known as Centera Hotel) is the premier destination for luxury accommodation, dining, and executive workspace in Debre Markos, Amhara Region, Ethiopia. Built to international standards, we combine warm Ethiopian hospitality with world-class comfort for tourists, business travelers, and local guests.',
    about_location_name: 'Paradise Hotel (Centera Hotel)',
    about_address: 'Paradise Hotel, Debre Markos, Amhara Region, Ethiopia',
    about_map_query: 'Paradise Hotel, Debre Markos, Ethiopia',
    about_extra: 'Plus Code: 8PQJ+4F2 · 24/7 Front Desk & Concierge · High-speed WiFi',
};

const AMENITIES = [
    {
        icon: '🛏️',
        title: 'Executive & Deluxe Suites',
        desc: 'Premium king & queen beds, en-suite bathrooms, HD television, work desk, and 24-hour room service.',
    },
    {
        icon: '🍽️',
        title: 'Gourmet Restaurant & Bar',
        desc: 'Traditional Ethiopian feasts (Doro Wat, Kitfo, Beyaynetu), international specialties, and authentic Jebena Buna.',
    },
    {
        icon: '💼',
        title: 'Co-Working & Dining Desks',
        desc: 'Spacious workspace tables with power outlets, high-speed fiber internet, and complimentary desk booking with meal orders.',
    },
    {
        icon: '🛡️',
        title: '24/7 Concierge & Security',
        desc: 'Round-the-clock reception team, electronic security, safe luggage storage, and personalized guest assistance.',
    },
    {
        icon: '🚗',
        title: 'Secure Parking & Transport',
        desc: 'Gated parking with 24-hour guard coverage and shuttle coordination for travelers arriving in Debre Markos.',
    },
    {
        icon: '☕',
        title: 'Highland Coffee Experience',
        desc: 'Freshly roasted Ethiopian organic coffee ceremonies prepared daily by our traditional brewmasters.',
    },
];

export default function About() {
    const { t } = useContext(LanguageContext);
    const [content, setContent] = useState(FALLBACK);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/site/content')
            .then((res) => {
                if (res.data?.content) setContent({ ...FALLBACK, ...res.data.content });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const placeName = (content.about_location_name || FALLBACK.about_location_name).trim();
    const address = (content.about_address || FALLBACK.about_address).trim();
    const mapQuery = (content.about_map_query || `${placeName}, Debre Markos, Ethiopia`).trim();

    const mapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
    const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

    return (
        <div className="about-page luxury-page-container">
            {/* Hero Section */}
            <div className="about-hero-banner">
                <div className="luxury-badge">👑 5-STAR HOSPITALITY IN DEBRE MARKOS</div>
                <h1 className="about-hero-title">
                    <TypewriterText text={t('aboutTitle', 'About Paradise Hotel')} speed={70} delay={250} />
                </h1>
                <p className="about-hero-sub">
                    {t('aboutSubtitle', 'Luxury, Comfort, and Authentic Ethiopian Hospitality')}
                </p>
                <div className="about-hero-actions">
                    <Link to="/rooms" className="btn btn-luxury-gold">
                        🛏️ {t('reserveRooms', 'Reserve a Room')}
                    </Link>
                    <Link to="/contact" className="btn btn-luxury-outline">
                        📞 {t('contact', 'Contact Concierge')}
                    </Link>
                </div>
            </div>

            {/* Story & Heritage Section */}
            <div className="about-story-section">
                <div className="story-card luxury-card">
                    <div className="story-header">
                        <span className="story-icon">🏛️</span>
                        <div>
                            <h2>Our Story &amp; Commitment</h2>
                            <span className="story-meta">Debre Markos, Amhara Region · Also known as Centera Hotel</span>
                        </div>
                    </div>
                    <div className="story-body">
                        <p>{content.about_body || FALLBACK.about_body}</p>
                        <p>
                            Nestled in the historic city of Debre Markos, Paradise Hotel offers a tranquil retreat whether you are traveling across Ethiopia, visiting for business, or hosting executive meetings. Our staff is dedicated to ensuring your stay is seamless, memorable, and filled with exceptional comfort.
                        </p>
                    </div>

                    <div className="story-stats-grid">
                        <div className="story-stat-item">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">Front Desk &amp; Reception</span>
                        </div>
                        <div className="story-stat-item">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Power &amp; Backup Water</span>
                        </div>
                        <div className="story-stat-item">
                            <span className="stat-number">ETB &amp; $</span>
                            <span className="stat-label">Multi-Currency Accepted</span>
                        </div>
                        <div className="story-stat-item">
                            <span className="stat-number">4.9★</span>
                            <span className="stat-label">Guest Satisfaction</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Amenities Grid */}
            <div className="about-amenities-section">
                <div className="section-title-wrap text-center">
                    <span className="section-eyebrow">WORLD-CLASS AMENITIES</span>
                    <h2>Crafted For Your Utmost Comfort</h2>
                    <p className="section-desc">From executive accommodations to authentic local flavors, experience the finest services.</p>
                </div>

                <div className="amenities-grid">
                    {AMENITIES.map((item, idx) => (
                        <div key={idx} className="amenity-card luxury-card">
                            <div className="amenity-icon-box">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Location & Interactive Google Maps Card */}
            <div className="about-location-section">
                <div className="location-card luxury-card">
                    <div className="location-content">
                        <span className="section-eyebrow">📍 LOCATION &amp; ACCESS</span>
                        <h2>Find Us in Debre Markos</h2>
                        <p className="location-address">
                            <strong>{placeName}</strong>
                            <br />
                            {address}
                        </p>
                        {content.about_extra && (
                            <p className="location-extra">{content.about_extra}</p>
                        )}
                        <p className="location-tip">
                            Conveniently located with direct road access, secure vehicle parking, and within minutes of central Debre Markos landmarks.
                        </p>

                        <div className="location-buttons">
                            <a
                                href={mapsDirUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-luxury-gold"
                            >
                                🗺️ Get Driving Directions on Google Maps
                            </a>
                            <a
                                href={mapsSearchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-luxury-outline"
                            >
                                📍 View Location Pin
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="about-cta-banner">
                <h2>Ready for an Unforgettable Stay?</h2>
                <p>Book your preferred room or dining desk online with instant confirmation.</p>
                <div className="cta-buttons">
                    <Link to="/rooms" className="btn btn-luxury-gold">Browse Rooms</Link>
                    <Link to="/reserve-desk" className="btn btn-luxury-outline">Reserve Dining Desk</Link>
                    <Link to="/contact" className="btn btn-luxury-outline">Contact Reception</Link>
                </div>
            </div>
        </div>
    );
}
