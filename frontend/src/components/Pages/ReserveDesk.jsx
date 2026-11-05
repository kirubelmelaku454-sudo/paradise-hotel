import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { LanguageContext } from '../../context/LanguageContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import LuxuryHorizontalScroll from '../Common/LuxuryHorizontalScroll';
import api from '../../api';
import toast from 'react-hot-toast';

const resolveMediaUrl = (src, folder = 'desks') => {
  const fallbacks = {
    rooms: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    desks: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    foods: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
  };
  const def = fallbacks[folder] || fallbacks.rooms;
  if (!src) return def;
  let p = String(src).trim().replace(/\\/g, '/');
  if (!p || p === 'undefined' || p === 'null') return def;
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  if (p.startsWith('/uploads/')) return p;
  if (p.startsWith('uploads/')) return '/' + p;
  const file = p.replace(/^.*\//, '');
  return '/uploads/' + folder + '/' + file;
};

// Chunk array into max 10 items per horizontal slider
const chunkArray = (arr, size = 10) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const DESK_SHELF_META = [
  {
    title: 'Terrace Sunset Deck & Panoramic Skyline Tables',
    icon: '🌅',
    desc: 'Outdoor open-air dining with sweeping views of the Debre Markos plateau (Tables D01 – D10)',
    tag: 'Terrace Sunset Deck'
  },
  {
    title: 'Grand Palace Dining Hall & Royal Booths',
    icon: '🏛️',
    desc: 'Opulent indoor dining with crystal chandeliers and private velvet booths (Tables D11 – D20)',
    tag: 'Grand Palace Hall'
  },
  {
    title: 'Garden Pavilion & Poolside Cabana Tables',
    icon: '🌴',
    desc: 'Tranquil garden pergolas and poolside cabanas under swaying palms (Tables D21 – D30)',
    tag: 'Garden & Poolside'
  }
];

export default function ReserveDesk() {
  const { user } = useContext(AuthContext);
  const { formatPrice } = useContext(CurrencyContext);
  const { t } = useContext(LanguageContext);
  const [desks, setDesks] = useState([]);
  const [selectedDeskId, setSelectedDeskId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [withFood, setWithFood] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailsModal, setDetailsModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const todayStr = () => {
    const n = new Date();
    const p = (x) => String(x).padStart(2, '0');
    return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
  };

  useEffect(() => {
    api.get('/desks/available')
      .then((res) => {
        const list = res.data.desks || [];
        setDesks(list);
        if (list.length > 0 && user) {
          const firstAvail = list.find(d => d.is_available !== false && d.status !== 'reserved' && d.status !== 'booked');
          setSelectedDeskId(firstAvail ? firstAvail.id : list[0].id);
        }
      })
      .catch(console.error);
  }, [user]);

  // Dynamically re-check desk availability when user changes date or time slot
  useEffect(() => {
    if (!date || !startTime || !endTime) return;
    const s = new Date(`${date}T${startTime}`);
    const e = new Date(`${date}T${endTime}`);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return;

    api.get(`/desks/available?date=${date}&startTime=${startTime}&endTime=${endTime}`)
      .then((res) => {
        const list = res.data.desks || [];
        setDesks(list);
      })
      .catch(console.error);
  }, [date, startTime, endTime]);

  const locations = ['All', ...Array.from(new Set(desks.map(d => d.location || 'Main Dining Hall')))];

  const filteredDesks = desks.filter((d) => {
    const loc = d.location || 'Main Dining Hall';
    if (selectedLocation !== 'All' && loc !== selectedLocation) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const hay = `${d.desk_number || ''} ${loc} ${d.description || ''} ${d.price || ''} ${d.capacity || ''}`.toLowerCase();
    return hay.includes(q);
  });

  const selectedDesk = desks.find((d) => d.id === Number(selectedDeskId));

  const selectDesk = (deskId, deskObj) => {
    if (!user) {
      toast.error('Please log in to select a desk.');
      navigate('/login');
      return;
    }
    if (deskObj && (deskObj.is_available === false || deskObj.status === 'reserved' || deskObj.status === 'booked')) {
      const untilStr = deskObj.occupied_until ? ` until ${typeof deskObj.occupied_until === 'string' && deskObj.occupied_until.includes('T') ? new Date(deskObj.occupied_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : deskObj.occupied_until}` : '';
      toast.error(`Desk #${deskObj.desk_number} is currently reserved${untilStr}. Reserving is blocked until it is released.`);
      setDetailsModal(deskObj);
      return;
    }
    setSelectedDeskId(deskId);
    if (deskObj) {
      toast.success(`Desk #${deskObj.desk_number} selected! Fill in your reservation details below.`);
    }
    setTimeout(() => {
      const formElem = document.getElementById('desk-booking-form-section');
      if (formElem) {
        formElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Duration in hours
  let durationHours = 0;
  if (date && startTime && endTime) {
    const s = new Date(`${date}T${startTime}`);
    const e = new Date(`${date}T${endTime}`);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e > s) {
      const raw = (e - s) / (1000 * 60 * 60);
      durationHours = Math.max(0.5, Math.ceil(raw * 4) / 4);
    }
  }

  const hourly = selectedDesk
    ? Number(selectedDesk.discounted_price ?? selectedDesk.price ?? 0)
    : 0;

  const calculatedPrice = hourly > 0 && durationHours > 0
    ? Number((hourly * durationHours).toFixed(2))
    : 0;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to reserve a desk.');
      navigate('/login');
      return;
    }
    if (!selectedDeskId) {
      toast.error('Please choose a dining desk from the list.');
      return;
    }
    if (selectedDesk && (selectedDesk.is_available === false || selectedDesk.status === 'reserved' || selectedDesk.status === 'booked')) {
      toast.error(`Desk #${selectedDesk.desk_number} is currently reserved. Reserving is blocked until it is released.`);
      return;
    }
    if (!date || !startTime || !endTime) {
      toast.error('Please fill in date, start time, and end time.');
      return;
    }
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (end <= start) {
      toast.error('End time must be after start time.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/desks/reserve', {
        deskId: Number(selectedDeskId),
        date,
        startTime,
        endTime,
        partySize: Number(partySize) || 1,
        withFood: Boolean(withFood),
        specialRequests: specialRequests || null,
      });

      if (res.data.success) {
        const total = Number(res.data.reservation?.totalPrice ?? res.data.reservation?.amount ?? 0);
        if (withFood && total <= 0) {
          toast.success('Desk reserved! Proceed to select your complimentary food menu items.');
          navigate(`/order-food?deskReservationId=${res.data.reservation.id}`);
        } else if (total <= 0 && !withFood) {
          toast.error('Desk fee could not be calculated. Try another duration or desk.');
        } else {
          toast.success(`Desk reserved! Total: ${formatPrice(total)}.`);
          navigate(`/payment?type=desk&id=${res.data.reservation.id}`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting desk reservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inside luxury-page-container">
      {/* Page Header */}
      <div className="luxury-header-box">
        <div className="luxury-badge">🍽️ EXECUTIVE CO-WORKING &amp; DINING DESKS</div>
        <h1 className="page-title">Reserve an Executive Dining Desk</h1>
        <p className="page-subtitle">
          Enjoy dedicated seating in our panoramic terrace, executive lounge, or main dining hall. 
          High-speed fiber WiFi and power outlets at every desk.
        </p>

        {/* Free Desk Promotion Banner */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(39, 174, 96, 0.1)',
          border: '1.5px solid #27ae60',
          borderRadius: 30,
          padding: '8px 20px',
          marginTop: 16,
          color: '#27ae60',
          fontSize: 13,
          fontWeight: 700
        }}>
          <span>🍕 Special Privilege:</span>
          <span>Order food with your reservation and your table fee is <strong>100% Free</strong>!</span>
        </div>
      </div>

      {/* 1. Filter Bar & Search */}
      <div className="luxury-section-panel" style={{ padding: '18px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {locations.map((loc) => (
              <button
                key={loc}
                type="button"
                className={`luxury-food-cat-pill ${selectedLocation === loc ? 'active' : ''}`}
                onClick={() => setSelectedLocation(loc)}
              >
                {loc}
              </button>
            ))}
          </div>

          <input
            type="search"
            placeholder="Search desk number, capacity, price…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="clean-input"
            style={{ flex: '0 1 280px', minWidth: 200, padding: '9px 14px' }}
          />
        </div>
      </div>

      {/* 2. Full-Width Desks Horizontal Carousel Shelves (Max 10 Items Per Shelf) */}
      <div className="luxury-section-panel" style={{ padding: '24px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
          <h2 className="luxury-panel-title" style={{ margin: 0 }}>
            <span>🍽️</span> Available Dining Desks
          </h2>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
            ← Swipe or scroll horizontally (Max 10 tables per shelf) →
          </span>
        </div>
        <p className="luxury-panel-desc">
          Browse our luxury dining spaces arranged into distinct horizontal movable shelves with <strong>at most 10 tables per slider</strong>. Click <strong>"Select Table ➔"</strong> to book below.
        </p>

        {filteredDesks.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No dining desks match your filter criteria.
          </div>
        ) : (
          <div className="luxury-desk-shelves" style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 14 }}>
            {chunkArray(filteredDesks, 10).map((chunk, shelfIdx) => {
              const meta = DESK_SHELF_META[shelfIdx] || {
                title: `Curated Dining Tables (Collection ${shelfIdx + 1})`,
                icon: '🍽️',
                desc: `Reserved executive seating (Tables ${shelfIdx * 10 + 1}–${shelfIdx * 10 + chunk.length})`,
                tag: `Collection ${shelfIdx + 1}`
              };

              return (
                <div
                  key={`desk-shelf-${shelfIdx}`}
                  className="luxury-shelf-card"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 20,
                    padding: '20px 18px 8px 18px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Shelf Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(240, 165, 0, 0.2) 0%, rgba(212, 175, 55, 0.06) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        flexShrink: 0
                      }}>
                        {meta.icon}
                      </div>
                      <div>
                        <h3 style={{
                          margin: 0,
                          fontSize: 17,
                          fontWeight: 700,
                          color: 'var(--text-dark)',
                          fontFamily: 'var(--font-heading)'
                        }}>
                          {meta.title}
                        </h3>
                        <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 11,
                        background: 'rgba(240, 165, 0, 0.12)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        padding: '4px 12px',
                        borderRadius: 16,
                        fontWeight: 700,
                        letterSpacing: 0.5
                      }}>
                        {chunk.length} / 10 Tables
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        ← Scroll 10 tables →
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Scroll containing exactly at most 10 items */}
                  <LuxuryHorizontalScroll itemWidth={310} stepScroll={330}>
                    {chunk.map((d) => {
                      const img = resolveMediaUrl(d.image, 'desks');
                      const isSelected = selectedDeskId === d.id;
                      const isOccupied = d.is_available === false || d.status === 'reserved' || d.status === 'booked';
                      const untilStr = d.occupied_until ? (typeof d.occupied_until === 'string' && d.occupied_until.includes('T') ? new Date(d.occupied_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.occupied_until) : '';
                      return (
                        <div
                          key={d.id}
                          className={`luxury-hscroll-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            if (isOccupied) {
                              toast.error(`Desk #${d.desk_number} is currently reserved${untilStr ? ' until ' + untilStr : ''}. Reserving is blocked until it is released.`);
                              setDetailsModal(d);
                            } else {
                              selectDesk(d.id, d);
                            }
                          }}
                          style={{ cursor: isOccupied ? 'default' : 'pointer' }}
                        >
                          <div className="desk-img-wrap" style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                            <img
                              src={img}
                              alt={`Desk ${d.desk_number}`}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isOccupied ? 'saturate(0.8)' : undefined }}
                            />
                            {isOccupied ? (
                              <span className="desk-status-pill" style={{ background: 'rgba(185, 28, 28, 0.92)', color: '#ffffff', border: '1px solid rgba(239, 68, 68, 0.7)', fontWeight: 800 }}>
                                🔒 Reserved {untilStr ? `(until ${untilStr})` : ''}
                              </span>
                            ) : (
                              <span className="desk-status-pill">
                                ● Available
                              </span>
                            )}
                            <span style={{
                              position: 'absolute',
                              bottom: 8,
                              left: 10,
                              background: 'rgba(11, 19, 41, 0.88)',
                              color: '#d4af37',
                              border: '1px solid rgba(212, 175, 55, 0.5)',
                              padding: '2px 9px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing: 0.5,
                            }}>
                              Table #{d.desk_number}
                            </span>
                          </div>

                          <div className="desk-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <h3 className="desk-card-title" style={{ fontSize: 17, marginBottom: 4 }}>Desk #{d.desk_number}</h3>
                            <div className="desk-card-sub" style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                              📍 {d.location || 'Main Dining Hall'} · 👥 Capacity: {d.capacity || 2} Guests
                            </div>

                            <div className="desk-pricing-row" style={{ marginBottom: 12 }}>
                              {d.has_discount ? (
                                <>
                                  <span className="desk-price-current">{formatPrice(d.discounted_price || d.price || 0)}/hr</span>
                                  <span className="desk-price-orig">{formatPrice(d.original_price || 0)}</span>
                                  <span style={{ fontSize: 11, color: '#27ae60', fontWeight: 800 }}>{d.discount_percent}% OFF</span>
                                </>
                              ) : (
                                <span className="desk-price-current">{formatPrice(d.price || 0)}/hr</span>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                              <button
                                type="button"
                                className="google-clean-btn"
                                style={{ padding: '7px 12px', fontSize: 12 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailsModal(d);
                                }}
                              >
                                Details
                              </button>
                              {isOccupied ? (
                                <button
                                  type="button"
                                  className="auth-gold-submit-btn"
                                  style={{
                                    padding: '7px 14px',
                                    fontSize: 12,
                                    width: 'auto',
                                    flex: 1,
                                    margin: 0,
                                    background: '#334155',
                                    color: '#94a3b8',
                                    border: '1px solid #475569',
                                    cursor: 'not-allowed',
                                    opacity: 0.85
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.error(`Desk #${d.desk_number} is currently reserved. Reserving is blocked until it is released.`);
                                    setDetailsModal(d);
                                  }}
                                  title="Reserved — blocked until released"
                                >
                                  🔒 Reserved
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="auth-gold-submit-btn"
                                  style={{
                                    padding: '7px 14px',
                                    fontSize: 12,
                                    width: 'auto',
                                    flex: 1,
                                    margin: 0,
                                    background: isSelected ? 'linear-gradient(135deg, #27ae60 0%, #219150 100%)' : undefined,
                                    color: isSelected ? '#ffffff' : undefined,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectDesk(d.id, d);
                                  }}
                                >
                                  {isSelected ? '✓ Selected' : 'Select Table ➔'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </LuxuryHorizontalScroll>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Bottom Table Reservation Form (Clean, Spacious, Luxury) */}
      <div id="desk-booking-form-section" className="luxury-section-panel" style={{ scrollMarginTop: 90, marginTop: 28, padding: '30px 28px' }}>
        {/* Form Header with Selected Desk Preview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              fontSize: 32,
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1.5px solid var(--accent)',
              borderRadius: 14,
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🍽️
            </span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                Debre Markos · 5-Star Dining &amp; Co-Working
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, margin: '2px 0 0', color: 'var(--text-dark)' }}>
                Table Reservation Form
              </h2>
            </div>
          </div>

          {/* Selected Desk Badge */}
          <div style={{
            background: selectedDesk ? 'rgba(39, 174, 96, 0.1)' : 'rgba(212, 175, 55, 0.1)',
            border: `1.5px solid ${selectedDesk ? '#27ae60' : 'var(--accent)'}`,
            borderRadius: 14,
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div>
              <div style={{ fontSize: 11, color: selectedDesk ? '#27ae60' : 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                {selectedDesk ? '✓ Active Desk Selection' : '⚠️ No Desk Selected'}
              </div>
              <strong style={{ fontSize: 15, color: 'var(--text-dark)' }}>
                {selectedDesk ? `Desk #${selectedDesk.desk_number} (${selectedDesk.location || 'Main Hall'})` : 'Please pick a table above'}
              </strong>
            </div>
            {selectedDesk && (
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', marginLeft: 8 }}>
                {formatPrice(selectedDesk.discounted_price || selectedDesk.price || 0)}/hr
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleApply}>
          {/* Row 1: Reservation Date, Start Time, End Time in 3 columns */}
          <div className="clean-grid-3" style={{ marginBottom: 18 }}>
            <div className="form-group-clean">
              <label className="clean-label">Reservation Date <span className="req">*</span></label>
              <input
                type="date"
                min={todayStr()}
                className="clean-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group-clean">
              <label className="clean-label">Start Time <span className="req">*</span></label>
              <input
                type="time"
                className="clean-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group-clean">
              <label className="clean-label">End Time <span className="req">*</span></label>
              <input
                type="time"
                className="clean-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Party Size & Free With Food Checkbox */}
          <div className="clean-grid-2" style={{ marginBottom: 18 }}>
            <div className="form-group-clean">
              <label className="clean-label">Party Size (Number of Guests)</label>
              <input
                type="number"
                min={1}
                max={selectedDesk ? selectedDesk.capacity : 12}
                className="clean-input"
                value={partySize}
                onChange={(e) => setPartySize(Math.max(1, Number(e.target.value)))}
              />
            </div>

            <div style={{
              background: withFood ? 'rgba(39, 174, 96, 0.12)' : 'var(--bg-main)',
              border: withFood ? '1.5px solid #27ae60' : '1px dashed var(--border)',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: withFood ? '#27ae60' : 'var(--text-dark)' }}>
                <input
                  type="checkbox"
                  checked={withFood}
                  onChange={(e) => setWithFood(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#27ae60' }}
                />
                <span>🍕 Pair with Food Order (Desk Reservation is FREE!)</span>
              </label>
              <p style={{ margin: '4px 0 0 28px', fontSize: 12, color: 'var(--text-muted)' }}>
                Order lunch, dinner, or snacks and your table fee will be automatically waived.
              </p>
            </div>
          </div>

          {/* Row 3: Special Requests */}
          <div className="form-group-clean" style={{ marginBottom: 20 }}>
            <label className="clean-label">Special Requests (Optional)</label>
            <textarea
              className="clean-input"
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Terrace window view, quiet table for laptop work, extra power strip, floral setup…"
            />
          </div>

          {/* Row 4: Pricing Summary & Confirm Button Bar */}
          {selectedDesk && (selectedDesk.is_available === false || selectedDesk.status === 'reserved' || selectedDesk.status === 'booked') && (
            <div style={{
              padding: '14px 18px',
              marginBottom: 16,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid rgba(239, 68, 68, 0.5)',
              borderRadius: 12,
              color: '#ef4444',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ fontSize: 24 }}>🔒</span>
              <div>
                <div>Desk #{selectedDesk.desk_number} is currently reserved / occupied.</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginTop: 2 }}>
                  Another customer has reserved this table. Reserving is blocked until it is released. Please select an available table from the shelves above.
                </div>
              </div>
            </div>
          )}

          <div style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20
          }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Estimated Duration
                </div>
                <strong style={{ fontSize: 16, color: 'var(--text-dark)' }}>
                  {durationHours > 0 ? `${durationHours} Hours` : '0 Hours'}
                </strong>
              </div>

              <div style={{ height: 32, width: 1, background: 'var(--border)' }} />

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Desk Fee
                </div>
                {withFood ? (
                  <strong style={{ fontSize: 16, color: '#27ae60' }}>FREE (Waived)</strong>
                ) : (
                  <strong style={{ fontSize: 16, color: 'var(--text-dark)' }}>{formatPrice(calculatedPrice)}</strong>
                )}
              </div>

              <div style={{ height: 32, width: 1, background: 'var(--border)' }} />

              <div>
                <div style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total to Pay
                </div>
                <strong style={{ fontSize: 22, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                  {withFood ? formatPrice(0) : formatPrice(calculatedPrice)}
                </strong>
              </div>
            </div>

            <button
              type="submit"
              className="auth-gold-submit-btn"
              disabled={loading || (selectedDesk && (selectedDesk.is_available === false || selectedDesk.status === 'reserved' || selectedDesk.status === 'booked'))}
              style={{
                width: 'auto',
                minWidth: 260,
                padding: '14px 28px',
                margin: 0,
                fontSize: 15,
                ...(selectedDesk && (selectedDesk.is_available === false || selectedDesk.status === 'reserved' || selectedDesk.status === 'booked') ? {
                  background: '#334155',
                  color: '#94a3b8',
                  border: '1px solid #475569',
                  cursor: 'not-allowed',
                  opacity: 0.85
                } : {})
              }}
            >
              {loading
                ? 'Confirming Table…'
                : (selectedDesk && (selectedDesk.is_available === false || selectedDesk.status === 'reserved' || selectedDesk.status === 'booked')
                  ? '🔒 Table Reserved (Blocked)'
                  : (withFood ? '🍽️ Reserve Free Desk & Order Food ➔' : '🍽️ Confirm Table & Pay ➔'))}
            </button>
          </div>
        </form>
      </div>

      {/* Details Modal */}
      {detailsModal && (
        <div className="invoice-modal-backdrop" onClick={() => setDetailsModal(null)}>
          <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 10px' }}>Desk #{detailsModal.desk_number}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 14px' }}>
              📍 {detailsModal.location} · Capacity: {detailsModal.capacity} Guests
            </p>
            <img
              src={resolveMediaUrl(detailsModal.image, 'desks')}
              alt=""
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 14 }}
            />
            <p style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.5, marginBottom: 16 }}>
              {detailsModal.description || 'Spacious table with ergonomic seating, power ports, and complimentary fiber WiFi.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>
                {formatPrice(detailsModal.discounted_price || detailsModal.price || 0)} / hour
              </span>
              {detailsModal.is_available === false || detailsModal.status === 'reserved' || detailsModal.status === 'booked' ? (
                <span style={{
                  padding: '9px 18px',
                  borderRadius: 10,
                  background: '#334155',
                  color: '#94a3b8',
                  border: '1px solid #475569',
                  fontSize: 13,
                  fontWeight: 700
                }}>
                  🔒 Reserved (Unavailable)
                </span>
              ) : (
                <button
                  type="button"
                  className="auth-gold-submit-btn"
                  style={{ width: 'auto', padding: '9px 18px' }}
                  onClick={() => {
                    selectDesk(detailsModal.id, detailsModal);
                    setDetailsModal(null);
                  }}
                >
                  Select This Desk
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
