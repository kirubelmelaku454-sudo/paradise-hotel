import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import LuxuryLogo from '../Common/LuxuryLogo';
import { LanguageContext } from '../../context/LanguageContext';

const GALLERY_ITEMS = [
  // Suites & Penthouses
  {
    id: 1,
    title: 'Imperial Presidential Penthouse',
    category: 'Suites & Penthouses',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    desc: 'Top-tier master suite featuring 360° panoramic plateau views, king canopy bed, and private butler service.',
    link: '/reserve-room'
  },
  {
    id: 2,
    title: 'Royal Honeymoon Suite with Jacuzzi',
    category: 'Suites & Penthouses',
    img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    desc: 'Romantic suite with marble jacuzzi tub, rose champagne lounge, and sunset terrace.',
    link: '/reserve-room'
  },
  {
    id: 3,
    title: 'Executive Mountain View Living Room',
    category: 'Suites & Penthouses',
    img: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    desc: 'Spacious parlor with ergonomic workstation, plush velvet sofas, and floor-to-ceiling windows.',
    link: '/reserve-room'
  },
  {
    id: 4,
    title: 'Deluxe Twin Garden Sanctuary',
    category: 'Suites & Penthouses',
    img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    desc: 'Serene twin suite with private garden patio, custom artisan wood furniture, and rain shower.',
    link: '/reserve-room'
  },

  // Fine Dining & Culinary
  {
    id: 5,
    title: 'Grand Palace Dining Hall',
    category: 'Fine Dining & Culinary',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    desc: 'Opulent indoor dining illuminated by crystal chandeliers and private velvet booths.',
    link: '/reserve-desk'
  },
  {
    id: 6,
    title: 'Master Chef Doro Wat & Traditional Platter',
    category: 'Fine Dining & Culinary',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    desc: 'Slow-simmered organic poultry with authentic berbere spices, boiled farm eggs, and fresh injera.',
    link: '/order-food'
  },
  {
    id: 7,
    title: 'Traditional Ethiopian Jebena Coffee Ceremony',
    category: 'Fine Dining & Culinary',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    desc: 'Freshly roasted highlands coffee beans served in clay jebena with smoking frankincense and popcorn.',
    link: '/order-food'
  },
  {
    id: 8,
    title: 'Grand Reserve Cellar & Mixology Bar',
    category: 'Fine Dining & Culinary',
    img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    desc: 'Curated international wines, Ethiopian Rift Valley vintages, and craft cocktail mixology.',
    link: '/order-food'
  },

  // Pool & Wellness
  {
    id: 9,
    title: 'Azure Heated Swimming Pool',
    category: 'Pool & Wellness',
    img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
    desc: 'Temperature-controlled outdoor azure pool surrounded by sun loungers and tropical greenery.',
    link: '/reserve-desk'
  },
  {
    id: 10,
    title: 'VIP Poolside Pergolas & Cabanas',
    category: 'Pool & Wellness',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    desc: 'Private shaded cabanas with towel service, fruit platters, and poolside cocktail attendants.',
    link: '/reserve-desk'
  },
  {
    id: 11,
    title: 'Paradise Spa & Hydrotherapy Sanctuary',
    category: 'Pool & Wellness',
    img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    desc: 'Holistic aromatherapy, deep tissue massages, eucalyptus steam rooms, and mineral baths.',
    link: '/contact'
  },

  // Conferences & Grand Events
  {
    id: 12,
    title: 'Choke Grand Ballroom & Banquet Hall',
    category: 'Conferences & Events',
    img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    desc: 'Seats up to 500 guests for prestigious weddings, state banquets, and international summits.',
    link: '/contact'
  },
  {
    id: 13,
    title: 'Executive Diplomatic Boardroom',
    category: 'Conferences & Events',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    desc: 'High-speed fiber connectivity, dual 4K teleconference screens, and leather executive seating.',
    link: '/contact'
  },

  // Debre Markos & Nature
  {
    id: 14,
    title: 'Terrace Sunset Deck Overlooking Debre Markos',
    category: 'Debre Markos & Nature',
    img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    desc: 'Panoramic open-air terrace with sweeping sunset views of the historic Gojjam plateau.',
    link: '/reserve-desk'
  },
  {
    id: 15,
    title: 'Scenic Vistas of Mount Choke',
    category: 'Debre Markos & Nature',
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    desc: 'The iconic water tower of Ethiopia rising majestically in the distance, framed from hotel balconies.',
    link: '/rooms'
  },
  {
    id: 16,
    title: 'Lush Botanical Courtyard & Fountain',
    category: 'Debre Markos & Nature',
    img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    desc: 'Tranquil flower gardens, bubbling fountains, and peaceful pathways for evening walks.',
    link: '/reserve-desk'
  }
];

