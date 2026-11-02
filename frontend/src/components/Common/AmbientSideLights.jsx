import React from 'react';

/**
 * AmbientSideLights Component
 * Renders glowing luxury colored ambient light auras on the left and right sides of pages.
 * Fully responsive, non-blocking (pointer-events: none), and automatically adjusts
 * across dark mode and light mode.
 */
export default function AmbientSideLights() {
  return (
    <div className="ambient-side-lights-container" aria-hidden="true">
      {/* Left Ambient Side Aura (Warm Gold / Sunburst) */}
      <div className="ambient-side-glow ambient-side-left">
        <div className="ambient-orb ambient-orb-gold" />
        <div className="ambient-beam ambient-beam-left" />
      </div>

      {/* Right Ambient Side Aura (Cyan / Sapphire / Violet) */}
      <div className="ambient-side-glow ambient-side-right">
        <div className="ambient-orb ambient-orb-cyan" />
        <div className="ambient-beam ambient-beam-right" />
      </div>
    </div>
  );
}

