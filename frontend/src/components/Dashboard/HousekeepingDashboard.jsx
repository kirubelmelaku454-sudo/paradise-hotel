import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';
import LuxuryLogo from '../Common/LuxuryLogo';
import { LuxuryDoughnutChart } from '../Common/LuxuryAnalyticsCharts';

export default function HousekeepingDashboard() {
  const { user, logout } = useContext(AuthContext);

  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({ total: 0, clean: 0, dirty: 0, cleaning: 0, inspecting: 0, maintenance: 0, occupied: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  // Note Modal State
  const [notesModal, setNotesModal] = useState(null);
  const [notesText, setNotesText] = useState('');

  // Maintenance Modal State
  const [maintModal, setMaintModal] = useState(null);
  const [maintReason, setMaintReason] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/receptionist/housekeeping');
      if (res.data?.success) {
        setRooms(res.data.rooms || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Housekeeping fetch error:', err);
      toast.error('Could not load room housekeeping records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleUpdateStatus = async (roomId, targetStatus, optionalNotes) => {
    setUpdatingId(roomId);
    try {
      const payload = { housekeepingStatus: targetStatus };
      if (optionalNotes !== undefined) payload.notes = optionalNotes;

      const res = await api.post(`/receptionist/rooms/${roomId}/housekeeping`, payload);
      if (res.data?.success) {
        toast.success(res.data.message || `Room #${roomId} status updated to ${targetStatus}`);
        fetchRooms();
        if (notesModal) setNotesModal(null);
        if (maintModal) setMaintModal(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update housekeeping status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'clean':
        return <span style={{ background: 'rgba(39, 174, 96, 0.15)', color: '#27ae60', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🟢 Clean (ንጹህ)</span>;
      case 'dirty':
        return <span style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🔴 Dirty (ጽዳት የሚሻ)</span>;
      case 'cleaning':
        return <span style={{ background: 'rgba(243, 156, 18, 0.15)', color: '#f39c12', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🟡 Cleaning in Progress</span>;
      case 'inspecting':
        return <span style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🔵 Inspecting (ምርመራ)</span>;
      case 'maintenance':
        return <span style={{ background: 'rgba(142, 68, 173, 0.15)', color: '#8e44ad', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🟠 Maintenance (ጥገና)</span>;
      default:
        return <span style={{ background: '#eee', color: '#555', padding: '5px 12px', borderRadius: 20, fontSize: 12 }}>{status}</span>;
    }
  };

  const filteredRooms = rooms.filter(r => {
    if (activeFilter !== 'all' && r.housekeeping_status !== activeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = `${r.room_number} ${r.room_type} ${r.guest_name || ''} ${r.housekeeper_notes || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="inside luxury-page-container" style={{ maxWidth: 1360, margin: '20px auto', padding: '16px' }}>
      {/* 5-Star Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0b1329 100%)', color: '#fff', padding: '28px 24px', borderRadius: 16, marginBottom: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', border: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              🧹
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent, #f0a500)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                PARADISE HOTEL · DEBRE MARKOS
              </div>
              <h1 style={{ margin: '2px 0 4px', fontSize: 24, color: '#fff' }}>
                Housekeeping &amp; Room Hygiene Control Center
              </h1>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: 13 }}>
                Logged in as <strong>{user?.first_name || user?.username}</strong> · Real-time room turnover, sanitation checklists, and maintenance logs.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={fetchRooms}
              className="btn btn-luxury-outline"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: 13 }}
            >
              🔄 Refresh Status
            </button>
            <button
              onClick={logout}
              className="btn btn-luxury-gold"
              style={{ fontSize: 13, padding: '8px 16px' }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Luxury Dashboard Layout with Vertical Sidebar */}
      <div className="dashboard-with-sidebar">
        {/* Left Vertical Navigation Sidebar */}
        <aside className="dashboard-vsidebar">
          <div className="dashboard-vsidebar-header">
            <div className="dashboard-vsidebar-title">
              <span>🧹</span> Housekeeping
            </div>
            <div className="dashboard-vsidebar-sub">Turnover &amp; Room Sanitation</div>
          </div>

          {[
            { id: 'all', icon: '🛏️', label: 'All Room Inventory', count: stats.total },
            { id: 'clean', icon: '🟢', label: 'Clean & Ready', count: stats.clean },
            { id: 'dirty', icon: '🔴', label: 'Dirty / Turnover', count: stats.dirty, badgeDanger: stats.dirty > 0 },
            { id: 'cleaning', icon: '🟡', label: 'Cleaning In Progress', count: stats.cleaning },
            { id: 'inspecting', icon: '🔵', label: 'Supervisor Inspecting', count: stats.inspecting },
            { id: 'maintenance', icon: '🟠', label: 'Maintenance Required', count: stats.maintenance },
          ].map(tab => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`dashboard-vnav-item ${active ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined ? (
                  <span className={`dashboard-vnav-badge ${tab.badgeDanger ? 'danger' : ''}`}>{tab.count}</span>
                ) : null}
              </button>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>Quick Controls</div>
            <button
              onClick={fetchRooms}
              className="dashboard-vnav-item"
              style={{ marginBottom: 6 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>🔄</span>
                <span>Refresh Status</span>
              </div>
            </button>
            <button
              onClick={logout}
              className="dashboard-vnav-item"
              style={{ color: '#e74c3c' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>🚪</span>
                <span>Sign Out Staff</span>
              </div>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="dashboard-main-area">
          {/* Live Visual Turnover Donut Chart */}
          <div style={{ marginBottom: 24 }}>
            <LuxuryDoughnutChart
              title="🧹 Room Turnover & Sanitation Ratio"
              subtitle="Real-time cleanliness readiness across all hotel wings"
              centerLabel="Ready"
              centerValue={`${Math.round(((stats.clean || 0) / (stats.total || 1)) * 100)}%`}
              segments={[
                { label: 'Clean (ንጹህ)', value: stats.clean || 0, color: '#27ae60' },
                { label: 'Cleaning (በማጽዳት ላይ)', value: stats.cleaning || 0, color: '#f39c12' },
                { label: 'Dirty (ጽዳት የሚሻ)', value: stats.dirty || 0, color: '#e74c3c' },
                { label: 'Inspecting (ምርመራ)', value: stats.inspecting || 0, color: '#3498db' },
                { label: 'Maintenance (ጥገና)', value: stats.maintenance || 0, color: '#8e44ad' },
              ]}
            />
          </div>

      {/* Standard Hygiene Protocols Banner */}
      <div className="luxury-card" style={{ padding: '16px 20px', marginBottom: 24, background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>✨</span>
          <strong style={{ fontSize: 14, color: 'var(--text-dark)' }}>Paradise 5-Star Hygiene Standards Checklist</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          <div>✓ Change all bed linens &amp; pillowcases</div>
          <div>✓ Full bathroom disinfection &amp; fresh towels</div>
          <div>✓ Restock complimentary water &amp; minibar</div>
          <div>✓ Vacuum floor &amp; sanitize high-touch handles</div>
          <div>✓ Verify AC, TV remote &amp; lighting fixtures</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search room number, type, guest name, or housekeeper notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ flex: 1, minWidth: 280 }}
        />
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="form-select"
          style={{ width: 'auto', minWidth: 200 }}
        >
          <option value="all">All Room Conditions ({rooms.length})</option>
          <option value="clean">🟢 Clean Only ({stats.clean})</option>
          <option value="dirty">🔴 Dirty / Turnover Only ({stats.dirty})</option>
          <option value="cleaning">🟡 In Progress ({stats.cleaning})</option>
          <option value="inspecting">🔵 Inspecting ({stats.inspecting})</option>
          <option value="maintenance">🟠 Maintenance ({stats.maintenance})</option>
        </select>
      </div>

      {/* Main Rooms Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Loading rooms hygiene roster...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          No rooms found matching the selected filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredRooms.map(r => (
            <div
              key={r.id}
              className="luxury-card"
              style={{
                padding: '20px',
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                border: r.housekeeping_status === 'dirty' ? '1.5px solid rgba(231, 76, 60, 0.4)' :
                        r.housekeeping_status === 'cleaning' ? '1.5px solid rgba(243, 156, 18, 0.4)' :
                        r.housekeeping_status === 'clean' ? '1.5px solid rgba(39, 174, 96, 0.4)' : '1px solid var(--border)',
                background: 'var(--bg-card)'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-dark)' }}>
                    Room #{r.room_number}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    {r.room_type} · Max {r.capacity} Guests
                  </div>
                </div>
                <div>{getStatusBadge(r.housekeeping_status)}</div>
              </div>

              {/* Occupancy Status */}
              <div style={{ background: 'var(--bg-main)', padding: '10px 12px', borderRadius: 10, fontSize: 12, marginBottom: 12 }}>
                {r.guest_name ? (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--accent, #f0a500)' }}>
                      👤 In-House Guest: {r.guest_name}
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                      Stay: {r.check_in_date ? new Date(r.check_in_date).toLocaleDateString() : ''} ➔ {r.check_out_date ? new Date(r.check_out_date).toLocaleDateString() : ''}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Vacant Room (No active guest)
                  </div>
                )}
              </div>

              {/* Notes & Timestamp */}
              <div style={{ fontSize: 12, marginBottom: 16, flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontSize: 11 }}>
                  Housekeeper Notes:
                </div>
                <div style={{ color: 'var(--text-dark)', minHeight: 36, background: 'var(--bg-main)', padding: '8px 10px', borderRadius: 8 }}>
                  {r.housekeeper_notes || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes logged</span>}
                </div>
                {r.last_cleaned_at && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    🕒 Last Cleaned: {new Date(r.last_cleaned_at).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Quick Action Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                {r.housekeeping_status !== 'clean' ? (
                  <button
                    disabled={updatingId === r.id}
                    onClick={() => handleUpdateStatus(r.id, 'clean')}
                    style={{
                      padding: '8px 12px',
                      background: '#27ae60',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    🟢 Mark Clean
                  </button>
                ) : (
                  <button
                    disabled={updatingId === r.id}
                    onClick={() => handleUpdateStatus(r.id, 'dirty')}
                    style={{
                      padding: '8px 12px',
                      background: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    🔴 Mark Dirty
                  </button>
                )}

                {r.housekeeping_status !== 'cleaning' ? (
                  <button
                    disabled={updatingId === r.id}
                    onClick={() => handleUpdateStatus(r.id, 'cleaning')}
                    style={{
                      padding: '8px 12px',
                      background: '#f39c12',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    🟡 Start Clean
                  </button>
                ) : (
                  <button
                    disabled={updatingId === r.id}
                    onClick={() => handleUpdateStatus(r.id, 'inspecting')}
                    style={{
                      padding: '8px 12px',
                      background: '#3498db',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    🔵 Request Inspect
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setNotesModal(r);
                    setNotesText(r.housekeeper_notes || '');
                  }}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-main)',
                    color: 'var(--text-dark)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📝 Edit Notes
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMaintModal(r);
                    setMaintReason(r.housekeeper_notes || '');
                  }}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(142, 68, 173, 0.12)',
                    color: '#8e44ad',
                    border: '1px solid rgba(142, 68, 173, 0.3)',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🟠 Maintenance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </main>
      </div>

      {/* Edit Notes Modal */}
      {notesModal && (
        <div className="invoice-modal-backdrop" onClick={() => setNotesModal(null)}>
          <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450, padding: 24, borderRadius: 16 }}>
            <h3 style={{ marginTop: 0, fontSize: 18 }}>📝 Room #{notesModal.room_number} Housekeeping Note</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Record linen changes, minibar restock, deep cleaning, or guest requests.
            </p>
            <textarea
              rows="4"
              className="form-textarea"
              style={{ width: '100%', marginBottom: 16 }}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g. Linens replaced, bathroom disinfected, towels replenished..."
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-luxury-outline"
                onClick={() => setNotesModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-luxury-gold"
                onClick={() => handleUpdateStatus(notesModal.id, notesModal.housekeeping_status, notesText)}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Maintenance Modal */}
      {maintModal && (
        <div className="invoice-modal-backdrop" onClick={() => setMaintModal(null)}>
          <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450, padding: 24, borderRadius: 16 }}>
            <h3 style={{ marginTop: 0, fontSize: 18, color: '#8e44ad' }}>🟠 Report Room #{maintModal.room_number} Maintenance</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Flag this room as out of order so it cannot be assigned to arriving guests until repaired.
            </p>
            <textarea
              rows="4"
              className="form-textarea"
              style={{ width: '100%', marginBottom: 16 }}
              value={maintReason}
              onChange={(e) => setMaintReason(e.target.value)}
              placeholder="e.g. Bathroom pipe leak, AC not cooling, keycard lock sensor broken..."
              required
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-luxury-outline"
                onClick={() => setMaintModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: '#8e44ad', color: '#fff', padding: '9px 18px', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                onClick={() => handleUpdateStatus(maintModal.id, 'maintenance', maintReason || 'Flagged for maintenance by Housekeeping')}
              >
                Flag Maintenance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

