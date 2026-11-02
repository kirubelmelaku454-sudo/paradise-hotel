import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import api from '../../api';
import toast from 'react-hot-toast';
import InvoiceModal from '../Common/InvoiceModal';
import DigitalRoomKeyModal from '../Common/DigitalRoomKeyModal';
import OrderTrackingStepper from '../Common/OrderTrackingStepper';
import { SkeletonList } from '../Common/SkeletonLoader';
import { LuxuryDoughnutChart, LuxuryBarChart, LuxuryStatCard } from '../Common/LuxuryAnalyticsCharts';

const CustomerDashboard = () => {
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const { formatPrice } = useContext(CurrencyContext);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

    const [roomReservations, setRoomReservations] = useState([]);
    const [deskReservations, setDeskReservations] = useState([]);
    const [foodOrders, setFoodOrders] = useState([]);
    const [refundRequests, setRefundRequests] = useState([]);
    const [payments, setPayments] = useState([]);
    const [myMessages, setMyMessages] = useState([]);
    const [hasDiscount, setHasDiscount] = useState(false);
    const [loading, setLoading] = useState(true);

    // Invoice Modal State
    const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, reference: '', type: '', id: null });
    // Digital Room Key Modal State
    const [roomKeyModal, setRoomKeyModal] = useState({ isOpen: false, reservation: null });

    // Refund Modal State
    const [refundModal, setRefundModal] = useState(null);
    const [refundReason, setRefundReason] = useState('');
    const [refundCalc, setRefundCalc] = useState(null);
    const [submittingRefund, setSubmittingRefund] = useState(false);

    useEffect(() => {
        if (user) {
            fetchData();
            const interval = setInterval(() => {
                api.get('/food/discounts/active')
                    .then((discRes) => {
                        setHasDiscount(!!(discRes.data.hasDiscount || (discRes.data.discounts || []).length));
                    })
                    .catch(() => { });
            }, 60000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [user]);

    const sortByRecent = (arr) => {
        if (!Array.isArray(arr)) return [];
        return [...arr].sort((a, b) => {
            const getVal = (x) => {
                const dateVal = x.updated_at || x.created_at || x.transaction_date || x.order_date || x.reservation_date || x.registration_date;
                if (dateVal) {
                    const t = new Date(dateVal).getTime();
                    if (!Number.isNaN(t)) return t;
                }
                return Number(x.id || x.reservation_id || 0);
            };
            return getVal(b) - getVal(a);
        });
    };

    const fetchData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [roomRes, deskRes, foodRes, refundRes, payRes, discRes, msgRes] = await Promise.all([
                api.get('/reservations/my').catch(() => ({ data: { reservations: [] } })),
                api.get('/desks/my').catch(() => ({ data: { reservations: [] } })),
                api.get('/food/my').catch(() => ({ data: { orders: [] } })),
                api.get('/refunds/my').catch(() => ({ data: { refunds: [] } })),
                api.get('/payments/my').catch(() => ({ data: { payments: [] } })),
                api.get('/food/discounts/active').catch(() => ({ data: { hasDiscount: false } })),
                api.get('/contact/messages/my').catch(() => ({ data: { messages: [] } })),
            ]);
            setRoomReservations(sortByRecent(roomRes.data.reservations || []));
            setDeskReservations(sortByRecent(deskRes.data.reservations || []));
            setFoodOrders(sortByRecent(foodRes.data.orders || []));
            setRefundRequests(sortByRecent(refundRes.data.refunds || []));
            setPayments(sortByRecent(payRes.data.payments || []));
            setMyMessages(sortByRecent(msgRes.data.messages || []));
            setHasDiscount(!!(discRes.data.hasDiscount || (discRes.data.discounts || []).length));
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const openRefundModal = async (type, item) => {
        const id = item.id;
        try {
            const res = await api.post('/refunds/calculate', {
                reservationType: type,
                reservationId: id
            });
            if (res.data.success) {
                setRefundCalc(res.data.calculation);
                setRefundModal({ type, id, item });
                setRefundReason('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error calculating refund penalty');
        }
    };

    const handleRefundSubmit = async (e) => {
        e.preventDefault();
        if (!refundReason || refundReason.trim().length < 5) {
            toast.error('Please provide a reason for your refund request (min 5 characters).');
            return;
        }

        setSubmittingRefund(true);
        try {
            const res = await api.post('/refunds/request', {
                reservationType: refundModal.type,
                reservationId: refundModal.id,
                reason: refundReason.trim()
            });

            if (res.data.success) {
                toast.success('Refund request submitted successfully! Receptionist will review it.');
                setRefundModal(null);
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting refund request');
        } finally {
            setSubmittingRefund(false);
        }
    };

    const renderStatusBadge = (status, paymentStatus) => {
        let badgeClass = 'status-pending';
        let label = status || 'Awaiting payment';

        if (status === 'awaiting_payment' || status === 'pending') {
            label = 'Pending Approval';
            badgeClass = 'status-pending';
        } else if (status === 'approved') {
            label = 'Approved';
            badgeClass = 'status-approved';
        } else if (status === 'rejected') {
            label = 'Rejected';
            badgeClass = 'status-rejected';
        } else if (status === 'cancelled') {
            label = 'Cancelled';
            badgeClass = 'status-rejected';
        } else if (status === 'completed' || status === 'checked_out') {
            label = 'Completed';
            badgeClass = 'status-completed';
        }

        return (
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span className={`status-badge ${badgeClass}`}>{label}</span>
                {paymentStatus && (
                    <span style={{ fontSize: '11px', color: paymentStatus === 'paid' ? '#27ae60' : '#d9534f', fontWeight: 'bold' }}>
                        Payment: {paymentStatus.toUpperCase()}
                    </span>
                )}
            </div>
        );
    };

    if (!user) {
        return (
            <div className="inside" style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontSize: 26, color: '#1a1a2e', marginBottom: 6 }}>
                        🏨 <span style={{ color: '#f0a500' }}>Paradise</span> Hotel Guest Portal
                    </h1>
                    <p style={{ color: '#666', fontSize: 15 }}>Log in to view reservations, or start by exploring our services below.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    {[
                        { path: '/rooms', icon: '🛏️', title: 'View Rooms', desc: 'Browse available 5-star rooms and suites' },
                        { path: '/reserve-desk', icon: '🍽️', title: 'Reserve a Desk', desc: 'Book executive tables with high-speed WiFi' },
                        { path: '/order-food', icon: '🍕', title: 'Order Food', desc: 'Fresh gourmet dishes from our master chef' },
                        { path: '/login', icon: '🔑', title: 'Log In', desc: 'Access your past bookings and rewards' },
                    ].map((c) => (
                        <button
                            key={c.path}
                            type="button"
                            onClick={() => navigate(c.path)}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1.5px solid var(--border)',
                                borderRadius: 16,
                                padding: 22,
                                cursor: 'pointer',
                                textAlign: 'left',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
                            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-dark)' }}>{c.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{c.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="inside luxury-page-container" style={{ maxWidth: 1000, margin: '20px auto', padding: '16px' }}>
                <div style={{ marginBottom: 24 }}>
                    <div className="skeleton-shimmer" style={{ width: 240, height: 28, borderRadius: 8, marginBottom: 8 }} />
                    <div className="skeleton-shimmer" style={{ width: 340, height: 14, borderRadius: 6 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                    <div className="card luxury-card" style={{ padding: 20 }}>
                        <div className="skeleton-shimmer" style={{ width: '45%', height: 20, marginBottom: 16 }} />
                        <SkeletonList count={3} />
                    </div>
                    <div className="card luxury-card" style={{ padding: 20 }}>
                        <div className="skeleton-shimmer" style={{ width: '45%', height: 20, marginBottom: 16 }} />
                        <SkeletonList count={3} />
                    </div>
                </div>
            </div>
        );
    }

    const myRoomSpend = roomReservations.filter(r => r.payment_status === 'paid' || r.status === 'approved').reduce((s, r) => s + Number(r.total_price || 0), 0);
    const myFoodSpend = foodOrders.filter(f => f.payment_status === 'paid' || f.status === 'approved').reduce((s, f) => s + Number(f.total_amount || 0), 0);
    const myDeskSpend = deskReservations.filter(d => d.payment_status === 'paid' || d.status === 'approved').reduce((s, d) => s + Number(d.total_price || 0), 0);
    const totalMySpend = myRoomSpend + myFoodSpend + myDeskSpend;

    const loyaltyPoints = Math.round(totalMySpend / 20);
    let vipTier = { name: 'Bronze Member', color: '#cd7f32', badge: '🥉', next: 500, perk: 'Welcome Refreshments & 24/7 Front Desk Support' };
    if (loyaltyPoints >= 5000) {
        vipTier = { name: 'Diamond Royal Patron', color: '#b9f2ff', badge: '💎', next: null, perk: 'Free Suite Upgrade, Complimentary Champagne, Private Butler & Unlimited Hydrotherapy' };
    } else if (loyaltyPoints >= 2000) {
        vipTier = { name: 'Gold Ambassador', color: '#ffd700', badge: '🥇', next: 5000, perk: 'Free Breakfast at Grand Palace, Late 2:00 PM Checkout & 20% Off All Dining' };
    } else if (loyaltyPoints >= 500) {
        vipTier = { name: 'Silver Executive', color: '#c0c0c0', badge: '🥈', next: 2000, perk: 'Complimentary Highland Fruit Basket & Priority Express Check-in' };
    }

    const monthlyGuestActivity = [
        { label: 'May', value: Math.round(totalMySpend * 0.1) || 1200 },
        { label: 'Jun', value: Math.round(totalMySpend * 0.15) || 2400 },
        { label: 'Jul', value: Math.round(totalMySpend * 0.2) || 3800 },
        { label: 'Aug', value: Math.round(totalMySpend * 0.25) || 5200 },
        { label: 'Sep', value: Math.round(totalMySpend * 0.3) || 7500 },
        { label: 'Oct', value: totalMySpend > 0 ? Math.round(totalMySpend) : 9800 },
    ];

    return (
        <div className="inside customer-dashboard luxury-page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
            {/* Top Banner */}
            <div className="page-header luxury-header-box" style={{ background: 'linear-gradient(135deg, #0b1329 0%, #162444 100%)', color: '#fff', padding: '28px 24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, width: '100%' }}>
                    <div>
                        <span className="section-eyebrow" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '12px', letterSpacing: '1.2px' }}>
                            FIVE-STAR GUEST PRIVILEGES · VIP PORTAL
                        </span>
                        <h1 className="page-title" style={{ margin: '6px 0 8px', fontSize: '26px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                            ✨ Welcome, {user?.first_name} {user?.last_name}!
                        </h1>
                        <p className="page-subtitle" style={{ margin: 0, color: '#cbd5e1', fontSize: '14px' }}>
                            Track your room bookings, table reservations, gourmet orders, and invoices in one place.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn btn-luxury-outline" onClick={() => navigate('/my-accounts')}>
                            💳 My Wallet &amp; Accounts
                        </button>
                        <button className="btn btn-luxury-gold" onClick={() => navigate('/rooms')}>
                            + Reserve Room
                        </button>
                        <button className="btn btn-luxury-gold" onClick={() => navigate('/order-food')}>
                            + Order Food
                        </button>
                    </div>
                </div>
            </div>

            {/* 2-Column Luxury Dashboard Layout with Vertical Sidebar */}
            <div className="dashboard-with-sidebar">
                {/* Left Vertical Navigation Sidebar */}
                <aside className="dashboard-vsidebar">
                    <div className="dashboard-vsidebar-header">
                        <div className="dashboard-vsidebar-title">
                            <span>👑</span> Guest Portal
                        </div>
                        <div className="dashboard-vsidebar-sub">Paradise Member Center</div>
                    </div>

                    {[
                        { id: 'overview', icon: '📊', label: 'My Portfolio & Spend' },
                        { id: 'rooms', icon: '🛏️', label: 'Room Bookings', count: roomReservations.length },
                        { id: 'desks', icon: '🍽️', label: 'Desk Bookings', count: deskReservations.length },
                        { id: 'food', icon: '🍕', label: 'Food Orders', count: foodOrders.length },
                        { id: 'payments', icon: '💳', label: 'Invoices & Receipts', count: payments.length },
                        { id: 'refunds', icon: '💰', label: 'Refund Requests', count: refundRequests.length },
                        { id: 'messages', icon: '💬', label: 'Concierge Inquiries', count: myMessages.length },
                    ].map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                className={`dashboard-vnav-item ${active ? 'active' : ''}`}
                                onClick={() => setSearchParams({ tab: tab.id })}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 16 }}>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </div>
                                {tab.count !== undefined && (
                                    <span className="dashboard-vnav-badge">{tab.count}</span>
                                )}
                            </button>
                        );
                    })}
                </aside>

                {/* Right Main Content Area */}
                <main className="dashboard-main-area">
                    {/* 1. OVERVIEW & ANALYTICS */}
                    {activeTab === 'overview' && (
                        <div className="dashboard-tab-pane">
                            {/* VIP Loyalty & Elite Club Card */}
                            <div className="card luxury-card" style={{
                                background: 'linear-gradient(135deg, #0e172a 0%, #080d1a 100%)',
                                border: `1.5px solid ${vipTier.color}`,
                                borderRadius: 20,
                                padding: '22px 26px',
                                color: '#ffffff',
                                marginBottom: 22,
                                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: -35, right: -35, width: 140, height: 140, borderRadius: '50%', background: 'rgba(212, 175, 55, 0.08)', pointerEvents: 'none' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
                                    <div>
                                        <span style={{ fontSize: 11, color: vipTier.color, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800, display: 'block' }}>
                                            PARADISE ELITE VIP CLUB · GUEST PRIVILEGES
                                        </span>
                                        <h3 style={{ margin: '4px 0 2px', fontSize: 20, color: '#ffffff', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span>{vipTier.badge}</span>
                                            <span>{vipTier.name}</span>
                                        </h3>
                                        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                                            Earn 1 Paradise Point for every 20 ETB spent on luxury suites and gourmet dining.
                                        </p>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: 11, color: '#cbd5e1', textTransform: 'uppercase' }}>Available Points</span>
                                        <div style={{ fontSize: 26, fontWeight: 900, color: '#f0a500' }}>
                                            {loyaltyPoints.toLocaleString()} <span style={{ fontSize: 13 }}>PTS</span>
                                        </div>
                                    </div>
                                </div>

                                {vipTier.next && (
                                    <div style={{ marginBottom: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 5 }}>
                                            <span>Tier Progress</span>
                                            <span>{loyaltyPoints} / {vipTier.next} PTS to next VIP rank</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${Math.min(100, Math.round((loyaltyPoints / vipTier.next) * 100))}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #f0a500, #ffd700)',
                                                borderRadius: 10
                                            }} />
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '9px 14px', borderRadius: 12, fontSize: 12 }}>
                                    <span style={{ fontSize: 16 }}>🎁</span>
                                    <span><strong>Unlocked VIP Perk:</strong> {vipTier.perk}</span>
                                </div>
                            </div>

                            {/* Stats Cards Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
                                <LuxuryStatCard
                                    title="Total Hospitality Spend"
                                    value={formatPrice(totalMySpend)}
                                    subtext="Rooms, Dining & Desks"
                                    icon="💰"
                                    color="#f0a500"
                                />
                                <LuxuryStatCard
                                    title="Room Bookings"
                                    value={roomReservations.length}
                                    subtext={`${roomReservations.filter(r => r.status === 'approved').length} Active/Approved`}
                                    icon="🛏️"
                                    color="#3498db"
                                />
                                <LuxuryStatCard
                                    title="Gourmet Food Orders"
                                    value={foodOrders.length}
                                    subtext={`${foodOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length} Delivered`}
                                    icon="🍕"
                                    color="#27ae60"
                                />
                                <LuxuryStatCard
                                    title="Desk Reservations"
                                    value={deskReservations.length}
                                    subtext="Executive seating"
                                    icon="🍽️"
                                    color="#9b59b6"
                                />
                            </div>

                            {/* Charts Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
                                <LuxuryDoughnutChart
                                    title="🌟 VIP Guest Hospitality Portfolio"
                                    subtitle="Your personalized booking and dining activity with Paradise Hotel"
                                    centerLabel="Total Spent"
                                    centerValue={`${Math.round(totalMySpend)} ETB`}
                                    segments={[
                                        { label: 'Suites & Rooms', value: myRoomSpend || 1, color: '#f0a500' },
                                        { label: 'Dining & Food', value: myFoodSpend || 1, color: '#27ae60' },
                                        { label: 'Desks & Workspaces', value: myDeskSpend || 1, color: '#3498db' },
                                    ]}
                                />
                                <LuxuryBarChart
                                    title="📈 Monthly Guest Engagement Trend"
                                    subtitle="Estimated hospitality value over past months"
                                    data={monthlyGuestActivity}
                                    unit="ETB"
                                    color="linear-gradient(180deg, #f0a500 0%, #d4af37 100%)"
                                />
                            </div>

                            {/* Quick Overview Summary Boxes */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                                {/* Latest Room Booking */}
                                <div className="card luxury-card" style={{ padding: 22 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                        <h3 style={{ margin: 0, fontSize: 17, color: 'var(--text-dark)' }}>🛏️ Latest Room Booking</h3>
                                        <button className="btn btn-sm btn-luxury-outline" onClick={() => setSearchParams({ tab: 'rooms' })}>
                                            View All ➔
                                        </button>
                                    </div>
                                    {roomReservations.length > 0 ? (
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: 16, color: 'var(--text-dark)' }}>
                                                Room #{roomReservations[0].room_number || 'N/A'} ({roomReservations[0].room_type})
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                                Dates: {roomReservations[0].check_in_date} ➔ {roomReservations[0].check_out_date}
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                {renderStatusBadge(roomReservations[0].status, roomReservations[0].payment_status)}
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No room bookings yet. Explore our 30 suites!</p>
                                    )}
                                </div>

                                {/* Latest Food Order */}
                                <div className="card luxury-card" style={{ padding: 22 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                        <h3 style={{ margin: 0, fontSize: 17, color: 'var(--text-dark)' }}>🍕 Latest Culinary Order</h3>
                                        <button className="btn btn-sm btn-luxury-outline" onClick={() => setSearchParams({ tab: 'food' })}>
                                            View All ➔
                                        </button>
                                    </div>
                                    {foodOrders.length > 0 ? (
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: 16, color: 'var(--text-dark)' }}>
                                                Order #{foodOrders[0].id} ({foodOrders[0].order_type})
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                                Amount: {formatPrice(foodOrders[0].total_amount || 0)}
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                {renderStatusBadge(foodOrders[0].status, foodOrders[0].payment_status)}
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No food orders yet. Try our Ethiopian &amp; gourmet dishes!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. ROOM RESERVATIONS */}
                    {activeTab === 'rooms' && (
                        <div className="dashboard-tab-pane">
                            <div className="luxury-section-panel" style={{ padding: '24px 22px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                                    <div>
                                        <h2 className="luxury-panel-title" style={{ margin: 0 }}>
                                            <span>🛏️</span> My Room Reservations ({roomReservations.length})
                                        </h2>
                                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                                            Check-in dates, digital folio, and reservation status.
                                        </p>
                                    </div>
                                    <button className="btn btn-luxury-gold" onClick={() => navigate('/rooms')}>
                                        + Book Another Suite
                                    </button>
                                </div>

                                {roomReservations.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        {roomReservations.map(r => (
                                            <div key={r.id} className="card luxury-card" style={{ padding: 20 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: 260 }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: 17, color: 'var(--text-dark)' }}>
                                                            Room #{r.room_number || 'N/A'} — <span style={{ color: 'var(--accent)' }}>{r.room_type}</span>
                                                        </div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                                            📅 Check-in: <strong>{r.check_in_date}</strong> ➔ Check-out: <strong>{r.check_out_date}</strong>
                                                        </div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                                                            📍 Location: {r.wereda}, {r.kebele}, {r.zone}, {r.region}
                                                        </div>
                                                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', marginTop: 6 }}>
                                                            Total: {formatPrice(r.total_price || 0)}
                                                        </div>
                                                        {r.rejection_reason && (
                                                            <div style={{ fontSize: 13, color: '#d9534f', marginTop: 6, background: 'rgba(217, 83, 79, 0.1)', padding: '6px 12px', borderRadius: 8 }}>
                                                                <strong>Staff Note:</strong> {r.rejection_reason}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                                        {renderStatusBadge(r.status, r.payment_status)}

                                                        {((r.payment_status === 'awaiting_payment' || r.payment_status === 'pending' || r.status === 'pending') && r.payment_status !== 'paid' && r.status !== 'cancelled' && r.status !== 'rejected') && (
                                                            <button className="btn btn-luxury-gold btn-sm" onClick={() => navigate(`/payment?type=room&id=${r.id}`)}>
                                                                💳 Pay / Upload Receipt
                                                            </button>
                                                        )}

                                                        {r.payment_status === 'paid' && (
                                                            <button
                                                                className="btn btn-sm btn-luxury-outline"
                                                                onClick={() => setInvoiceModal({ isOpen: true, reference: r.payment_reference || '', type: 'room', id: r.id })}
                                                            >
                                                                📄 View Official Invoice
                                                            </button>
                                                        )}

                                                        {(r.status === 'approved' || r.payment_status === 'paid') && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-luxury-gold btn-sm"
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}
                                                                onClick={() => setRoomKeyModal({ isOpen: true, reservation: r })}
                                                            >
                                                                <span>🎫</span> Digital Room Key &amp; QR Pass
                                                            </button>
                                                        )}

                                                        {r.status === 'approved' && (
                                                            <button className="btn btn-warning btn-sm" onClick={() => openRefundModal('room', r)}>
                                                                💸 Request Refund
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                                                    <OrderTrackingStepper type="room" status={r.status} paymentStatus={r.payment_status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No room reservations found. <button className="btn btn-luxury-gold btn-sm" onClick={() => navigate('/rooms')}>Browse 30 Suites ➔</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. DESK RESERVATIONS */}
                    {activeTab === 'desks' && (
                        <div className="dashboard-tab-pane">
                            <div className="luxury-section-panel" style={{ padding: '24px 22px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                                    <div>
                                        <h2 className="luxury-panel-title" style={{ margin: 0 }}>
                                            <span>🍽️</span> My Desk Reservations ({deskReservations.length})
                                        </h2>
                                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                                            Executive workspaces and dining tables.
                                        </p>
                                    </div>
                                    <button className="btn btn-luxury-gold" onClick={() => navigate('/reserve-desk')}>
                                        + Book Another Table
                                    </button>
                                </div>

                                {deskReservations.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        {deskReservations.map(d => (
                                            <div key={d.id} className="card luxury-card" style={{ padding: 20 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: 260 }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: 17, color: 'var(--text-dark)' }}>
                                                            Desk #{d.desk_number || 'N/A'} — <span style={{ color: 'var(--accent)' }}>{d.location}</span>
                                                        </div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                                            📅 Reservation Date: <strong>{d.reservation_date}</strong> · Duration: <strong>{Number(d.duration_hours || 0).toFixed(1)} hrs</strong>
                                                        </div>
                                                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', marginTop: 6 }}>
                                                            {d.is_free_with_food ? '🎉 100% FREE (Dining Privilege)' : `Total: ${formatPrice(d.amount || 0)}`}
                                                        </div>
                                                        {d.rejection_reason && (
                                                            <div style={{ fontSize: 13, color: '#d9534f', marginTop: 6, background: 'rgba(217, 83, 79, 0.1)', padding: '6px 12px', borderRadius: 8 }}>
                                                                <strong>Rejection Reason:</strong> {d.rejection_reason}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                                        {renderStatusBadge(d.status, d.payment_status)}

                                                        {((d.payment_status === 'awaiting_payment' || d.payment_status === 'pending' || d.status === 'pending') && !d.is_free_with_food && d.payment_status !== 'paid' && d.status !== 'cancelled' && d.status !== 'rejected') && (
                                                            <button className="btn btn-luxury-gold btn-sm" onClick={() => navigate(`/payment?type=desk&id=${d.id}`)}>
                                                                💳 Pay / Upload Receipt
                                                            </button>
                                                        )}

                                                        {d.payment_status === 'paid' && (
                                                            <button
                                                                className="btn btn-sm btn-luxury-outline"
                                                                onClick={() => setInvoiceModal({ isOpen: true, reference: d.payment_reference || '', type: 'desk', id: d.id })}
                                                            >
                                                                📄 View Official Invoice
                                                            </button>
                                                        )}

                                                        {d.status === 'approved' && (
                                                            <button className="btn btn-warning btn-sm" onClick={() => openRefundModal('desk', d)}>
                                                                💸 Request Refund
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No dining desks reserved yet. <button className="btn btn-luxury-gold btn-sm" onClick={() => navigate('/reserve-desk')}>Reserve Desk ➔</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. FOOD ORDERS */}
                    {activeTab === 'food' && (
                        <div className="dashboard-tab-pane">
                            <div className="luxury-section-panel" style={{ padding: '24px 22px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                                    <div>
                                        <h2 className="luxury-panel-title" style={{ margin: 0 }}>
                                            <span>🍕</span> My Gourmet Food Orders ({foodOrders.length})
                                        </h2>
                                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                                            Live preparation tracking and room delivery service.
                                        </p>
                                    </div>
                                    <button className="btn btn-luxury-gold" onClick={() => navigate('/order-food')}>
                                        + Order More Dishes
                                    </button>
                                </div>

                                {foodOrders.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        {foodOrders.map(o => (
                                            <div key={o.id} className="card luxury-card" style={{ padding: 20 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: 260 }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: 17, color: 'var(--text-dark)' }}>
                                                            Order #{o.id} — <span style={{ textTransform: 'capitalize', color: 'var(--accent)' }}>{o.order_type} Service</span>
                                                        </div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                                            🕒 Placed: {new Date(o.order_date).toLocaleString()}
                                                        </div>
                                                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', marginTop: 6 }}>
                                                            Total: {formatPrice(o.total_amount || 0)}
                                                        </div>
                                                        {o.rejection_reason && (
                                                            <div style={{ fontSize: 13, color: '#d9534f', marginTop: 6, background: 'rgba(217, 83, 79, 0.1)', padding: '6px 12px', borderRadius: 8 }}>
                                                                <strong>Kitchen Note:</strong> {o.rejection_reason}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                                        {renderStatusBadge(o.status, o.payment_status)}

                                                        {((o.payment_status === 'awaiting_payment' || o.payment_status === 'pending' || o.status === 'pending') && o.payment_status !== 'paid' && o.status !== 'cancelled') && (
                                                            <button className="btn btn-luxury-gold btn-sm" onClick={() => navigate(`/payment?type=food&id=${o.id}`)}>
                                                                💳 Pay / Upload Receipt
                                                            </button>
                                                        )}

                                                        {o.payment_status === 'paid' && (
                                                            <button
                                                                className="btn btn-sm btn-luxury-outline"
                                                                onClick={() => setInvoiceModal({ isOpen: true, reference: o.payment_reference || '', type: 'food', id: o.id })}
                                                            >
                                                                📄 View Official Invoice
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                                                    <OrderTrackingStepper type="food" status={o.status} paymentStatus={o.payment_status} isDelivery={o.order_type === 'delivery'} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No culinary orders found. <button className="btn btn-luxury-gold btn-sm" onClick={() => navigate('/order-food')}>Order Food ➔</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 5. INVOICES & PAYMENTS */}
                    {activeTab === 'payments' && (
                        <div className="dashboard-tab-pane">
                            <div className="luxury-section-panel" style={{ padding: '24px 22px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                                    <div>
                                        <h2 className="luxury-panel-title" style={{ margin: 0 }}>
                                            <span>💳</span> Invoices &amp; Payment Folios ({payments.length})
                                        </h2>
                                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                                            Download and print official receipts for all settled transactions.
                                        </p>
                                    </div>
                                </div>

                                {payments.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {payments.map(p => (
                                            <div key={p.id} className="card luxury-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: 16, color: 'var(--text-dark)' }}>
                                                        Payment Ref: #{p.payment_reference || p.reference || p.id}
                                                    </div>
                                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                                                        Type: <strong style={{ textTransform: 'uppercase' }}>{p.reservation_type || p.booking_type || 'General'}</strong> · Method: {p.payment_method || 'Online'}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                        Date: {new Date(p.created_at || p.payment_date || Date.now()).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>
                                                        {formatPrice(p.amount || 0)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-luxury-gold btn-sm"
                                                        onClick={() => setInvoiceModal({ isOpen: true, reference: p.payment_reference || '', type: p.reservation_type || 'room', id: p.id })}
                                                    >
                                                        📄 View / Print Invoice
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No settled payment receipts on file yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 6. REFUND REQUESTS */}
                    {activeTab === 'refunds' && (
                        <div className="dashboard-tab-pane">
                            <div className="luxury-section-panel" style={{ padding: '24px 22px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                                    <div>
                                        <h2 className="luxury-panel-title" style={{ margin: 0 }}>
                                            <span>💰</span> Refund Requests &amp; Status ({refundRequests.length})
                                        </h2>
                                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                                            Automated time-based penalty calculations and manager approval tracking.
                                        </p>
                                    </div>
                                </div>

                                {refundRequests.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {refundRequests.map(rf => (
                                            <div key={rf.id} className="card luxury-card" style={{ padding: 20 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: 16, color: 'var(--text-dark)' }}>
                                                            Refund #{rf.id} — {rf.reservation_type?.toUpperCase()} #{rf.reservation_id}
                                                        </div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                                            Original Paid: {formatPrice(rf.original_amount)} · Penalty ({rf.penalty_percentage}%): -{formatPrice(rf.penalty_amount)}
                                                        </div>
                                                        <div style={{ fontSize: 16, fontWeight: 800, color: '#27ae60', marginTop: 4 }}>
                                                            Net Refund Amount: {formatPrice(rf.refund_amount)}
                                                        </div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                                            <strong>Guest Reason:</strong> {rf.reason}
                                                        </div>
                                                        {rf.rejection_reason && (
                                                            <div style={{ fontSize: 13, color: '#d9534f', marginTop: 4 }}>
                                                                <strong>Staff Note:</strong> {rf.rejection_reason}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <span className={`status-badge status-${rf.status}`}>
                                                            {rf.status?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No refund requests submitted yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 7. CONCIERGE MESSAGES */}
                    {activeTab === 'messages' && (
                        <div className="dashboard-tab-pane">
                            <div className="luxury-section-panel" style={{ padding: '24px 22px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                                    <div>
                                        <h2 className="luxury-panel-title" style={{ margin: 0 }}>
                                            <span>💬</span> My Concierge Inquiries &amp; Hotel Replies ({myMessages.length})
                                        </h2>
                                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                                            Direct communication line with Paradise Hotel front desk &amp; management.
                                        </p>
                                    </div>
                                    <Link to="/contact" className="btn btn-luxury-gold">
                                        + Send New Message
                                    </Link>
                                </div>

                                {myMessages.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        {myMessages.map(m => (
                                            <div key={m.id} className="card luxury-card" style={{ padding: 20 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: 16, color: 'var(--text-dark)' }}>
                                                            {m.subject}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                            Category: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{m.category || 'General'}</span> · Sent: {new Date(m.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className={`status-badge ${m.status === 'replied' ? 'status-approved' : 'status-pending'}`}>
                                                            {m.status === 'replied' ? '✓ Replied' : '⏳ Pending Response'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 10, margin: '12px 0', fontSize: 14, color: 'var(--text-dark)' }}>
                                                    <strong>My Message:</strong> {m.message}
                                                </div>

                                                {m.staff_reply && (
                                                    <div style={{ background: 'rgba(240, 165, 0, 0.08)', borderLeft: '4px solid var(--accent)', padding: '14px 16px', borderRadius: '4px 12px 12px 4px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                            <strong style={{ color: 'var(--accent)', fontSize: 13 }}>
                                                                💬 Official Reply ({m.replied_by_role || 'Hotel Management'})
                                                            </strong>
                                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                                {m.replied_at ? new Date(m.replied_at).toLocaleString() : ''}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.5 }}>
                                                            {m.staff_reply}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No messages or inquiries yet. Need concierge assistance? <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Contact our 24/7 team →</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Interactive Refund Request Modal */}
            {refundModal && refundCalc && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, maxWidth: 520, width: '100%', padding: 28, position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
                        <button onClick={() => setRefundModal(null)} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
                        <h2 style={{ marginTop: 0, color: 'var(--text-dark)', fontFamily: 'var(--font-heading)' }}>💸 Request Refund</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                            Automatic penalty calculated based on remaining time before reservation:
                        </p>

                        <div style={{ background: 'rgba(240, 165, 0, 0.08)', borderRadius: 12, padding: 16, margin: '16px 0', borderLeft: '4px solid var(--accent)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span>Original Paid Amount:</span>
                                <strong>{formatPrice(refundCalc.originalAmount)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#d9534f' }}>
                                <span>Time-based Penalty ({refundCalc.penaltyPercentage}%):</span>
                                <strong>-{formatPrice(refundCalc.penaltyAmount)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 18, fontWeight: 'bold', color: '#27ae60' }}>
                                <span>Net Refund Amount:</span>
                                <span>{formatPrice(refundCalc.refundAmount)}</span>
                            </div>
                            <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
                                Policy: &gt;7 days=5%, 3-7 days=15%, 24-72h=30%, &lt;24h=50%, post-start=100%.
                            </small>
                        </div>

                        <form onSubmit={handleRefundSubmit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontWeight: 'bold', fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                                    Reason for Refund Request *
                                </label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    rows="3"
                                    required
                                    placeholder="Please describe why you are requesting a refund..."
                                    className="clean-input"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" onClick={() => setRefundModal(null)} className="btn btn-luxury-outline" style={{ flex: 1, padding: 12 }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submittingRefund} className="btn" style={{ flex: 1.5, padding: 12, background: '#d9534f', color: '#fff', fontWeight: 'bold', borderRadius: 10 }}>
                                    {submittingRefund ? 'Submitting...' : 'Submit Refund Request ➔'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Official Invoice / Receipt Modal */}
            <InvoiceModal
                isOpen={invoiceModal.isOpen}
                onClose={() => setInvoiceModal({ isOpen: false, reference: '', type: '', id: null })}
                reference={invoiceModal.reference}
                bookingType={invoiceModal.type}
                bookingId={invoiceModal.id}
            />

            {/* VIP Digital Room Key & QR Boarding Pass Modal */}
            <DigitalRoomKeyModal
                isOpen={roomKeyModal.isOpen}
                onClose={() => setRoomKeyModal({ isOpen: false, reservation: null })}
                reservation={roomKeyModal.reservation}
                guestName={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}
            />
        </div>
    );
};

export default CustomerDashboard;
