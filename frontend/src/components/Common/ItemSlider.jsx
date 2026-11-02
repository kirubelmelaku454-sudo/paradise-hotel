import React, { useState, useRef, useEffect } from 'react';

/**
 * 5-Star Ultra-Luxury Horizontal Slider / Carousel.
 * Provides smooth horizontal movement, touch swipe, mouse drag, and golden navigation controls.
 */
export default function ItemSlider({
  items = [],
  renderItem,
  getKey = (item, i) => item.id ?? i,
  emptyMessage = 'No luxury items to display',
  height = 420,
  categoryLabel = 'Item',
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchDelta = useRef(0);
  const trackRef = useRef(null);
  const mouseDown = useRef(false);
  const mouseStartX = useRef(0);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  useEffect(() => {
    if (items.length > 0 && index >= items.length) {
      setIndex(items.length - 1);
    }
  }, [items.length, index]);

  const go = (dir) => {
    if (!items.length) return;
    setIndex((i) => {
      const next = i + dir;
      if (next < 0) return items.length - 1;
      if (next >= items.length) return 0;
      return next;
    });
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };

  const onTouchMove = (e) => {
    if (touchStartX.current == null) return;
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 40) {
      go(touchDelta.current < 0 ? 1 : -1);
    }
    touchStartX.current = null;
    touchDelta.current = 0;
  };

  const onMouseDown = (e) => {
    mouseDown.current = true;
    mouseStartX.current = e.clientX;
  };

  const onMouseUp = (e) => {
    if (!mouseDown.current) return;
    mouseDown.current = false;
    const dx = e.clientX - mouseStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  const onMouseLeave = () => {
    mouseDown.current = false;
  };

  if (!items.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px 20px',
        color: 'var(--text-muted, #888)',
        background: 'var(--bg-main, #f9f9f9)',
        border: '1.5px dashed var(--border, #ddd)',
        borderRadius: 20,
      }}>
        {emptyMessage}
      </div>
    );
  }

  const safeIndex = Math.min(index, items.length - 1);

  return (
    <div className="item-slider-root" style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* Top Header Pill with Counter & Horizontal Navigation Hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          padding: '0 4px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.45)',
            color: 'var(--accent, #d4af37)',
            padding: '5px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.5px',
          }}
        >
          <span>👑</span>
          <span>{safeIndex + 1} of {items.length} {categoryLabel ? categoryLabel + 's' : ''}</span>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted, #888)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>← Swipe horizontally →</span>
        </div>
      </div>

      {/* Main Horizontal Slide Container */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 22,
          minHeight: height,
          background: 'var(--bg-card, #ffffff)',
          border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.12)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            width: `${items.length * 100}%`,
            transform: `translateX(-${(safeIndex * 100) / items.length}%)`,
            transition: 'transform 0.42s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {items.map((item, i) => (
            <div
              key={getKey(item, i)}
              style={{
                width: `${100 / items.length}%`,
                flexShrink: 0,
                boxSizing: 'border-box',
                padding: '4px',
              }}
            >
              {renderItem(item, i, safeIndex === i)}
            </div>
          ))}
        </div>

        {/* Left & Right Gold Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous Item"
              onClick={() => go(-1)}
              style={arrowStyle('left')}
              className="slider-nav-arrow"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next Item"
              onClick={() => go(1)}
              style={arrowStyle('right')}
              className="slider-nav-arrow"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {items.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 7,
            marginTop: 16,
            flexWrap: 'wrap',
          }}
        >
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to item ${i + 1}`}
              onClick={() => setIndex(i)}
              style={{
                width: i === safeIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === safeIndex
                  ? 'linear-gradient(135deg, #f5b01b 0%, #d4af37 100%)'
                  : 'rgba(212, 175, 55, 0.25)',
                boxShadow: i === safeIndex ? '0 0 10px rgba(212, 175, 55, 0.6)' : 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function arrowStyle(side) {
  return {
    position: 'absolute',
    top: '50%',
    [side]: 12,
    transform: 'translateY(-50%)',
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: '1.5px solid rgba(255, 255, 255, 0.7)',
    background: 'linear-gradient(135deg, #f5b01b 0%, #e59400 100%)',
    color: '#0b1325',
    fontSize: 28,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    boxShadow: '0 8px 24px rgba(240, 165, 0, 0.5), 0 2px 8px rgba(0,0,0,0.3)',
    zIndex: 6,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };
}
