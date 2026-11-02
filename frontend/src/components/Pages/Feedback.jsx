import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import api from '../../api';
import toast from 'react-hot-toast';

const RATING_DESCRIPTIONS = {
  5: '★★★★★ Exceptional 5-Star Experience',
  4: '★★★★☆ Very Good, Exceeded Expectations',
  3: '★★★☆☆ Average Stay, Room for Improvement',
  2: '★★☆☆☆ Disappointing, Needs Attention',
  1: '★☆☆☆☆ Poor Service Encounter'
};

const Feedback = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState({
        feedback: '',
        rating: 5,
        jobTitle: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.feedback.trim().length < 5) {
            toast.error('Please provide more detailed feedback (at least 5 characters)');
            return;
        }

        setLoading(true);
        try {
            await api.post('/comments', formData);
            toast.success('Thank you for sharing your experience! Your review has been submitted for VIP verification.');
            setFormData({ feedback: '', rating: 5, jobTitle: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    const currentRating = hoverRating || formData.rating;

    return (
        <div className="inside luxury-page-container" style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px 40px' }}>
            {/* 5-Star Luxury Header */}
            <div className="luxury-header-box text-center" style={{ marginBottom: 24, padding: '28px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    <LuxuryLogo size="medium" showText={false} />
                </div>
                <div className="luxury-badge">👑 GUEST REVIEWS &amp; TESTIMONIALS</div>
                <h1 className="page-title" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', margin: '6px 0 8px' }}>
                    Share Your Paradise Experience
                </h1>
                <p className="page-subtitle" style={{ fontSize: 14, maxWidth: 540, margin: '0 auto', color: 'var(--text-muted)' }}>
                    Your impressions guide our commitment to luxury hospitality in Debre Markos. Approved reviews are showcased on our public homepage.
                </p>
            </div>

            <div className="luxury-section-panel" style={{ padding: '30px 28px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Star Rating Section */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--text-dark)' }}>
                            Overall Experience Rating *
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 6, fontSize: 32, cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        style={{
                                            color: star <= currentRating ? '#f0a500' : 'var(--border)',
                                            transition: 'color 0.2s, transform 0.2s',
                                            transform: star <= currentRating ? 'scale(1.1)' : 'scale(1)',
                                            userSelect: 'none'
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
                                {RATING_DESCRIPTIONS[currentRating]}
                            </span>
                        </div>
                    </div>

                    {/* Job Title / Traveler Profile */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 6, color: 'var(--text-dark)' }}>
                            Traveler Title / Occasion (Optional)
                        </label>
                        <input
                            type="text"
                            name="jobTitle"
                            className="clean-input"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            placeholder="e.g. Honeymoon Guest, Executive Business Traveler, Choke Mountain Explorer"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* Feedback Textarea */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 6, color: 'var(--text-dark)' }}>
                            Your Detailed Experience &amp; Highlights *
                        </label>
                        <textarea
                            name="feedback"
                            className="clean-input"
                            value={formData.feedback}
                            onChange={handleChange}
                            placeholder="Tell us about the hospitality, suite comfort, culinary flavors, or exceptional staff service..."
                            rows="5"
                            required
                            style={{ width: '100%', boxSizing: 'border-box', minHeight: 130 }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-luxury-gold"
                        disabled={loading}
                        style={{ padding: '14px', fontSize: 15, fontWeight: 800, width: '100%', marginTop: 8 }}
                    >
                        {loading ? 'Submitting Review...' : '✨ Submit Guest Review'}
                    </button>
                </form>

                {!user && (
                    <div style={{ marginTop: 24, padding: 14, background: 'rgba(240, 165, 0, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 12, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                        💡 <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign In</Link> or <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>Create an Account</Link> to have your review officially linked to your verified guest profile.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feedback;
