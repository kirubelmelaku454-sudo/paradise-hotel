import React, { useState } from 'react';

/**
 * LuxuryBarChart Component
 * Pure SVG animated bar chart with gradients, hover tooltips, and gridlines.
 * Zero external dependencies.
 */
export function LuxuryBarChart({
  data = [],
  title = 'Revenue & Occupancy Velocity',
  subtitle = 'Monthly comparison in ETB',
  height = 240,
  colorScheme = 'gold', // 'gold' | 'emerald' | 'sapphire' | 'royal'
  unit = 'ETB'
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="luxury-chart-container" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted, #888)' }}>
        No chart data available.
      </div>
    );
  }

  const values = data.map(d => Number(d.value || 0));
  const maxVal = Math.max(...values, 100);
  const chartHeight = height - 60;
  const paddingX = 40;
  const chartWidth = 560;
  const barWidth = Math.min(42, Math.max(16, (chartWidth - paddingX * 2) / data.length - 14));

  const getGradient = () => {
    switch (colorScheme) {
      case 'emerald':
        return { start: '#2ecc71', end: '#27ae60', glow: 'rgba(46, 204, 113, 0.4)' };
      case 'sapphire':
        return { start: '#3498db', end: '#2980b9', glow: 'rgba(52, 152, 219, 0.4)' };
      case 'royal':
        return { start: '#9b59b6', end: '#8e44ad', glow: 'rgba(155, 89, 182, 0.4)' };
      case 'gold':
      default:
        return { start: '#ffd700', end: '#d4af37', glow: 'rgba(212, 175, 55, 0.4)' };
    }
  };

  const grad = getGradient();

  return (
    <div className="luxury-chart-container" style={{
      background: 'var(--card-bg, #ffffff)',
      borderRadius: 16,
      border: '1px solid rgba(212, 175, 55, 0.2)',
      padding: '20px 22px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-dark, #1a1a2e)', letterSpacing: '0.3px' }}>
            {title}
          </h4>
          {subtitle && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted, #777)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div style={{
            background: '#1a1a2e',
            color: '#f0a500',
            padding: '4px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.2s ease'
          }}>
            {data[hoveredIdx].label}: {Number(data[hoveredIdx].value).toLocaleString()} {unit}
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`barGrad-${colorScheme}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={grad.start} stopOpacity="1" />
            <stop offset="100%" stopColor={grad.end} stopOpacity="0.85" />
          </linearGradient>
          <filter id={`barGlow-${colorScheme}`} x1="-20%" y1="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={grad.glow} />
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = chartHeight - pct * (chartHeight - 30) + 15;
          const val = Math.round(maxVal * pct);
          return (
            <g key={idx}>
              <line
                x1={paddingX - 10}
                y1={y}
                x2={chartWidth - 10}
                y2={y}
                stroke="rgba(150, 150, 150, 0.15)"
                strokeDasharray="3 3"
              />
              <text
                x={paddingX - 15}
                y={y + 3}
                fontSize="10"
                fill="var(--text-muted, #888)"
                textAnchor="end"
              >
                {val > 999 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const val = Number(item.value || 0);
          const barHeight = Math.max(6, (val / maxVal) * (chartHeight - 30));
          const stepX = (chartWidth - paddingX * 2) / data.length;
          const x = paddingX + idx * stepX + (stepX - barWidth) / 2;
          const y = chartHeight + 15 - barHeight;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={`url(#barGrad-${colorScheme})`}
                filter={isHovered ? `url(#barGlow-${colorScheme})` : 'none'}
                opacity={hoveredIdx !== null && !isHovered ? 0.45 : 1}
                style={{
                  transition: 'all 0.25s ease',
                  transformOrigin: `${x + barWidth / 2}px ${chartHeight + 15}px`,
                  transform: isHovered ? 'scaleY(1.04) scaleX(1.08)' : 'scale(1)'
                }}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + 34}
                fontSize="11"
                fontWeight={isHovered ? 700 : 500}
                fill={isHovered ? 'var(--accent, #f0a500)' : 'var(--text-muted, #777)'}
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * LuxuryDoughnutChart Component
 * Circular SVG proportion chart with central summary and interactive legend.
 */
export function LuxuryDoughnutChart({
  segments = [],
  title = 'Revenue & Activity Breakdown',
  subtitle = 'Distribution by department',
  centerLabel = 'Total',
  centerValue = ''
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = segments.reduce((sum, s) => sum + Number(s.value || 0), 0);
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  const defaultColors = ['#f0a500', '#27ae60', '#3498db', '#9b59b6', '#e67e22', '#e74c3c'];

  return (
    <div className="luxury-chart-container" style={{
      background: 'var(--card-bg, #ffffff)',
      borderRadius: 16,
      border: '1px solid rgba(212, 175, 55, 0.2)',
      padding: '20px 22px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-dark, #1a1a2e)' }}>
          {title}
        </h4>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted, #777)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(150,150,150,0.12)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {segments.map((seg, idx) => {
              const val = Number(seg.value || 0);
              const pct = total > 0 ? val / total : 0;
              const strokeDasharray = `${pct * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += pct * circumference;
              const color = seg.color || defaultColors[idx % defaultColors.length];
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: isHovered ? 'drop-shadow(0 0 6px rgba(240, 165, 0, 0.6))' : 'none',
                    opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1
                  }}
                />
              );
            })}
          </svg>

          {/* Central label inside donut */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted, #777)' }}>
              {hoveredIdx !== null && segments[hoveredIdx] ? segments[hoveredIdx].label : centerLabel}
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent, #f0a500)', marginTop: 2 }}>
              {hoveredIdx !== null && segments[hoveredIdx]
                ? `${Math.round(((segments[hoveredIdx].value || 0) / (total || 1)) * 100)}%`
                : (centerValue || (total > 999 ? `${(total / 1000).toFixed(1)}k` : total))}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 170, flex: 1 }}>
          {segments.map((seg, idx) => {
            const val = Number(seg.value || 0);
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            const color = seg.color || defaultColors[idx % defaultColors.length];
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: isHovered ? 'rgba(212,175,55,0.08)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  <span style={{ fontSize: 13, fontWeight: isHovered ? 700 : 500, color: 'var(--text-dark, #1a1a2e)' }}>
                    {seg.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dark, #1a1a2e)' }}>
                    {val.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted, #888)', minWidth: 32, textAlign: 'right' }}>
                    ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * LuxuryStatCard Component
 * Metric highlight card with luxury gold accents and icon badges.
 */
export function LuxuryStatCard({
  icon = '✨',
  label = 'Metric',
  value = '0',
  trend = '',
  trendPositive = true,
  accentColor = '#f0a500'
}) {
  return (
    <div style={{
      background: 'var(--card-bg, #ffffff)',
      borderRadius: 14,
      border: '1px solid rgba(212, 175, 55, 0.25)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `rgba(212, 175, 55, 0.12)`,
        border: `1px solid ${accentColor}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        flexShrink: 0
      }}>
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted, #777)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-dark, #1a1a2e)', marginTop: 2 }}>
          {value}
        </div>
      </div>

      {trend && (
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: trendPositive ? '#27ae60' : '#e74c3c',
          background: trendPositive ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
          padding: '3px 8px',
          borderRadius: 20
        }}>
          {trend}
        </span>
      )}
    </div>
  );
}

