import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import LuxuryHorizontalScroll from '../Common/LuxuryHorizontalScroll';
import { SkeletonGrid } from '../Common/SkeletonLoader';
import { CurrencyContext } from '../../context/CurrencyContext';
import { LanguageContext } from '../../context/LanguageContext';

const resolveMediaUrl = (src, folder = 'rooms') => {
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

const resolveImg = (src) => resolveMediaUrl(src, 'rooms');

// Chunk array into max 10 items per horizontal slider
const chunkArray = (arr, size = 10) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const ROOM_SHELF_META = [
  {
    title: 'Royal & Presidential Penthouse Collection',
    icon: '👑',
    desc: 'Top-tier luxury penthouse suites with private jacuzzis, butler service, and panoramic terrace views (Suites 401–308)',
    tag: 'Penthouse Collection'
  },
  {
    title: 'Executive Mountain & Panoramic City Suites',
    icon: '🏔️',
    desc: 'Spacious executive suites featuring scenic views of Mount Choke and private living lounges (Suites 201–210)',
    tag: 'Executive Suites'
  },
  {
    title: 'Deluxe Comfort & Tranquil Garden Rooms',
    icon: '🌿',
    desc: 'Refined deluxe comfort rooms with plush queen beds, fiber WiFi, and tranquil courtyard views (Rooms 101–110)',
    tag: 'Deluxe Comfort'
  }
];

export default function Rooms() {
  const { formatPrice } = useContext(CurrencyContext);
  const { t } = useContext(LanguageContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsModal, setDetailsModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/rooms/available')
      .then((res) => setRooms(res.data.rooms || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Penthouse', 'Executive', 'Deluxe', 'Suite'];

  const filteredRooms = rooms.filter((r) => {
    const typeStr = (r.room_type || r.type || '').toLowerCase();
    if (selectedCategory !== 'All') {
      const matchCat = selectedCategory.toLowerCase();
      if (!typeStr.includes(matchCat)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hay = `${r.room_number || ''} ${r.room_type || r.type || ''} ${r.description || ''} ${r.amenities || ''} ${r.price_per_night || r.price || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const handleApply = (roomId) => navigate(`/reserve-room?roomId=${roomId}`);

  return (
    <div className="inside" style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 8 }}>
          🏨 <span style={{ color: 'var(--accent)' }}>Luxury Rooms &amp; Suites</span> Directory
        </h1>
        <p className="page-subtitle" style={{ maxWidth: 650, margin: '0 auto', color: 'var(--text-muted)' }}>
          Explore our 30 world-class suites and rooms arranged across dedicated horizontal movable collections with <strong>at most 10 rooms per shelf</strong>.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="luxury-section-panel" style={{ padding: '18px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const count = cat === 'All'
                ? rooms.length
                : rooms.filter(r => (r.room_type || r.type || '').toLowerCase().includes(cat.toLowerCase())).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`luxury-food-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span style={{
                      fontSize: 11,
                      marginLeft: 4,
                      opacity: 0.85
                    }}>
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <input
            type="search"
            placeholder="Search room number, type, features, price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="clean-input"
            style={{ flex: '0 1 300px', minWidth: 220, padding: '9px 14px' }}
          />
        </div>
      </div>

      {/* Shelves of Max 10 Rooms Each */}
      {loading ? (
        <div style={{ padding: '20px 0' }}>
          <SkeletonGrid count={3} height={320} columns="repeat(auto-fit, minmax(300px, 1fr))" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No luxury rooms match your search criteria.
        </div>
      ) : (
        <div className="luxury-room-shelves" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {chunkArray(filteredRooms, 10).map((chunk, shelfIdx) => {
            const meta = ROOM_SHELF_META[shelfIdx] || {
              title: `Curated Luxury Collection (Shelf ${shelfIdx + 1})`,
              icon: '🛏️',
              desc: `Handpicked suites and deluxe rooms (Rooms ${shelfIdx * 10 + 1}–${shelfIdx * 10 + chunk.length})`,
              tag: `Collection ${shelfIdx + 1}`
            };

            return (
              <div
                key={`room-shelf-${shelfIdx}`}
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
                      {chunk.length} / 10 Rooms
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      ← Scroll 10 rooms →
                    </span>
                  </div>
                </div>

                {/* Horizontal Scroll containing exactly at most 10 items */}
                <LuxuryHorizontalScroll itemWidth={310} stepScroll={330}>
                  {chunk.map((room) => {
                    const img = resolveImg(room.image);
                    return (
                      <div
                        key={room.id}
                        className="luxury-hscroll-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleApply(room.id)}
                      >
                        <div className="desk-img-wrap" style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={img}
                            alt={`Room ${room.room_number}`}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span className="desk-status-pill">
                            ● {room.status === 'available' ? 'Available' : room.status}
                          </span>
                          <span style={{
                            position: 'absolute',
                            bottom: 10,
                            left: 10,
                            background: 'rgba(11, 19, 41, 0.88)',
                            color: '#d4af37',
                            border: '1px solid rgba(212, 175, 55, 0.5)',
                            padding: '3px 9px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: 0.5,
                          }}>
                            Suite #{room.room_number}
                          </span>
                        </div>

                        <div className="desk-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <h3 className="desk-card-title" style={{ fontSize: 17, marginBottom: 4 }}>
                            Room #{room.room_number}
                          </h3>
                          <div className="desk-card-sub" style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                            📍 {room.room_type || room.type} · 👥 {room.capacity || 2} Persons
                          </div>

                          <p style={{
                            fontSize: 13,
                            color: 'var(--text-muted)',
                            lineHeight: 1.4,
                            marginBottom: 10,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {room.description || 'Spacious 5-star suite with premium bedding, fiber WiFi, and 24/7 room service.'}
                          </p>

                          <div className="desk-pricing-row" style={{ marginBottom: 12 }}>
                            <span className="desk-price-current">{formatPrice(room.price_per_night || room.price || 0)}/night</span>
                          </div>

                          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                            <button
                              type="button"
                              className="google-clean-btn"
                              style={{ padding: '7px 12px', fontSize: 12 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailsModal(room);
                              }}
                            >
                              {t('details', 'Details')}
                            </button>
                            <button
                              type="button"
                              className="auth-gold-submit-btn"
                              style={{
                                padding: '7px 14px',
                                fontSize: 12,
                                width: 'auto',
                                flex: 1,
                                margin: 0
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApply(room.id);
                              }}
                            >
                              {t('reserveNow', 'Reserve Suite ➔')}
                            </button>
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

      {/* Details Modal */}
      {detailsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
          onClick={() => setDetailsModal(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 20,
              maxWidth: 520,
              width: '100%',
              padding: 24,
              position: 'relative',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDetailsModal(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 16,
                border: 'none',
                background: 'none',
                fontSize: 26,
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              ×
            </button>
            <h2 style={{ marginTop: 0, fontFamily: 'var(--font-heading)', color: 'var(--text-dark)' }}>
              Room #{detailsModal.room_number} — {detailsModal.room_type}
            </h2>
            <img
              src={resolveImg(detailsModal.image)}
              alt=""
              style={{ width: '100%', height: 230, objectFit: 'cover', borderRadius: 14, marginBottom: 14 }}
            />
            <p style={{ margin: '6px 0', fontSize: 14 }}>
              <strong>Type:</strong> {detailsModal.room_type}
            </p>
            <p style={{ margin: '6px 0', fontSize: 14 }}>
              <strong>Capacity:</strong> {detailsModal.capacity} persons
            </p>
            <p style={{ margin: '6px 0', fontSize: 14 }}>
              <strong>Rate:</strong> <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{formatPrice(detailsModal.price_per_night || 0)}</span> / night
            </p>
            <p style={{ margin: '6px 0', fontSize: 14 }}>
              <strong>Amenities:</strong> {detailsModal.amenities || 'WiFi, Jacuzzi, Balcony, AC, Smart TV'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>
              {detailsModal.description}
            </p>
            <button
              type="button"
              onClick={() => {
                const id = detailsModal.id;
                setDetailsModal(null);
                handleApply(id);
              }}
              className="auth-gold-submit-btn"
              style={{ width: '100%', marginTop: 16, padding: 13, borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}
            >
              {t('reserveNow', 'Reserve this Suite Now ➔')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
