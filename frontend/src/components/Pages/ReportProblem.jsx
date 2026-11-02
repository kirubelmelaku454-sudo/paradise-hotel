import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import api from '../../api';
import toast from 'react-hot-toast';

const ReportProblem = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Room & Facilities');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'new'

  const loadMyReports = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    try {
      const res = await api.get('/reports/my');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Could not load your service reports');
      setReports([]);
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMyReports();
  }, [loadMyReports]);

  if (!user) {
    return (
      <div className="inside luxury-page-container" style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center', padding: '30px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-dark)' }}>Guest Sign-in Required</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
          Please sign in to submit a service request, maintenance inquiry, or view management responses.
        </p>
        <button type="button" className="btn btn-luxury-gold" onClick={() => navigate('/login')} style={{ padding: '12px 24px' }}>
          Go to Sign In ➔
        </button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      toast.error('Please enter a clear title (min 3 characters)');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error('Please describe the issue or suggestion in detail (min 10 characters)');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/reports/submit', {
        title: `[${category}] ${title.trim()}`,
        description: description.trim(),
      });
      toast.success(res.data.message || 'Service request submitted successfully! Front desk has been alerted.');
      setTitle('');
      setDescription('');
      setView('list');
      await loadMyReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit service request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || 'open').toLowerCase();
    if (s === 'resolved') {
      return <span className="status-badge status-approved">✓ Resolved</span>;
    }
    if (s === 'reviewed' || s === 'in_progress') {
      return <span className="status-badge" style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#2980b9' }}>⚙️ Under Review</span>;
    }
    return <span className="status-badge status-pending">⏳ Pending Review</span>;
  };

  return (
    <div className="inside luxury-page-container" style={{ maxWidth: 840, margin: '24px auto', padding: '0 16px 40px' }}>
      {/* 5-Star Luxury Header */}
      <div className="luxury-header-box text-center" style={{ marginBottom: 24, padding: '28px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <LuxuryLogo size="medium" showText={false} />
        </div>
        <div className="luxury-badge">👑 24/7 GUEST CONCIERGE &amp; SERVICE ASSURANCE</div>
        <h1 className="page-title" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', margin: '6px 0 8px' }}>
          Service Requests &amp; Guest Suggestions
        </h1>
        <p className="page-subtitle" style={{ fontSize: 14, maxWidth: 580, margin: '0 auto', color: 'var(--text-muted)' }}>
          Experience immediate resolution. Report any suite maintenance, housekeeping needs, dining requests, or share improvement ideas with hotel management.
        </p>
      </div>

      {/* View Switcher Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className={view === 'list' ? 'btn btn-luxury-gold' : 'btn btn-luxury-outline'}
            style={{ padding: '9px 18px', borderRadius: 20, fontSize: 13 }}
            onClick={() => setView('list')}
          >
            📋 My Requests &amp; Replies ({reports.length})
          </button>
          <button
            type="button"
            className={view === 'new' ? 'btn btn-luxury-gold' : 'btn btn-luxury-outline'}
            style={{ padding: '9px 18px', borderRadius: 20, fontSize: 13 }}
            onClick={() => setView('new')}
          >
            ➕ Submit New Request
          </button>
        </div>

        <button
          type="button"
          className="btn btn-luxury-outline"
          onClick={loadMyReports}
          style={{ padding: '8px 16px', borderRadius: 20, fontSize: 12 }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* NEW REPORT FORM */}
      {view === 'new' && (
        <div className="luxury-section-panel" style={{ padding: '28px 24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--text-dark)', fontFamily: 'var(--font-heading)' }}>
            Submit a Service Request or Suggestion
          </h3>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                Service Category:
              </label>
              <select
                className="clean-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Room &amp; Suite Maintenance (AC, TV, Jacuzzi)</option>
                <option>Housekeeping &amp; Linen Service</option>
                <option>Dining &amp; Room Service Food Quality</option>
                <option>WiFi, Power &amp; Desk Workspace</option>
                <option>Staff &amp; Reception Hospitality</option>
                <option>General Improvement Suggestion</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                Request Subject / Title *:
              </label>
              <input
                className="clean-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Suite 402 AC adjustment, Extra towels needed, WiFi speed check"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                Detailed Description *:
              </label>
              <textarea
                className="clean-input"
                style={{ width: '100%', minHeight: 120, resize: 'vertical', boxSizing: 'border-box' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened, your room or desk number, and how we can assist you right now..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-luxury-gold"
              style={{ padding: '13px', fontSize: 14, fontWeight: 800, marginTop: 8 }}
            >
              {loading ? 'Submitting to Concierge...' : '🚀 Submit Request to Hotel Management'}
            </button>
          </form>
        </div>
      )}

      {/* LIST OF REPORTS & STAFF REPLIES */}
      {view === 'list' && (
        <div className="luxury-section-panel" style={{ padding: '24px 22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--text-dark)', fontFamily: 'var(--font-heading)' }}>
            Service History &amp; Official Responses
          </h3>

          {listLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your service inquiries...
            </div>
          ) : reports.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--text-dark)' }}>No Service Issues On Record</h4>
              <p style={{ margin: '0 0 16px', fontSize: 13 }}>
                Have a maintenance request or recommendation? Let us know anytime!
              </p>
              <button type="button" className="btn btn-luxury-gold btn-sm" onClick={() => setView('new')}>
                + Create Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="card luxury-card"
                  style={{ padding: 20 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--text-dark)' }}>
                        {r.title}
                      </h4>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Submitted: {new Date(r.created_at || Date.now()).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      {getStatusBadge(r.status)}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-main)', padding: '12px 14px', borderRadius: 10, margin: '12px 0', fontSize: 14, color: 'var(--text-dark)' }}>
                    <strong>My Request:</strong> {r.description}
                  </div>

                  {/* Staff Response Box */}
                  {r.manager_response ? (
                    <div style={{ background: 'rgba(240, 165, 0, 0.08)', borderLeft: '4px solid var(--accent)', padding: '12px 16px', borderRadius: '4px 10px 10px 4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ color: 'var(--accent)', fontSize: 13 }}>
                          💬 Official Resolution from Paradise Hotel Management
                        </strong>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {r.responded_at ? new Date(r.responded_at).toLocaleString() : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.5 }}>
                        {r.manager_response}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
                      ⏳ Our management team is currently addressing this request.
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
};

export default ReportProblem;
