import React from 'react';

/**
 * SkeletonCard Component
 * Shimmering placeholder for cards, rooms, and menu items during data loading.
 */
export function SkeletonCard({ height = 240, hasImage = true }) {
  return (
    <div className="skeleton-card" style={{ height }}>
      {hasImage && <div className="skeleton-shimmer skeleton-image" />}
      <div className="skeleton-content">
        <div className="skeleton-shimmer skeleton-title" />
        <div className="skeleton-shimmer skeleton-text" style={{ width: '85%' }} />
        <div className="skeleton-shimmer skeleton-text" style={{ width: '60%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10 }}>
          <div className="skeleton-shimmer skeleton-badge" />
          <div className="skeleton-shimmer skeleton-btn" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonGrid Component
 * Renders multiple SkeletonCards in a responsive CSS grid.
 */
export function SkeletonGrid({ count = 6, height = 260, columns = 'repeat(auto-fill, minmax(280px, 1fr))' }) {
  return (
    <div className="skeleton-grid" style={{ display: 'grid', gridTemplateColumns: columns, gap: 16 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} height={height} />
      ))}
    </div>
  );
}

/**
 * SkeletonList Component
 * Renders list rows (e.g. for bookings, reservations, table rows).
 */
export function SkeletonList({ count = 4, height = 75 }) {
  return (
    <div className="skeleton-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-list-item" style={{ height }}>
          <div className="skeleton-shimmer skeleton-avatar" />
          <div style={{ flex: 1 }}>
            <div className="skeleton-shimmer skeleton-text" style={{ width: '40%', height: 14, marginBottom: 8 }} />
            <div className="skeleton-shimmer skeleton-text" style={{ width: '70%', height: 10 }} />
          </div>
          <div className="skeleton-shimmer skeleton-btn" style={{ width: 80, height: 32 }} />
        </div>
      ))}
    </div>
  );
}

export default {
  SkeletonCard,
  SkeletonGrid,
  SkeletonList
};
