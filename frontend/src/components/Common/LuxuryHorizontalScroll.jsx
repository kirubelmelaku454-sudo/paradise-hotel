import React, { useRef, useState, useEffect } from 'react';

/**
 * LuxuryHorizontalScroll
 * Renders multiple distinct cards side-by-side in a horizontal scrolling track.
 * Supports left/right gold arrows, touch swipe, mouse drag, and smooth scrolling.
 */
export default function LuxuryHorizontalScroll({
  children,
  className = '',
  itemWidth = 310,
  stepScroll = 330,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const delta = direction === 'left' ? -stepScroll : stepScroll;
    scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftPos.current = scrollRef.current.scrollLeft;
  };

  const onMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
    checkScroll();
  };

  const onMouseUpOrLeave = () => {
    isDragging.current = false;
    checkScroll();
  };

  return (
    <div className={`luxury-hscroll-wrapper ${className}`}>
      {/* Left Navigation Arrow */}
      {canScrollLeft && (
        <button
          type="button"
          className="luxury-hscroll-arrow left"
          onClick={() => scroll('left')}
          title="Scroll Left"
          aria-label="Scroll Left"
        >
          ‹
        </button>
      )}

      {/* Horizontal Track Containing Distinct Cards */}
      <div
        ref={scrollRef}
        className="luxury-hscroll-track"
        onScroll={checkScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
      >
        {children}
      </div>

      {/* Right Navigation Arrow */}
      {canScrollRight && (
        <button
          type="button"
          className="luxury-hscroll-arrow right"
          onClick={() => scroll('right')}
          title="Scroll Right"
          aria-label="Scroll Right"
        >
          ›
        </button>
      )}
    </div>
  );
}

