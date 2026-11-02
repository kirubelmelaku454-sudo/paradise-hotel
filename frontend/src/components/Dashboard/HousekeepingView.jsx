import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

export default function HousekeepingView() {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({ total: 0, clean: 0, dirty: 0, cleaning: 0, inspecting: 0, maintenance: 0, occupied: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [notesModal, setNotesModal] = useState(null); // { id, room_number, notes }
  const [notesText, setNotesText] = useState('');

  const fetchHousekeeping = async () => {
    setLoading(true);
    try {
      const res = await api.get('/receptionist/housekeeping');
      if (res.data?.success) {
        setRooms(res.data.rooms || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Housekeeping fetch error:', err);
      toast.error('Failed to load room housekeeping status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousekeeping();
  }, []);

  const handleStatusChange = async (roomId, targetStatus, optionalNotes) => {
    setUpdatingId(roomId);
    try {
      const payload = { housekeepingStatus: targetStatus };
      if (optionalNotes !== undefined) payload.notes = optionalNotes;

      const res = await api.post(`/receptionist/rooms/${roomId}/housekeeping`, payload);
      if (res.data?.success) {
        toast.success(res.data.message || `Room status updated to ${targetStatus}`);
        fetchHousekeeping();
        if (notesModal) setNotesModal(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update housekeeping status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'clean':
        return <span style={{ background: 'rgba(39, 174, 96, 0.15)', color: '#27ae60', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🟢 Clean (ንጹህ)</span>;
      case 'dirty':
        return <span style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🔴 Dirty (ጽዳት የሚፈልግ)</span>;
      case 'cleaning':
        return <span style={{ background: 'rgba(243, 156, 18, 0.15)', color: '#f39c12', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🟡 Cleaning in Progress</span>;
      case 'inspecting':
        return <span style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🔵 Inspecting (ምርመራ)</span>;
      case 'maintenance':
        return <span style={{ background: 'rgba(142, 68, 173, 0.15)', color: '#8e44ad', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🟠 Maintenance (ጥገና)</span>;
      default:
        return <span style={{ background: '#eee', color: '#555', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>{status}</span>;
    }
  };

  const filteredRooms = rooms.filter(r => {
    if (filter !== 'all' && r.housekeeping_status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = `${r.room_number} ${r.room_type} ${r.guest_name || ''} ${r.housekeeper_notes || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="card luxury-card" style={{ padding: '24px', borderRadius: 16 }}>
      {/* Header & Stats Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🧹</span> Housekeeping &amp; Room Hygiene Control (ጽዳት እና ጥገና)
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #777)', fontSize: 13 }}>
            Real-time room cleanliness, hygiene turnover after checkout, and maintenance logs.
          </p>
        </div>
        <button
          onClick={fetchHousekeeping}
          className="btn btn-luxury-outline"
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* KPI Status Badges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg-main, #f8f9fa)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Rooms</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{stats.total}</div>
        </div>
        <div 
          onClick={() => setFilter(filter === 'clean' ? 'all' : 'clean')}
          style={{ background: filter === 'clean' ? 'rgba(39, 174, 96, 0.1)' : 'var(--bg-main)', border: `1.5px solid ${filter === 'clean' ? '#27ae60' : 'var(--border)'}`, padding: '12px 16px', borderRadius: 12, textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: '#27ae60', fontWeight: 700 }}>🟢 Clean &amp; Ready</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#27ae60', marginTop: 4 }}>{stats.clean}</div>
        </div>
        <div 
          onClick={() => setFilter(filter === 'dirty' ? 'all' : 'dirty')}
          style={{ background: filter === 'dirty' ? 'rgba(231, 76, 60, 0.1)' : 'var(--bg-main)', border: `1.5px solid ${filter === 'dirty' ? '#e74c3c' : 'var(--border)'}`, padding: '12px 16px', borderRadius: 12, textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: '#e74c3c', fontWeight: 700 }}>🔴 Dirty / Turnover</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e74c3c', marginTop: 4 }}>{stats.dirty}</div>
        </div>
        <div 
          onClick={() => setFilter(filter === 'cleaning' ? 'all' : 'cleaning')}
          style={{ background: filter === 'cleaning' ? 'rgba(243, 156, 18, 0.1)' : 'var(--bg-main)', border: `1.5px solid ${filter === 'cleaning' ? '#f39c12' : 'var(--border)'}`, padding: '12px 16px', borderRadius: 12, textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: '#f39c12', fontWeight: 700 }}>🟡 In Progress</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f39c12', marginTop: 4 }}>{stats.cleaning}</div>
        </div>
        <div 
          onClick={() => setFilter(filter === 'inspecting' ? 'all' : 'inspecting')}
          style={{ background: filter === 'inspecting' ? 'rgba(52, 152, 219, 0.1)' : 'var(--bg-main)', border: `1.5px solid ${filter === 'inspecting' ? '#3498db' : 'var(--border)'}`, padding: '12px 16px', borderRadius: 12, textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: '#3498db', fontWeight: 700 }}>🔵 Inspecting</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#3498db', marginTop: 4 }}>{stats.inspecting}</div>
        </div>
        <div 
          onClick={() => setFilter(filter === 'maintenance' ? 'all' : 'maintenance')}
          style={{ background: filter === 'maintenance' ? 'rgba(142, 68, 173, 0.1)' : 'var(--bg-main)', border: `1.5px solid ${filter === 'maintenance' ? '#8e44ad' : 'var(--border)'}`, padding: '12px 16px', borderRadius: 12, textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: '#8e44ad', fontWeight: 700 }}>🟠 Maintenance</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#8e44ad', marginTop: 4 }}>{stats.maintenance}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by Room #, type, guest name, or housekeeper notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ flex: 1, minWidth: 260 }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-select"
          style={{ width: 'auto', minWidth: 180 }}
        >
          <option value="all">All Conditions ({rooms.length})</option>
          <option value="clean">🟢 Clean Only ({stats.clean})</option>
          <option value="dirty">🔴 Dirty Only ({stats.dirty})</option>
          <option value="cleaning">🟡 In Progress ({stats.cleaning})</option>
          <option value="inspecting">🔵 Inspecting ({stats.inspecting})</option>
          <option value="maintenance">🟠 Maintenance ({stats.maintenance})</option>
        </select>
      </div>

      {/* Rooms Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p>Loading rooms hygiene roster...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No rooms match the selected condition.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Room #</th>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Type &amp; Price</th>
                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Housekeeping</th>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Current Occupancy</th>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Notes &amp; Last Cleaned</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 10px', fontWeight: 800, fontSize: 15 }}>
                    #{r.room_number}
                  </td>
                  <td style={{ padding: '14px 10px' }}>
                    <div style={{ fontWeight: 600 }}>{r.room_type}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>ETB {Number(r.price_per_night || 0).toLocaleString()} / night</div>
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                    {getStatusBadge(r.housekeeping_status)}
                  </td>
                  <td style={{ padding: '14px 10px' }}>
                    {r.guest_name ? (
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--accent, #f0a500)' }}>👤 {r.guest_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Stay: {r.check_in_date ? new Date(r.check_in_date).toLocaleDateString() : ''} ➔ {r.check_out_date ? new Date(r.check_out_date).toLocaleDateString() : ''}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Vacant (No active guest)</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 10px' }}>
                    <div style={{ fontSize: 12 }}>{r.housekeeper_notes || <span style={{ color: 'var(--text-muted)' }}>No notes</span>}</div>
                    {r.last_cleaned_at && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        Cleaned: {new Date(r.last_cleaned_at).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {r.housekeeping_status !== 'cleaning' && (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => handleStatusChange(r.id, 'cleaning')}
                          className="btn btn-sm"
                          style={{ background: '#f39c12', color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                          title="Mark cleaning in progress"
                        >
                          🟡 Start Clean
                        </button>
                      )}

                      {r.housekeeping_status !== 'clean' && (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => handleStatusChange(r.id, 'clean')}
                          className="btn btn-sm"
                          style={{ background: '#27ae60', color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                          title="Verify cleaned and ready for guest"
                        >
                          🟢 Mark Clean
                        </button>
                      )}

                      {r.housekeeping_status !== 'dirty' && (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => handleStatusChange(r.id, 'dirty')}
                          className="btn btn-sm"
                          style={{ background: '#e74c3c', color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                          title="Flag room as dirty/needs turnover"
                        >
                          🔴 Mark Dirty
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setNotesModal(r);
                          setNotesText(r.housekeeper_notes || '');
                        }}
                        className="btn btn-sm"
                        style={{ background: 'var(--bg-main, #eee)', color: 'var(--text-dark, #333)', fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }}
                        title="Add housekeeping/inspection notes"
                      >
                        📝 Notes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Housekeeper Notes Modal */}
      {notesModal && (
        <div className="invoice-modal-backdrop" onClick={() => setNotesModal(null)}>
          <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, padding: 24, borderRadius: 16 }}>
            <h3 style={{ marginTop: 0, fontSize: 18 }}>📝 Room #{notesModal.room_number} Housekeeping Notes</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Record linen changes, minibar restock, maintenance notices, or hygiene inspections.
            </p>
            <textarea
              rows="4"
              className="form-textarea"
              style={{ width: '100%', marginBottom: 14 }}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g. Linens replaced, bathroom disinfected, AC remote battery replaced..."
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
                onClick={() => handleStatusChange(notesModal.id, notesModal.housekeeping_status, notesText)}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

