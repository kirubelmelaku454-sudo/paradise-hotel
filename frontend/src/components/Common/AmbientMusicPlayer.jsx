import React, { useState, useEffect, useRef } from 'react';

const TRACKS = [
  { id: 1, title: 'Debre Markos Highlands Serenade', baseFreq: 220, chord: [220, 277.18, 329.63, 440] }, // A major
  { id: 2, title: 'Abyssinian Sunset Lounge', baseFreq: 196, chord: [196, 246.94, 293.66, 392] }, // G major
  { id: 3, title: 'Choke Mountain Waterfall Zen', baseFreq: 174.61, chord: [174.61, 220, 261.63, 349.23] } // F major
];

export default function AmbientMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.25);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const activeNodesRef = useRef([]);
  const timerRef = useRef(null);

  const currentTrack = TRACKS[currentTrackIndex];

  const stopAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    activeNodesRef.current.forEach(({ osc, gain }) => {
      try {
        gain.gain.linearRampToValueAtTime(0.0001, (audioCtxRef.current?.currentTime || 0) + 0.5);
        setTimeout(() => {
          try { osc.stop(); osc.disconnect(); } catch (_) {}
        }, 600);
      } catch (_) {}
    });
    activeNodesRef.current = [];
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
        const master = audioCtxRef.current.createGain();
        master.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
        master.connect(audioCtxRef.current.destination);
        masterGainRef.current = master;
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      stopAudio();

      // Play soft atmospheric chord pad
      const ctx = audioCtxRef.current;
      const chord = currentTrack.chord;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 + idx * 80, ctx.currentTime);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.04 / chord.length, now + 1.5 + idx * 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGainRef.current);

        osc.start(now);
        activeNodesRef.current.push({ osc, gain });
      });

      // Gentle pulsating bell notes
      let step = 0;
      timerRef.current = setInterval(() => {
        if (!audioCtxRef.current || !isPlaying) return;
        try {
          const now = audioCtxRef.current.currentTime;
          const noteOsc = audioCtxRef.current.createOscillator();
          const noteGain = audioCtxRef.current.createGain();

          const noteFreq = chord[step % chord.length] * 2;
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(noteFreq, now);

          noteGain.gain.setValueAtTime(0.0001, now);
          noteGain.gain.linearRampToValueAtTime(0.035, now + 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

          noteOsc.connect(noteGain);
          noteGain.connect(masterGainRef.current);

          noteOsc.start(now);
          noteOsc.stop(now + 2.5);
          step++;
        } catch (_) {}
      }, 3200);

    } catch (err) {
      console.error('Audio initialization error:', err);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAudio();
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.1);
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <aside
      aria-label="5-Star Ambient Music Player"
      style={{
        position: 'fixed',
        bottom: 22,
        left: 20,
        zIndex: 900,
        fontFamily: 'var(--font-body, sans-serif)',
      }}
    >
      {!isExpanded ? (
        /* Minimized Floating Button */
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          style={{
            background: isPlaying ? 'linear-gradient(135deg, #101c38 0%, #0b1329 100%)' : 'rgba(11, 19, 41, 0.92)',
            color: '#ffffff',
            border: '1.5px solid rgba(212, 175, 55, 0.5)',
            borderRadius: 30,
            padding: '8px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.25s',
          }}
        >
          <span style={{ fontSize: 16 }}>{isPlaying ? '🎶' : '🎵'}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f0a500' }}>
            {isPlaying ? 'Lounge: Playing' : 'Ambient Music'}
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>▼</span>
        </button>
      ) : (
        /* Expanded Luxury Audio Bar */
        <div
          style={{
            background: 'linear-gradient(135deg, #0e172a 0%, #0b1329 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.5)',
            borderRadius: 18,
            padding: '14px 18px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            color: '#ffffff',
            width: 290,
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 15 }}>👑</span>
              <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#f0a500', fontWeight: 800, letterSpacing: 0.8 }}>
                Paradise Lounge Audio
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 16, cursor: 'pointer', padding: 2 }}
            >
              ✕
            </button>
          </div>

          {/* Track Info */}
          <div style={{ marginBottom: 12, borderLeft: '3px solid #f0a500', paddingLeft: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.title}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>5-Star Debre Markos Acoustic Harmony</div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button
              type="button"
              onClick={togglePlay}
              style={{
                background: 'linear-gradient(135deg, #f0a500 0%, #d4920a 100%)',
                color: '#0b1325',
                border: 'none',
                borderRadius: 20,
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{isPlaying ? '⏸ Pause' : '▶ Play'}</span>
            </button>

            <button
              type="button"
              onClick={nextTrack}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 14,
                padding: '5px 10px',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Next Track ⏭
            </button>
          </div>

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8' }}>
            <span>🔈</span>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.02"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#f0a500', cursor: 'pointer' }}
            />
            <span>🔊</span>
          </div>
        </div>
      )}
    </aside>
  );
}

