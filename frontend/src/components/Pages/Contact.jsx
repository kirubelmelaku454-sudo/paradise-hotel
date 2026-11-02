import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import TypewriterText from '../Common/TypewriterText';

const FALLBACK_INFO = {
    contact_phone: '+251 58 771 0000',
    contact_email: 'info@paradisehotel.et',
    contact_address: 'Paradise Hotel, Debre Markos, Amhara, Ethiopia',
    contact_hours: 'Reception: Open 24/7',
    contact_extra: 'Debre Markos, Amhara Region, Ethiopia · Also known as Centera Hotel',
};

const CATEGORIES = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'room', label: 'Room Reservation Inquiry' },
    { value: 'desk', label: 'Desk / Meeting Reservation' },
    { value: 'food', label: 'Dining & Catering Service' },
    { value: 'reception', label: '24/7 Front Desk & Concierge' },
    { value: 'vip', label: 'VIP Services & Protocol' },
];

export default function Contact() {
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);

    const [info, setInfo] = useState(FALLBACK_INFO);
    const [loadingInfo, setLoadingInfo] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        category: 'general',
        subject: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // Past inquiries for logged-in user
    const [myInquiries, setMyInquiries] = useState([]);
    const [loadingMyInquiries, setLoadingMyInquiries] = useState(false);

    useEffect(() => {
        api.get('/site/content')
            .then((res) => {
                if (res.data?.content) setInfo({ ...FALLBACK_INFO, ...res.data.content });
            })
            .catch(() => {})
            .finally(() => setLoadingInfo(false));

        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || '',
                email: user.email || '',
                phone: user.phone || '',
            }));
            fetchMyInquiries();
        }
    }, [user]);

    const fetchMyInquiries = async () => {
        setLoadingMyInquiries(true);
        try {
            const res = await api.get('/contact/messages/my');
            if (res.data?.success) {
                setMyInquiries(res.data.messages || []);
            }
        } catch (err) {
            console.error('Fetch my inquiries error:', err);
        } finally {
            setLoadingMyInquiries(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            toast.error('Please fill in your name, email, subject, and message.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/contact/messages', formData);
            if (res.data?.success) {
                toast.success(t('sendSuccess', 'Your message has been sent successfully! Our hotel reception and management will respond promptly.'));
                setFormData((prev) => ({
                    ...prev,
                    subject: '',
                    message: '',
                    category: 'general',
                }));
                if (user) fetchMyInquiries();
            } else {
                toast.error(res.data?.message || 'Failed to send message.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page luxury-page-container">
            {/* Hero Header */}
            <div className="contact-hero-banner">
                <div className="luxury-badge">📞 CONCIERGE &amp; EXECUTIVE DESK</div>
                <h1 className="contact-hero-title">
                    <TypewriterText text={t('contactTitle', 'Contact Paradise Hotel')} speed={70} delay={250} />
                </h1>
                <p className="contact-hero-sub">
                    {t('contactSubtitle', '24/7 Concierge, Reservations & Executive Hospitality in Debre Markos')}
                </p>
            </div>

            {/* Main Content Layout: Info on Left, Form on Right */}
            <div className="contact-layout-grid">
                {/* Left: Contact Info & Cards */}
                <div className="contact-info-col">
                    <div className="contact-card-box luxury-card">
                        <div className="contact-card-header">
                            <span className="contact-icon">🏨</span>
                            <h3>Paradise Hotel Debre Markos</h3>
                        </div>
                        <p className="contact-tagline">
                            {info.contact_extra || 'Debre Markos, Amhara Region · Also known as Centera Hotel'}
                        </p>

                        <div className="contact-details-list">
                            <div className="contact-detail-item">
                                <span className="item-icon">📍</span>
                                <div>
                                    <strong>Address / Location</strong>
                                    <p>{info.contact_address || FALLBACK_INFO.contact_address}</p>
                                </div>
                            </div>

                            <div className="contact-detail-item">
                                <span className="item-icon">📞</span>
                                <div>
                                    <strong>24/7 Phone &amp; Reception</strong>
                                    <p>
                                        <a href={`tel:${info.contact_phone || FALLBACK_INFO.contact_phone}`}>
                                            {info.contact_phone || FALLBACK_INFO.contact_phone}
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="contact-detail-item">
                                <span className="item-icon">✉️</span>
                                <div>
                                    <strong>Email Inquiries</strong>
                                    <p>
                                        <a href={`mailto:${info.contact_email || FALLBACK_INFO.contact_email}`}>
                                            {info.contact_email || FALLBACK_INFO.contact_email}
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="contact-detail-item">
                                <span className="item-icon">⏰</span>
                                <div>
                                    <strong>Service Hours</strong>
                                    <p>{info.contact_hours || FALLBACK_INFO.contact_hours}</p>
                                </div>
                            </div>
                        </div>

                        <div className="contact-quick-links">
                            <Link to="/about" className="btn btn-luxury-outline w-100">
                                🏛️ View About Us &amp; Hotel Details →
                            </Link>
                        </div>
                    </div>

                    {/* Department Routing Notice */}
                    <div className="routing-notice luxury-card">
                        <span className="notice-icon">⚡</span>
                        <div>
                            <h4>Instant Notification to Hotel Staff</h4>
                            <p>
                                Every message submitted here is dispatched directly to our <strong>General Manager</strong>, <strong>Admin</strong>, and <strong>Front Desk Receptionists</strong>. You will receive direct replies here in your portal and via email.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Interactive Contact & Inquiry Form */}
                <div className="contact-form-col">
                    <div className="contact-form-box luxury-card">
                        <div className="form-header">
                            <span className="section-eyebrow">GET IN TOUCH</span>
                            <h2>Send Us a Message or Inquiry</h2>
                            <p>Fill out the form below and our team will get back to you promptly.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="luxury-form">
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>{t('fullName', 'Full Name')} *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Abebe Kebede"
                                        required
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('emailAddress', 'Email Address')} *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="e.g. abebe@email.com"
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>{t('phoneNumber', 'Phone Number')}</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. 0911000000"
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('category', 'Department / Inquiry Category')}</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="form-control"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('subject', 'Subject')} *</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="e.g. Room availability for upcoming conference"
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('message', 'Your Message')} *</label>
                                <textarea
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Write your detailed inquiry or special request here..."
                                    required
                                    className="form-control"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-luxury-gold btn-large w-100"
                            >
                                {submitting ? t('loading', 'Sending Message...') : `✉️ ${t('sendMessage', 'Send Message')}`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Customer's Past Inquiries & Staff Direct Replies */}
            {user && (
                <div className="my-inquiries-section">
                    <div className="section-title-wrap">
                        <span className="section-eyebrow">YOUR COMMUNICATION HISTORY</span>
                        <h2>My Inquiries &amp; Hotel Replies</h2>
                        <p>Track your submitted questions and direct responses from our management and reception staff.</p>
                    </div>

                    {loadingMyInquiries ? (
                        <div className="loading-state luxury-card text-center">
                            <p>Loading your past inquiries...</p>
                        </div>
                    ) : myInquiries.length === 0 ? (
                        <div className="empty-state luxury-card text-center">
                            <p>You have not submitted any inquiries yet. Use the form above to reach our team.</p>
                        </div>
                    ) : (
                        <div className="inquiries-list-grid">
                            {myInquiries.map((inq) => (
                                <div key={inq.id} className="inquiry-thread-card luxury-card">
                                    <div className="inquiry-thread-header">
                                        <div>
                                            <span className={`status-badge ${inq.status === 'replied' ? 'status-approved' : 'status-pending'}`}>
                                                {inq.status === 'replied' ? '✓ Replied' : '⏳ Pending Response'}
                                            </span>
                                            <span className="category-pill">{inq.category.toUpperCase()}</span>
                                            <h3 className="inquiry-subject">{inq.subject}</h3>
                                        </div>
                                        <span className="inquiry-date">
                                            {new Date(inq.created_at).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="inquiry-guest-msg">
                                        <strong>Your Message:</strong>
                                        <p>{inq.message}</p>
                                    </div>

                                    {/* Direct Staff Reply Box */}
                                    {inq.staff_reply ? (
                                        <div className="staff-reply-box">
                                            <div className="staff-reply-header">
                                                <span className="reply-icon">💬</span>
                                                <div>
                                                    <strong>Direct Response from Paradise Hotel</strong>
                                                    <div className="staff-name-role">
                                                        By {inq.replied_by_name || 'Staff Member'} ({inq.replied_by_role || 'Reception / Management'})
                                                        {inq.replied_at && ` · ${new Date(inq.replied_at).toLocaleString()}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="staff-reply-body">
                                                {inq.staff_reply}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="awaiting-reply-notice">
                                            ⏳ Our reception and management have received this inquiry and will reply shortly.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
