import React from 'react';

export default function LuxuryLogo({ size = 'medium', showText = true, className = '' }) {
    const dimensions = {
        small: { width: 36, height: 36, fontSize: 16, subSize: 9 },
        medium: { width: 48, height: 48, fontSize: 19, subSize: 10 },
        large: { width: 72, height: 72, fontSize: 26, subSize: 12 },
    }[size] || { width: 48, height: 48, fontSize: 19, subSize: 10 };

    return (
        <div className={`luxury-logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <svg
                width={dimensions.width}
                height={dimensions.height}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="luxury-crest-svg"
            >
                <defs>
                    <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f7e7b4" />
                        <stop offset="40%" stopColor="#d4af37" />
                        <stop offset="80%" stopColor="#aa7c11" />
                        <stop offset="100%" stopColor="#f2d06b" />
                    </linearGradient>
                    <linearGradient id="crestDark" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0b1329" />
                    </linearGradient>
                    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#d4af37" floodOpacity="0.4" />
                    </filter>
                </defs>

                {/* Outer Crest Shield */}
                <path
                    d="M50 4 L88 18 C88 56 68 85 50 96 C32 85 12 56 12 18 Z"
                    fill="url(#crestDark)"
                    stroke="url(#crestGold)"
                    strokeWidth="3.5"
                    filter="url(#goldGlow)"
                />

                {/* Inner Shield Accent */}
                <path
                    d="M50 12 L80 23 C80 54 64 78 50 87 C36 78 20 54 20 23 Z"
                    fill="none"
                    stroke="url(#crestGold)"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                    opacity="0.8"
                />

                {/* 5-Star Crown on Top */}
                <g transform="translate(0, -2)">
                    <path
                        d="M36 28 L41 33 L50 24 L59 33 L64 28 L62 37 L38 37 Z"
                        fill="url(#crestGold)"
                    />
                    <circle cx="36" cy="26" r="1.8" fill="#fff" />
                    <circle cx="50" cy="22" r="2.2" fill="#fff" />
                    <circle cx="64" cy="26" r="1.8" fill="#fff" />
                    <circle cx="43" cy="30" r="1.2" fill="#f7e7b4" />
                    <circle cx="57" cy="30" r="1.2" fill="#f7e7b4" />
                </g>

                {/* Interlocking Monogram 'P' & 'H' */}
                <text
                    x="50"
                    y="63"
                    textAnchor="middle"
                    fontFamily="'Playfair Display', Georgia, serif"
                    fontSize="26"
                    fontWeight="800"
                    fill="url(#crestGold)"
                    letterSpacing="1"
                >
                    PH
                </text>

                {/* Bottom 5 Stars */}
                <g fill="url(#crestGold)">
                    <path d="M50 72 L51.2 75.5 L55 75.5 L52 77.8 L53.2 81.2 L50 79 L46.8 81.2 L48 77.8 L45 75.5 L48.8 75.5 Z" transform="scale(0.85) translate(8.8, 11)" />
                </g>
            </svg>

            {showText && (
                <div className="luxury-logo-text-group" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                            className="luxury-logo-main"
                            style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontSize: dimensions.fontSize,
                                fontWeight: 800,
                                letterSpacing: '1.5px',
                                lineHeight: 1.15,
                                background: 'linear-gradient(135deg, #f7e7b4 0%, #d4af37 50%, #f2d06b 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textTransform: 'uppercase',
                            }}
                        >
                            Paradise Hotel
                        </span>
                        <span
                            className="luxury-logo-badge"
                            style={{
                                fontSize: Math.max(9, dimensions.subSize - 1),
                                fontWeight: 800,
                                letterSpacing: '1px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                border: '1px solid rgba(212, 175, 55, 0.6)',
                                color: '#d4af37',
                                background: 'rgba(212, 175, 55, 0.12)',
                                lineHeight: 1,
                                display: 'inline-block',
                            }}
                        >
                            5-STAR
                        </span>
                    </div>
                    <span
                        className="luxury-logo-sub"
                        style={{
                            fontSize: dimensions.subSize,
                            fontWeight: 700,
                            letterSpacing: '2px',
                            color: 'rgba(212, 175, 55, 0.85)',
                            textTransform: 'uppercase',
                            marginTop: 2,
                        }}
                    >
                        • Debre Markos • Ethiopia •
                    </span>
                </div>
            )}
        </div>
    );
}