const CATEGORIES = [
  'All',
  'Suites & Penthouses',
  'Fine Dining & Culinary',
  'Pool & Wellness',
  'Conferences & Events',
  'Debre Markos & Nature'
];

export default function Gallery() {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filteredItems = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  const openLightbox = (item) => setSelectedPhoto(item);
  const closeLightbox = () => setSelectedPhoto(null);

  const goNext = (e) => {
    e.stopPropagation();
    if (!selectedPhoto) return;
    const currentIndex = filteredItems.findIndex(i => i.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedPhoto(filteredItems[nextIndex]);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    if (!selectedPhoto) return;
    const currentIndex = filteredItems.findIndex(i => i.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedPhoto(filteredItems[prevIndex]);
  };

  return (
    <div className="inside luxury-page-container" style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 16px 60px' }}>
      {/* 5-Star Luxury Header */}
      <div className="luxury-header-box text-center" style={{ marginBottom: 28, padding: '32px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <LuxuryLogo size="large" showText={false} />
        </div>
        <div className="luxury-badge">👑 VIRTUAL TOUR &amp; 5-STAR RESORT GALLERY</div>
        <h1 className="page-title" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', margin: '6px 0 10px' }}>
          Discover the Elegance of Paradise Hotel
        </h1>
        <p className="page-subtitle" style={{ fontSize: 15, maxWidth: 650, margin: '0 auto', color: 'var(--text-muted)' }}>
          Explore our premier suites, grand dining rooms, heated pools, and breathtaking Debre Markos highland landscapes.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 30 }}>
        {CATEGORIES.map(cat => {
          const count = cat === 'All' ? GALLERY_ITEMS.length : GALLERY_ITEMS.filter(i => i.category === cat).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`luxury-food-cat-pill ${isActive ? 'active' : ''}`}
              style={{ padding: '9px 18px', fontSize: 13 }}
            >
              <span>{cat}</span>
              <span style={{ fontSize: 11, opacity: 0.85, marginLeft: 4 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Masonry / Photo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 24,
        marginBottom: 36
      }}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => openLightbox(item)}
            className="card luxury-card"
            style={{
              padding: 0,
              overflow: 'hidden',
              cursor: 'pointer',
              borderRadius: 20,
              position: 'relative',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            {/* Image Wrap */}
            <div style={{ height: 250, position: 'relative', overflow: 'hidden' }}>
              <img
                src={item.img}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.06)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1.0)'}
              />
              <span style={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: 'rgba(11, 19, 41, 0.85)',
                color: '#f0a500',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 14,
                backdropFilter: 'blur(4px)'
              }}>
                {item.category}
              </span>

              <span style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                background: 'rgba(0,0,0,0.65)',
                color: '#ffffff',
                fontSize: 12,
                padding: '3px 8px',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                🔍 View Fullscreen
              </span>
            </div>

            {/* Body */}
            <div style={{ padding: '18px 20px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 18, color: 'var(--text-dark)', fontFamily: 'var(--font-heading)' }}>
                {item.title}
              </h3>
              <p style={{
                margin: 0,
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 24, 0.94)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(8px)'
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: 24,
              right: 28,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              fontSize: 28,
              width: 44,
              height: 44,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001
            }}
          >
            ×
          </button>

          {/* Left Arrow */}
          <button
            type="button"
            onClick={goPrev}
            style={{
              position: 'absolute',
              left: 20,
              background: 'rgba(240, 165, 0, 0.25)',
              border: '1.5px solid #f0a500',
              color: '#ffffff',
              fontSize: 32,
              width: 50,
              height: 50,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001
            }}
          >
            ‹
          </button>

          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 960,
              width: '100%',
              background: '#0e172a',
              borderRadius: 24,
              overflow: 'hidden',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ position: 'relative', maxHeight: '65vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={selectedPhoto.img}
                alt={selectedPhoto.title}
                style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain' }}
              />
            </div>

            <div style={{ padding: '24px 28px', background: '#0e172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: '#f0a500', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                  {selectedPhoto.category}
                </span>
                <h2 style={{ margin: '4px 0 6px', fontSize: 22, fontFamily: 'var(--font-heading)' }}>
                  {selectedPhoto.title}
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: '#cbd5e1', maxWidth: 580 }}>
                  {selectedPhoto.desc}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-luxury-gold"
                  onClick={() => {
                    closeLightbox();
                    navigate(selectedPhoto.link);
                  }}
                  style={{ padding: '12px 24px', fontSize: 13, fontWeight: 800 }}
                >
                  Book Experience ➔
                </button>
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={goNext}
            style={{
              position: 'absolute',
              right: 20,
              background: 'rgba(240, 165, 0, 0.25)',
              border: '1.5px solid #f0a500',
              color: '#ffffff',
              fontSize: 32,
              width: 50,
              height: 50,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

