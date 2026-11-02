import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { LanguageContext } from '../../context/LanguageContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import LuxuryHorizontalScroll from '../Common/LuxuryHorizontalScroll';
import api from '../../api';
import toast from 'react-hot-toast';

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
    desc: 'Top-tier luxury penthouse suites with private balconies, jacuzzi, and VIP butler service (Suites 401–308)',
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
    desc: 'Refined deluxe comfort rooms with plush queen beds, fiber WiFi, and garden views (Rooms 101–110)',
    tag: 'Deluxe Comfort'
  }
];

const ReserveRoom = () => {
  const { user } = useContext(AuthContext);
  const { formatPrice } = useContext(CurrencyContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  
  const todayStr = () => {
    const n = new Date();
    const p = (x) => String(x).padStart(2, '0');
    return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
  };

  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [roomModal, setRoomModal] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [pinNumber, setPinNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasStoredId, setHasStoredId] = useState(false);
  const [storedFida, setStoredFida] = useState('');

  // Camera / ID scan state
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');
  const [cameraSide, setCameraSide] = useState(null); // 'front' | 'back' | null
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFullName(`${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
    const params = new URLSearchParams(location.search);
    const roomId = params.get('roomId');
    api
      .get('/rooms/available')
      .then((res) => {
        const list = res.data.rooms || [];
        setRooms(list);
        if (roomId) setSelectedRoomId(Number(roomId));
        else if (list.length > 0) setSelectedRoomId(list[0].id);
      })
      .catch(() => toast.error('Unable to load available rooms.'));
  }, [user, location.search]);

  const [scanHint, setScanHint] = useState('');
  const [autoReady, setAutoReady] = useState(0);
  const autoTimerRef = useRef(null);
  const lastFrameRef = useRef(null);
  const stableCountRef = useRef(0);
  const capturingRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraSide(null);
    setScanHint('');
    setAutoReady(0);
    stableCountRef.current = 0;
    lastFrameRef.current = null;
    capturingRef.current = false;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const scoreFrame = (video) => {
    const w = 160;
    const h = 90;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let sum = 0;
    let sumSq = 0;
    let edge = 0;
    const gray = new Float32Array(w * h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      gray[p] = g;
      sum += g;
      sumSq += g * g;
    }
    const n = w * h;
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const dx = Math.abs(gray[i] - gray[i - 1]);
        const dy = Math.abs(gray[i] - gray[i - w]);
        edge += dx + dy;
      }
    }
    edge /= n;
    let motion = 0;
    if (lastFrameRef.current && lastFrameRef.current.length === gray.length) {
      for (let i = 0; i < gray.length; i++) {
        motion += Math.abs(gray[i] - lastFrameRef.current[i]);
      }
      motion /= n;
    }
    lastFrameRef.current = gray;
    const brightOk = mean > 25 && mean < 245;
    const contrastOk = variance > 150;
    const edgeOk = edge > 3;
    const good = brightOk && (contrastOk || edgeOk) && motion < 25;
    return { mean, variance, edge, motion, good };
  };

  const doCapture = useCallback((side) => {
    const video = videoRef.current;
    if (!video || !side || capturingRef.current) return;
    if (!video.videoWidth) return;
    capturingRef.current = true;
    const canvas = document.createElement('canvas');
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          capturingRef.current = false;
          toast.error('Capture failed. Hold the ID steady and try again.');
          return;
        }
        const file = new File([blob], `id-${side}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        if (side === 'front') {
          setFrontFile(file);
          setFrontPreview(url);
          toast.success('Front of ID captured successfully');
        } else {
          setBackFile(file);
          setBackPreview(url);
          toast.success('Back of ID captured successfully');
        }
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  }, [stopCamera]);

  const scanningRef = useRef(false);

  const startAutoDetect = useCallback(
    (side) => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      stableCountRef.current = 0;
      setAutoReady(0);
      scanningRef.current = false;
      setScanHint(side === 'front' ? 'Align the FRONT of your ID card' : 'Align the BACK of your ID card');

      let attempt = 0;
      autoTimerRef.current = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || capturingRef.current || scanningRef.current) return;

        const s = scoreFrame(video);
        attempt += 1;
        if (s.mean < 20) {
          setScanHint('Too dark — please provide better light');
          return;
        }
        if (s.motion > 40 && attempt < 3) {
          setScanHint('Hold steady inside the golden box…');
          return;
        }

        scanningRef.current = true;
        setScanHint(side === 'front' ? 'Scanning front for full name…' : 'Scanning back for PIN and phone…');
        setAutoReady(35);

        try {
          const canvas = document.createElement('canvas');
          const vw = video.videoWidth || 640;
          const vh = video.videoHeight || 480;
          const w = Math.min(vw, 800);
          const h = Math.round((w / vw) * vh);
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(video, 0, 0, w, h);
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
          if (!blob) {
            scanningRef.current = false;
            setScanHint('Frame capture error');
            return;
          }

          const fd = new FormData();
          fd.append('frame', blob, `frame-${side}.jpg`);
          fd.append('side', side);
          fd.append('fullName', fullName || '');
          fd.append('pinNumber', pinNumber || '');
          fd.append('phone', phone || '');

          const res = await api.post('/reservations/scan-frame', fd, { timeout: 90000 });
          setAutoReady(75);

          if (res.data && res.data.matched) {
            setAutoReady(100);
            setScanHint(res.data.message || 'Matched — saving photo…');
            doCapture(side);
          } else {
            setScanHint(res.data?.message || 'Details not matched yet — keep steady');
          }
        } catch {
          setScanHint('Analyzing… keep card steady in view');
        } finally {
          scanningRef.current = false;
        }
      }, 1400);
    },
    [fullName, pinNumber, phone, doCapture]
  );

  const openCamera = async (side) => {
    setCameraError('');
    setCameraSide(side);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      startAutoDetect(side);
    } catch {
      setCameraError('Camera access denied or unavailable. Please upload a photo instead.');
      stopCamera();
    }
  };

  const onFilePick = (side, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === 'front') {
      setFrontFile(file);
      setFrontPreview(url);
    } else {
      setBackFile(file);
      setBackPreview(url);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const selectSuiteAndScroll = (id, rm) => {
    setSelectedRoomId(id);
    toast.success(`Selected Room #${rm.room_number}. Please complete the reservation form below.`);
    const formElem = document.getElementById('room-booking-form-section');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calculate nights & pricing
  let numberOfNights = 1;
  if (checkInDate && checkOutDate) {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    if (diff > 0) numberOfNights = diff;
  }

  const roomRate = selectedRoom ? Number(selectedRoom.price_per_night || 0) : 0;
  const totalAmount = roomRate * numberOfNights;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      toast.error('Please select a suite to reserve.');
      return;
    }
    if (!checkInDate || !checkOutDate) {
      toast.error('Select check-in and check-out dates.');
      return;
    }
    if (!hasStoredId) {
      if (!frontFile) {
        toast.error('Scan or upload the FRONT of your ID card.');
        return;
      }
      if (!backFile) {
        toast.error('Scan or upload the BACK of your ID card.');
        return;
      }
      if (!pinNumber || String(pinNumber).replace(/\D/g, '').length < 6) {
        toast.error('Enter the PIN / FAN number from your National ID.');
        return;
      }
    }

    const regFirst = (user.first_name || user.firstName || '').trim();
    const regLast = (user.last_name || user.lastName || '').trim();
    if (!regFirst || !regLast) {
      toast.error('Your profile must include first and last name. Update your profile first.');
      return;
    }
    const today = todayStr();
    if (checkInDate < today) {
      toast.error('Check-in date cannot be in the past.');
      return;
    }
    if (checkOutDate <= checkInDate) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('roomId', String(selectedRoomId));
      formData.append('checkInDate', checkInDate);
      formData.append('checkOutDate', checkOutDate);
      formData.append('numberOfGuests', String(numberOfGuests || 1));
      formData.append('fullName', (fullName || '').trim());
      formData.append('email', email || '');
      formData.append('phone', phone || '');
      formData.append('specialRequests', specialRequests || '');
      formData.append('pinNumber', (pinNumber || storedFida || '').trim());
      formData.append('fidaNumber', (pinNumber || storedFida || '').trim());
      if (frontFile) {
        formData.append('idCardFront', frontFile, frontFile.name || 'id-front.jpg');
        formData.append('idCard', frontFile, frontFile.name || 'id-front.jpg');
      }
      if (backFile) {
        formData.append('idCardBack', backFile, backFile.name || 'id-back.jpg');
      }

      const res = await api.post('/reservations', formData, { timeout: 120000 });
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Luxury suite reserved! Proceeding to payment…');
        const id = res.data.reservation && res.data.reservation.id;
        navigate(id ? `/payment?type=room&id=${id}` : '/dashboard/customer');
      } else {
        toast.error((res.data && res.data.message) || 'Reservation failed');
      }
    } catch (error) {
      const data = error.response && error.response.data;
      const msg = (data && (data.message || data.error)) || error.message || 'Error submitting reservation.';
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-split-wrapper">
        <div className="luxury-section-panel text-center" style={{ maxWidth: 440, margin: '60px auto' }}>
          <LuxuryLogo size="medium" />
          <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 16 }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '8px 0 20px' }}>
            Please sign in to your guest account to reserve a luxury suite.
          </p>
          <button type="button" className="auth-gold-submit-btn" onClick={() => navigate('/login')}>
            Sign In to Continue ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inside luxury-page-container">
      {/* 5-Star Luxury Header Box */}
      <div className="luxury-header-box">
        <div className="luxury-badge">👑 5-STAR ROYAL ACCOMMODATION</div>
        <h1 className="page-title">Reserve Your Luxury Suite &amp; Residence</h1>
        <p className="page-subtitle">
          Experience world-class hospitality in Debre Markos. Complimentary VIP concierge, panoramic terrace views, and seamless paperless check-in.
        </p>
      </div>

      {/* 1. Full-Width Available Luxury Suites Carousel Shelves (Max 10 Items Per Shelf) */}
      <div className="luxury-section-panel" style={{ padding: '24px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
          <h2 className="luxury-panel-title" style={{ margin: 0 }}>
            <span>🛏️</span> Available Luxury Suites
          </h2>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
            ← Swipe or scroll horizontally (Max 10 suites per shelf) →
          </span>
        </div>
        <p className="luxury-panel-desc">
          Browse our premier suites arranged into dedicated horizontal movable shelves with <strong>at most 10 rooms per slider</strong>. Click <strong>"Select Suite ➔"</strong> to immediately jump down to your reservation form below.
        </p>

        {rooms.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No suites currently available. Please contact concierge.
          </div>
        ) : (
          <div className="luxury-room-shelves" style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 14 }}>
            {chunkArray(rooms, 10).map((chunk, shelfIdx) => {
              const meta = ROOM_SHELF_META[shelfIdx] || {
                title: `Curated Luxury Suites (Collection ${shelfIdx + 1})`,
                icon: '🛏️',
                desc: `Executive suites and premium rooms (Suites ${shelfIdx * 10 + 1}–${shelfIdx * 10 + chunk.length})`,
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
                        {chunk.length} / 10 Suites
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        ← Scroll 10 suites →
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Scroll containing exactly at most 10 items */}
                  <LuxuryHorizontalScroll itemWidth={310} stepScroll={330}>
                    {chunk.map((rm) => {
                      const isSelected = selectedRoomId === rm.id;
                      const roomImg = rm.image
                        ? (rm.image.startsWith('http') ? rm.image : `/uploads/rooms/${rm.image.replace(/^.*\//, '')}`)
                        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
                      return (
                        <div
                          key={rm.id}
                          className={`luxury-hscroll-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => selectSuiteAndScroll(rm.id, rm)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="desk-img-wrap" style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                            <img
                              src={roomImg}
                              alt={rm.room_type}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <span className="desk-status-pill">
                              ● Available
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
                              Suite #{rm.room_number}
                            </span>
                          </div>

                          <div className="desk-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <h3 className="desk-card-title" style={{ fontSize: 17, marginBottom: 4 }}>
                              Room #{rm.room_number}
                            </h3>
                            <div className="desk-card-sub" style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                              📍 {rm.room_type || 'Deluxe Suite'} · 👥 Capacity: {rm.capacity || 2} Guests
                            </div>

                            <div className="desk-pricing-row" style={{ marginBottom: 12 }}>
                              <span className="desk-price-current">{formatPrice(rm.price_per_night || 0)}/night</span>
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                              <button
                                type="button"
                                className="google-clean-btn"
                                style={{ padding: '7px 12px', fontSize: 12 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRoomModal(rm);
                                }}
                              >
                                Details
                              </button>
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
                                  selectSuiteAndScroll(rm.id, rm);
                                }}
                              >
                                {isSelected ? '✓ Selected' : 'Select Suite ➔'}
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
      </div>

      {/* 2. Bottom Suite Reservation & Guest Registration Form */}
      <div id="room-booking-form-section" className="luxury-section-panel" style={{ scrollMarginTop: 90, marginTop: 28, padding: '30px 28px' }}>
        {/* Form Header with Selected Suite Preview */}
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
              👑
            </span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                Debre Markos · 5-Star Royal Hospitality · Instant Paperless Check-In
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, margin: '2px 0 0', color: 'var(--text-dark)' }}>
                Suite Reservation &amp; Guest Registration
              </h2>
            </div>
          </div>

          {/* Active Suite Badge */}
          <div style={{
            background: selectedRoom ? 'rgba(39, 174, 96, 0.1)' : 'rgba(212, 175, 55, 0.1)',
            border: `1.5px solid ${selectedRoom ? '#27ae60' : 'var(--accent)'}`,
            borderRadius: 14,
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div>
              <div style={{ fontSize: 11, color: selectedRoom ? '#27ae60' : 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                {selectedRoom ? '✓ Active Suite Selection' : '⚠️ No Suite Selected'}
              </div>
              <strong style={{ fontSize: 15, color: 'var(--text-dark)' }}>
                {selectedRoom ? `Room #${selectedRoom.room_number} (${selectedRoom.room_type || 'Deluxe Suite'})` : 'Please pick a suite above'}
              </strong>
            </div>
            {selectedRoom && (
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', marginLeft: 8 }}>
                {formatPrice(selectedRoom.price_per_night || 0)}/night
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Stay Dates & Occupancy (3 columns) */}
          <div className="clean-grid-3" style={{ marginBottom: 20 }}>
            <div className="form-group-clean">
              <label className="clean-label">Check-In Date <span className="req">*</span></label>
              <input
                type="date"
                min={todayStr()}
                className="clean-input"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group-clean">
              <label className="clean-label">Check-Out Date <span className="req">*</span></label>
              <input
                type="date"
                min={checkInDate || todayStr()}
                className="clean-input"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group-clean">
              <label className="clean-label">Number of Guests</label>
              <input
                type="number"
                min={1}
                max={selectedRoom ? (selectedRoom.capacity || 4) : 6}
                className="clean-input"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Math.max(1, Number(e.target.value)))}
              />
            </div>
          </div>

          {/* Row 2: Guest Details (2 columns) */}
          <div className="clean-grid-2" style={{ marginBottom: 20 }}>
            <div className="form-group-clean">
              <label className="clean-label">Full Name</label>
              <input type="text" className="clean-input" value={fullName} readOnly disabled style={{ opacity: 0.85 }} />
            </div>
            <div className="form-group-clean">
              <label className="clean-label">Email Address</label>
              <input type="email" className="clean-input" value={email} readOnly disabled style={{ opacity: 0.85 }} />
            </div>
          </div>

          {/* Row 3: National ID / Fayda Verification */}
          <div style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 22px',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>🪪</span>
              <div>
                <strong style={{ fontSize: 15, color: 'var(--text-dark)' }}>National ID (Fayda) Verification</strong>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Required for secure contactless check-in. Scan both sides of your Ethiopian National ID or enter your PIN.
                </p>
              </div>
            </div>

            <div className="form-group-clean" style={{ marginBottom: 16 }}>
              <label className="clean-label">National ID / FIDA PIN Number <span className="req">*</span></label>
              <input
                type="text"
                className="clean-input"
                value={pinNumber}
                onChange={(e) => setPinNumber(e.target.value)}
                placeholder="e.g. 6583612897620451"
                required
              />
            </div>

            {hasStoredId ? (
              <div style={{ background: 'rgba(39, 174, 96, 0.1)', border: '1px solid #27ae60', borderRadius: 12, padding: 14 }}>
                <strong style={{ color: '#27ae60' }}>✓ Verified ID On File</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-dark)' }}>
                  Your National ID has been securely verified from a previous stay.
                </p>
              </div>
            ) : (
              <>
                {/* Camera Modal / Stream View */}
                {cameraSide && (
                  <div style={{ background: '#070b14', borderRadius: 16, padding: 18, border: '1.5px solid #d4af37', marginBottom: 18, textAlign: 'center' }}>
                    <p style={{ color: '#d4af37', fontWeight: 800, margin: '0 0 10px', fontSize: 14 }}>
                      📸 Aligning {cameraSide === 'front' ? 'FRONT' : 'BACK'} of National ID
                    </p>

                    <div style={{ position: 'relative', width: '100%', maxWidth: 520, margin: '0 auto' }}>
                      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: 12, background: '#000' }} />
                      <div
                        style={{
                          pointerEvents: 'none',
                          position: 'absolute',
                          inset: '12% 8%',
                          border: '2.5px dashed #d4af37',
                          borderRadius: 12,
                          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
                        }}
                      />
                    </div>

                    <p style={{ color: '#fff', fontSize: 13, margin: '12px 0 6px' }}>{scanHint || 'Looking for ID…'}</p>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', maxWidth: 320, margin: '0 auto 14px' }}>
                      <div style={{ height: '100%', width: `${autoReady}%`, background: '#d4af37', transition: 'width 0.2s' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button type="button" className="auth-gold-submit-btn" style={{ width: 'auto', padding: '9px 18px' }} onClick={() => doCapture(cameraSide)}>
                        Capture Frame Now
                      </button>
                      <button type="button" className="google-clean-btn" style={{ width: 'auto', padding: '9px 18px' }} onClick={stopCamera}>
                        Cancel Camera
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div style={{ color: '#e74c3c', fontSize: 13, marginBottom: 12 }}>
                    ⚠️ {cameraError}
                  </div>
                )}

                {/* Dual Card Upload Slots */}
                <div className="id-dual-slots">
                  <div className={`id-slot-box ${frontFile ? 'has-file' : ''}`}>
                    <div className="id-slot-title">Front of ID *</div>
                    {frontPreview ? (
                      <img src={frontPreview} alt="Front preview" className="id-slot-preview" />
                    ) : (
                      <div className="id-slot-placeholder">
                        <span>🪪</span>
                        <span>No Front Image</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        type="button"
                        className="auth-gold-submit-btn"
                        style={{ padding: '8px', fontSize: 12 }}
                        onClick={() => {
                          if (!fullName) {
                            toast.error('Enter your full name first');
                            return;
                          }
                          openCamera('front');
                        }}
                      >
                        📷 Open Camera
                      </button>
                      <label style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
                        Or upload front file
                        <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => onFilePick('front', e)} />
                      </label>
                    </div>
                  </div>

                  <div className={`id-slot-box ${backFile ? 'has-file' : ''}`}>
                    <div className="id-slot-title">Back of ID *</div>
                    {backPreview ? (
                      <img src={backPreview} alt="Back preview" className="id-slot-preview" />
                    ) : (
                      <div className="id-slot-placeholder">
                        <span>🪪</span>
                        <span>No Back Image</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        type="button"
                        className="auth-gold-submit-btn"
                        style={{ padding: '8px', fontSize: 12 }}
                        onClick={() => {
                          if (!pinNumber) {
                            toast.error('Enter your PIN number first');
                            return;
                          }
                          openCamera('back');
                        }}
                      >
                        📷 Open Camera
                      </button>
                      <label style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
                        Or upload back file
                        <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => onFilePick('back', e)} />
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Row 4: Bespoke Concierge Requests */}
          <div className="form-group-clean" style={{ marginBottom: 20 }}>
            <label className="clean-label">Bespoke Concierge Requests (Optional)</label>
            <textarea
              className="clean-input"
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Airport pickup from Debre Markos airstrip, champagne, high-floor preference, extra towels…"
            />
          </div>

          {/* Row 5: Pricing Breakdown & Submit Bar (Matching Desks & Food) */}
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
                  Length of Stay
                </div>
                <strong style={{ fontSize: 16, color: 'var(--text-dark)' }}>
                  {numberOfNights} {numberOfNights === 1 ? 'Night' : 'Nights'}
                </strong>
              </div>

              <div style={{ height: 32, width: 1, background: 'var(--border)' }} />

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Suite Rate
                </div>
                <strong style={{ fontSize: 16, color: 'var(--text-dark)' }}>
                  {formatPrice(roomRate)}/night
                </strong>
              </div>

              <div style={{ height: 32, width: 1, background: 'var(--border)' }} />

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Resort Fee &amp; VAT
                </div>
                <strong style={{ fontSize: 16, color: '#27ae60' }}>
                  Included (0.00)
                </strong>
              </div>

              <div style={{ height: 32, width: 1, background: 'var(--border)' }} />

              <div>
                <div style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Amount
                </div>
                <strong style={{ fontSize: 22, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                  {formatPrice(totalAmount)}
                </strong>
              </div>
            </div>

            <button
              type="submit"
              className="auth-gold-submit-btn"
              disabled={submitting}
              style={{ width: 'auto', minWidth: 260, padding: '14px 28px', margin: 0, fontSize: 15 }}
            >
              {submitting ? 'Verifying & Reserving Suite…' : '👑 Confirm Suite & Pay ➔'}
            </button>
          </div>
        </form>
      </div>

      {/* Room Details Modal */}
      {roomModal && (
        <div className="invoice-modal-backdrop" onClick={() => setRoomModal(null)}>
          <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 10px' }}>
              Room #{roomModal.room_number} · {roomModal.room_type}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 14px' }}>
              📍 Floor {roomModal.floor || 2} · Capacity: {roomModal.capacity || 2} Guests · King Bed
            </p>
            <img
              src={roomModal.image ? (roomModal.image.startsWith('http') ? roomModal.image : `/uploads/rooms/${roomModal.image.replace(/^.*\//, '')}`) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
              alt=""
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 14 }}
            />
            <p style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.5, marginBottom: 16 }}>
              {roomModal.description || 'Experience world-class luxury with en-suite Italian marble bathroom, high-speed fiber WiFi, climate control, and 24-hour concierge butler service.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>
                {formatPrice(roomModal.price_per_night || 0)} / night
              </span>
              <button
                type="button"
                className="auth-gold-submit-btn"
                style={{ width: 'auto', padding: '9px 18px' }}
                onClick={() => {
                  selectSuiteAndScroll(roomModal.id, roomModal);
                  setRoomModal(null);
                }}
              >
                Select This Suite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReserveRoom;
