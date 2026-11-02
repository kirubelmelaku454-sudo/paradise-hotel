import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

export default function PoliceManifestView() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('all');
  const [guests, setGuests] = useState([]);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchManifest = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/police-manifest', {
        params: { date, status }
      });
      if (res.data?.success) {
        setGuests(res.data.manifest || []);
        if (res.data.hotelInfo) setHotelInfo(res.data.hotelInfo);
      }
    } catch (err) {
      console.error('Manifest fetch error:', err);
      toast.error('Could not load Police & Tourism Manifest');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManifest();
  }, [date, status]);

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const url = `/api/reports/police-manifest?date=${date}&status=${status}&format=csv`;
    
    // Direct download trigger with auth header
    api.get(url, { responseType: 'blob' })
      .then((res) => {
        const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `paradise_hotel_police_manifest_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Official Police Manifest CSV downloaded successfully!');
      })
      .catch((err) => {
        toast.error('Failed to export CSV manifest');
      });
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = guests.filter(g => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = `${g.guest_name} ${g.guest_phone || ''} ${g.fida_number || ''} ${g.kebele || ''} ${g.room_number || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="card luxury-card" style={{ padding: '24px', borderRadius: 16 }}>
      {/* Official Governmental Header Banner (Also formatted for Print) */}
      <div className="manifest-official-header" style={{ borderBottom: '2px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent, #f0a500)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              OFFICIAL GOVERNMENTAL &amp; SECURITY REPORTING
            </div>
            <h2 style={{ margin: '4px 0 2px', fontSize: 22 }}>
              📋 Police &amp; Tourism Daily Guest Manifest (የእንግዶች መዝገብ)
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
              Debre Markos City Administration Woreda Police Department &amp; Amhara Tourism Bureau
            </p>
          </div>

          <div className="no-print" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCSV}
              className="btn btn-luxury-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              <span>📥</span> Export CSV / Excel
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-luxury-gold"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}
            >
              <span>🖨️</span> Print Official Manifest
            </button>
          </div>
        </div>
      </div>

      {/* Date & Filter Controls (no-print) */}
      <div className="no-print" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Manifest Date (ቀን):</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 13 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Guest Status:</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 13 }}
          >
            <option value="all">All Registered Guests</option>
            <option value="checked_in">Currently Checked-In Only</option>
            <option value="approved">Approved &amp; Reserved</option>
            <option value="checked_out">Checked-Out</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Search Manifest:</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search name, phone, Fayda/ID, Kebele, room #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
          />
        </div>

        <button
          onClick={fetchManifest}
          className="btn btn-luxury-outline"
          style={{ padding: '8px 14px', fontSize: 13 }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Manifest Summary Bar */}
      <div style={{ background: 'var(--bg-main, #f8f9fa)', padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: 13 }}>
        <div>
          <strong>Hotel:</strong> Paradise Hotel (Centera) · TIN: 0048291044 · Debre Markos
        </div>
        <div>
          <strong>Reporting Date:</strong> {new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
        <div>
          <strong>Total Guests in Record:</strong> <span style={{ color: 'var(--accent, #f0a500)', fontWeight: 800 }}>{filtered.length} Guests</span>
        </div>
      </div>

      {/* Manifest Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p>Compiling official guest manifest...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No guest records found for the selected date and criteria.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table manifest-print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg-main)' }}>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>S/N</th>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>Room #</th>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>Guest Full Name (የእንግዳ ስም)</th>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>National / Fayda ID</th>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>Origin Address (Region / Zone / Woreda / Kebele)</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>Check-In</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>Check-Out</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>Guests</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, idx) => (
                <tr key={g.reservation_id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 800 }}>#{g.room_number || '—'} ({g.room_type})</td>
                  <td style={{ padding: '10px 8px', fontWeight: 700 }}>{g.guest_name}</td>
                  <td style={{ padding: '10px 8px' }}>{g.guest_phone || '—'}</td>
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{g.fida_number || 'N/A'}</td>
                  <td style={{ padding: '10px 8px' }}>
                    {g.country}, {g.region}, {g.zone}, {g.wereda}, Kebele: {g.kebele}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {g.check_in_date ? new Date(g.check_in_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {g.check_out_date ? new Date(g.check_out_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>{g.number_of_guests || 1}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: g.status === 'checked_in' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(240, 165, 0, 0.15)',
                      color: g.status === 'checked_in' ? '#27ae60' : 'var(--accent, #f0a500)'
                    }}>
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Official Signatures Area (Only visible when printing or in formal inspection) */}
      <div className="manifest-signatures-footer" style={{ marginTop: 30, paddingTop: 20, borderTop: '1px dashed var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, textAlign: 'center', fontSize: 12 }}>
        <div>
          <div style={{ height: 40 }} />
          <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontWeight: 700 }}>Receptionist On Duty (የቀኑ ሪሴፕሽኒስት)</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Signature &amp; Stamp</div>
        </div>
        <div>
          <div style={{ height: 40 }} />
          <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontWeight: 700 }}>Hotel General Manager (የሆቴል ስራ አስኪያጅ)</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Signature &amp; Official Seal</div>
        </div>
        <div>
          <div style={{ height: 40 }} />
          <div style={{ borderTop: '1px solid #333', paddingTop: 6, fontWeight: 700 }}>Debre Markos Police Receiving Officer</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Rank, Badge &amp; Date</div>
        </div>
      </div>
    </div>
  );
}

