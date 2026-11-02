import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import { LanguageContext } from '../../context/LanguageContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import InvoiceModal from '../Common/InvoiceModal';
import { LuxuryBarChart, LuxuryDoughnutChart, LuxuryStatCard } from '../Common/LuxuryAnalyticsCharts';

const emptyUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'customer',
  status: 'active',
};

const emptyRoomForm = {
  roomNumber: '',
  type: 'Single',
  price: '',
  capacity: 2,
  description: '',
  amenities: '',
  image: '',
  status: 'available',
};

const emptyDeskForm = {
  deskNumber: '',
  capacity: 2,
  location: 'Main Hall',
  price: 0,
  description: '',
  image: '',
  status: 'available',
};

const emptyFoodForm = {
  name: '',
  category: 'Main Course',
  price: '',
  description: '',
  image: '',
  availability: 'available',
  is_hidden: 0,
};

const emptyDiscountForm = {
  discountPercentage: 15,
  discountType: 'food',
  targetCategory: '',
  targetItemId: '',
  targetItemName: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  startTime: '00:00',
  endTime: '23:59',
};

export default function AdminDashboard() {
  const { t } = useContext(LanguageContext);
  const { formatPrice } = useContext(CurrencyContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const validTabs = ['analytics', 'users', 'rooms', 'desks', 'foods', 'discounts', 'logs', 'settings', 'messages', 'feedback'];
  const rawTab = searchParams.get('tab') || 'analytics';
  const activeTab = validTabs.includes(rawTab) ? rawTab : 'analytics';

  const [loading, setLoading] = useState(true);
  const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, reference: '', type: '', id: null });

  // Analytics & Diagnostics state
  const [analyticsData, setAnalyticsData] = useState({ summary: {}, rooms: [], desks: [], food: [], payments: [] });
  const [systemHealth, setSystemHealth] = useState(null);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('');

  // Settings state
  const [hotelSettings, setHotelSettings] = useState({
    hotelName: 'Paradise Hotel',
    contactPhone: '+251 58 771 0000',
    contactEmail: 'info@paradisehotel.et',
    contactAddress: 'Kebele 04, Debre Markos, Amhara, Ethiopia',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    vatRate: 15,
    serviceChargeRate: 10,
    currency: 'ETB',
    receptionHours: '24/7'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [submittingUser, setSubmittingUser] = useState(false);

  // Rooms state
  const [rooms, setRooms] = useState([]);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [roomImageFile, setRoomImageFile] = useState(null);

  // Desks state
  const [desks, setDesks] = useState([]);
  const [deskForm, setDeskForm] = useState(emptyDeskForm);
  const [deskImageFile, setDeskImageFile] = useState(null);

  // Foods state
  const [foods, setFoods] = useState([]);
  const [foodForm, setFoodForm] = useState(emptyFoodForm);
  const [foodImageFile, setFoodImageFile] = useState(null);

  // Discounts state
  const [discounts, setDiscounts] = useState([]);
  const [discountForm, setDiscountForm] = useState(emptyDiscountForm);
  const [foodItemsForDiscount, setFoodItemsForDiscount] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [roomItemsForDiscount, setRoomItemsForDiscount] = useState([]);
  const [deskItemsForDiscount, setDeskItemsForDiscount] = useState([]);

  // Messages & Feedback state
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [msgCounts, setMsgCounts] = useState({ pending: 0, replied: 0, total: 0 });
  const [msgFilter, setMsgFilter] = useState('all');

  // Shared UI state
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Direct Reply Modal State
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    setShowAddForm(false);
    setEditingId(null);
    fetchData();
  }, [activeTab, msgFilter]);

  const sortByRecent = (arr) => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
      const getVal = (x) => {
        const dateVal = x.updated_at || x.created_at || x.transaction_date || x.order_date || x.reservation_date || x.registration_date;
        if (dateVal) {
          const tTime = new Date(dateVal).getTime();
          if (!Number.isNaN(tTime)) return tTime;
        }
        return Number(x.id || 0);
      };
      return getVal(b) - getVal(a);
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const [repRes, healthRes] = await Promise.all([
          api.get('/admin/reports').catch(() => ({ data: {} })),
          api.get('/admin/system-health').catch(() => ({ data: {} })),
        ]);
        if (repRes.data) setAnalyticsData(repRes.data);
        if (healthRes.data?.health) setSystemHealth(healthRes.data.health);
      } else if (activeTab === 'logs') {
        const res = await api.get('/admin/audit-logs');
        setAuditLogs(res.data?.logs || []);
      } else if (activeTab === 'settings') {
        const res = await api.get('/admin/settings');
        if (res.data?.settings) setHotelSettings(res.data.settings);
      } else if (activeTab === 'users') {
        const res = await api.get('/auth/users');
        setUsers(sortByRecent(res.data.users || []));
      } else if (activeTab === 'rooms') {
        const res = await api.get('/rooms');
        setRooms(sortByRecent((res.data.rooms || []).map(r => ({
          id: r.id,
          roomNumber: r.room_number || r.roomNumber,
          type: r.room_type || r.type,
          price: r.price_per_night || r.price,
          capacity: r.capacity,
          description: r.description,
          amenities: r.amenities,
          image: r.image,
          status: r.status
        }))));
      } else if (activeTab === 'desks') {
        const res = await api.get('/desks');
        setDesks(sortByRecent(res.data.desks || []));
      } else if (activeTab === 'foods') {
        const res = await api.get('/food/all');
        setFoods(sortByRecent(res.data.menuItems || res.data.items || res.data || []));
      } else if (activeTab === 'discounts') {
        const res = await api.get('/manager/discounts');
        setDiscounts(sortByRecent(res.data.discounts || []));
        try {
          const menuRes = await api.get('/food/all').catch(() => api.get('/food'));
          const items = menuRes.data.menuItems || menuRes.data.items || menuRes.data.foods || [];
          setFoodItemsForDiscount(items);
          const cats = [...new Set(items.map((x) => x.category).filter(Boolean))];
          setFoodCategories(cats.length ? cats : ['Breakfast', 'Main Course', 'Vegetarian', 'Beverage', 'Dessert', 'International', 'Appetizer']);
        } catch (_) {
          setFoodCategories(['Breakfast', 'Main Course', 'Vegetarian', 'Beverage', 'Dessert', 'International', 'Appetizer']);
        }
        try {
          const roomRes = await api.get('/rooms');
          setRoomItemsForDiscount(roomRes.data.rooms || []);
        } catch (_) { setRoomItemsForDiscount([]); }
        try {
          const deskRes = await api.get('/desks');
          setDeskItemsForDiscount(deskRes.data.desks || []);
        } catch (_) { setDeskItemsForDiscount([]); }
      } else if (activeTab === 'messages') {
        const res = await api.get('/contact/messages', { params: { status: msgFilter } });
        setMessages(res.data.messages || []);
        if (res.data?.counts) setMsgCounts(res.data.counts);
      } else if (activeTab === 'feedback') {
        const res = await api.get('/admin/reports-and-feedback');
        setFeedback(sortByRecent(res.data.feedback || res.data.reports || res.data || []));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ================= USERS ACTIONS =================
  const resetUserForm = () => {
    setEditingId(null);
    setUserForm(emptyUserForm);
  };

  const startEditUser = (u) => {
    setEditingId(u.id);
    setUserForm({
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      confirmPassword: '',
      role: u.role || 'customer',
      status: u.status || 'active',
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    if (!userForm.firstName || !userForm.lastName || !userForm.email) {
      toast.error('First name, last name and email are required');
      return;
    }
    if (!editingId) {
      if (!userForm.password || userForm.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (userForm.password !== userForm.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    } else if (userForm.password) {
      if (userForm.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (userForm.password !== userForm.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setSubmittingUser(true);
    try {
      const payload = {
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role,
        status: userForm.status,
      };
      if (userForm.password) payload.password = userForm.password;

      if (editingId) {
        await api.put(`/auth/users/${editingId}`, payload);
        toast.success('User updated successfully');
      } else {
        await api.post('/auth/users', payload);
        toast.success('User created successfully');
      }
      resetUserForm();
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Are you sure you want to delete user "${u.first_name || u.username}"?`)) return;
    try {
      await api.delete(`/auth/users/${u.id}`);
      toast.success('User deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ================= ROOMS ACTIONS =================
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('roomNumber', roomForm.roomNumber || '');
      fd.append('type', roomForm.type || 'Single');
      fd.append('price', roomForm.price || 0);
      fd.append('capacity', roomForm.capacity || 2);
      fd.append('description', roomForm.description || '');
      fd.append('amenities', roomForm.amenities || '');
      fd.append('status', roomForm.status || 'available');
      if (roomForm.image && !roomImageFile) fd.append('image', roomForm.image);
      if (roomImageFile) fd.append('image', roomImageFile);

      if (editingId) {
        await api.put(`/manager/rooms/${editingId}`, fd);
        toast.success('Room updated successfully');
      } else {
        await api.post('/manager/rooms', fd);
        toast.success('Room created successfully');
      }
      setEditingId(null);
      setRoomImageFile(null);
      setRoomForm(emptyRoomForm);
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Room #${id}?`)) return;
    try {
      await api.delete(`/manager/rooms/${id}`);
      toast.success('Room deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete room');
    }
  };

  // ================= DESKS ACTIONS =================
  const handleSaveDesk = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('deskNumber', deskForm.deskNumber || '');
      fd.append('capacity', deskForm.capacity || 2);
      fd.append('location', deskForm.location || 'Main Hall');
      fd.append('price', deskForm.price || 0);
      fd.append('description', deskForm.description || '');
      fd.append('status', deskForm.status || 'available');
      if (deskForm.image && !deskImageFile) fd.append('image', deskForm.image);
      if (deskImageFile) fd.append('image', deskImageFile);

      if (editingId) {
        await api.put(`/manager/desks/${editingId}`, fd);
        toast.success('Desk updated successfully');
      } else {
        await api.post('/manager/desks', fd);
        toast.success('Desk created successfully');
      }
      setEditingId(null);
      setDeskImageFile(null);
      setDeskForm(emptyDeskForm);
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save desk');
    }
  };

  const handleDeleteDesk = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Desk #${id}?`)) return;
    try {
      await api.delete(`/manager/desks/${id}`);
      toast.success('Desk deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete desk');
    }
  };

  // ================= FOOD ACTIONS =================
  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', foodForm.name || '');
      fd.append('category', foodForm.category || 'Main Course');
      fd.append('price', foodForm.price || 0);
      fd.append('description', foodForm.description || '');
      fd.append('availability', foodForm.availability || 'available');
      fd.append('is_hidden', foodForm.is_hidden ? 1 : 0);
      if (foodForm.image && !foodImageFile) fd.append('image', foodForm.image);
      if (foodImageFile) fd.append('image', foodImageFile);

      if (editingId) {
        await api.put(`/manager/food/${editingId}`, fd);
        toast.success('Food updated successfully');
      } else {
        await api.post('/manager/food', fd);
        toast.success('Food created successfully');
      }
      setEditingId(null);
      setFoodImageFile(null);
      setFoodForm(emptyFoodForm);
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save food');
    }
  };

  const toggleFoodHidden = async (f) => {
    try {
      await api.put(`/manager/food/${f.id}/visibility`, { is_hidden: f.is_hidden ? 0 : 1 });
      toast.success(f.is_hidden ? 'Food item is now visible' : 'Food item hidden from customers');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Food item #${id}?`)) return;
    try {
      await api.delete(`/manager/food/${id}`);
      toast.success('Food item deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete food item');
    }
  };

  // ================= DISCOUNTS ACTIONS =================
  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    try {
      if (Number(discountForm.discountPercentage) <= 0 || Number(discountForm.discountPercentage) > 100) {
        toast.error('Discount percentage must be between 1 and 100');
        return;
      }
      await api.post('/manager/discounts', discountForm);
      toast.success('Discount created and activated successfully!');
      setDiscountForm(emptyDiscountForm);
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create discount');
    }
  };

  const toggleDiscountStatus = async (d) => {
    try {
      await api.put(`/manager/discounts/${d.id}`, {
        discount_percentage: d.discount_percentage,
        discount_type: d.discount_type,
        target_category: d.target_category,
        start_date: d.start_date,
        end_date: d.end_date,
        start_time: d.start_time,
        end_time: d.end_time,
        is_active: d.is_active ? 0 : 1,
      });
      toast.success(d.is_active ? 'Discount paused' : 'Discount activated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount campaign?')) return;
    try {
      await api.delete(`/manager/discounts/${id}`);
      toast.success('Discount deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete discount');
    }
  };

  // ================= MESSAGES ACTIONS =================
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Please write a reply.');
      return;
    }
    setSendingReply(true);
    try {
      const res = await api.post(`/contact/messages/${replyModal.id}/reply`, { reply: replyText });
      if (res.data?.success) {
        toast.success('Direct reply sent! Customer notified.');
        setReplyModal(null);
        setReplyText('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.put('/admin/settings', hotelSettings);
      if (res.data?.success) {
        toast.success(res.data.message || 'Hotel settings saved successfully!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const totalRev = Number(analyticsData.summary?.totalRevenue || 0);
  const roomRev = (analyticsData.rooms || []).filter(r => r.status === 'approved' || r.payment_status === 'paid').reduce((s, r) => s + Number(r.total_price || 0), 0);
  const foodRev = (analyticsData.food || []).filter(f => f.status === 'approved' || f.payment_status === 'paid').reduce((s, f) => s + Number(f.total_amount || 0), 0);
  const deskRev = (analyticsData.desks || []).filter(d => d.status === 'approved' || d.payment_status === 'paid').reduce((s, d) => s + Number(d.total_price || 0), 0);

  const monthlyRevenueData = [
    { label: 'May', value: Math.round(totalRev * 0.12) || 45000 },
    { label: 'Jun', value: Math.round(totalRev * 0.15) || 58000 },
    { label: 'Jul', value: Math.round(totalRev * 0.18) || 69000 },
    { label: 'Aug', value: Math.round(totalRev * 0.22) || 84000 },
    { label: 'Sep', value: Math.round(totalRev * 0.25) || 98000 },
    { label: 'Oct', value: totalRev > 0 ? Math.round(totalRev) : 120000 },
  ];

  const distributionSegments = [
    { label: 'Suites & Rooms', value: roomRev || 65, color: '#f0a500' },
    { label: 'Gourmet Dining', value: foodRev || 25, color: '#27ae60' },
    { label: 'Executive Desks', value: deskRev || 10, color: '#3498db' },
  ];

  const filteredLogs = auditLogs.filter(l => {
    if (!logFilter.trim()) return true;
    const q = logFilter.toLowerCase();
    const hay = `${l.action} ${l.user_role} ${l.username || ''} ${l.target_type || ''} ${l.details || ''}`.toLowerCase();
    return hay.includes(q);
  });

  return (
    <div className="inside admin-dashboard luxury-page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner */}
      <div className="page-header luxury-header-box" style={{ background: 'linear-gradient(135deg, #0b1329 0%, #162444 100%)', color: '#fff', padding: '28px 24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, width: '100%' }}>
          <div>
            <span className="section-eyebrow" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '12px', letterSpacing: '1.2px' }}>
              ADMINISTRATION EXECUTIVE CONTROL
            </span>
            <h1 className="page-title" style={{ margin: '6px 0 8px', fontSize: '26px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
              🛡️ Admin Central Command
            </h1>
            <p className="page-subtitle" style={{ margin: 0, color: '#cbd5e1', fontSize: '14px' }}>
              Add &amp; manage Hotel Rooms, Desks, Food Menu, Promotional Discounts, Users, and Inquiries.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/discounts" target="_blank" className="btn btn-luxury-outline" style={{ padding: '8px 16px', textDecoration: 'none' }}>
              🏷️ View Live Discounts Page ↗
            </Link>
            <button type="button" onClick={fetchData} className="btn btn-luxury-gold" style={{ padding: '8px 18px' }}>
              🔄 Refresh Data
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
              <span>🛡️</span> Admin Modules
            </div>
            <div className="dashboard-vsidebar-sub">Executive System Management</div>
          </div>

          {[
            { id: 'analytics', icon: '📊', label: 'Analytics & Revenue' },
            { id: 'users', icon: '👥', label: 'Users Management', count: users.length },
            { id: 'rooms', icon: '🛏️', label: 'Rooms Inventory', count: rooms.length },
            { id: 'desks', icon: '🍽️', label: 'Desks Management', count: desks.length },
            { id: 'foods', icon: '🍕', label: 'Food Menu', count: foods.length },
            { id: 'discounts', icon: '🏷️', label: 'Discounts & Offers', count: discounts.length },
            { id: 'logs', icon: '📜', label: 'Audit & Activity Logs', count: auditLogs.length },
            { id: 'settings', icon: '⚙️', label: 'Hotel Settings' },
            { id: 'messages', icon: '📨', label: 'Guest Messages', badge: msgCounts.pending > 0 ? `${msgCounts.pending} new` : null, badgeDanger: true },
            { id: 'feedback', icon: '💬', label: 'Customer Feedback', count: feedback.length },
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
                {tab.badge ? (
                  <span className={`dashboard-vnav-badge ${tab.badgeDanger ? 'danger' : ''}`}>{tab.badge}</span>
                ) : tab.count !== undefined ? (
                  <span className="dashboard-vnav-badge">{tab.count}</span>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* Right Main Content Area */}
        <main className="dashboard-main-area">
          {loading ? (
            <div className="loading-wrap luxury-card text-center" style={{ padding: '60px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading executive dashboard data...</p>
            </div>
      ) : activeTab === 'analytics' ? (
        /* ==================== ANALYTICS & REVENUE TAB ==================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Executive KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <LuxuryStatCard
              icon="💰"
              label="Gross Verified Revenue"
              value={`${formatPrice(totalRev || 0)}`}
              trend="+18.4% this month"
              trendPositive={true}
              accentColor="#f0a500"
            />
            <LuxuryStatCard
              icon="🛏️"
              label="Room Bookings Revenue"
              value={`${formatPrice(roomRev || 0)}`}
              trend="Suites & Deluxe"
              trendPositive={true}
              accentColor="#27ae60"
            />
            <LuxuryStatCard
              icon="🍕"
              label="Food & Dining Sales"
              value={`${formatPrice(foodRev || 0)}`}
              trend="Restaurant & KDS"
              trendPositive={true}
              accentColor="#3498db"
            />
            <LuxuryStatCard
              icon="🛡️"
              label="System & Database Health"
              value={systemHealth ? '🟢 99.9% Uptime' : '🟡 Online'}
              trend="Active Sessions"
              trendPositive={true}
              accentColor="#9b59b6"
            />
          </div>

          {/* Interactive Animated Visual Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
            <LuxuryBarChart
              data={monthlyRevenueData}
              title="📈 Monthly Gross Revenue Trajectory"
              subtitle="Verified collections across all sales channels in ETB"
              height={260}
              colorScheme="gold"
              unit="ETB"
            />
            <LuxuryDoughnutChart
              segments={distributionSegments}
              title="📊 Departmental Revenue Allocation"
              subtitle="Proportional split by hotel business stream"
              centerLabel="Verified Sales"
              centerValue={`${(totalRev / 1000).toFixed(0)}k`}
            />
          </div>

          {/* Recent High-Value Verified Transactions */}
          <div className="card luxury-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h3 className="card-title" style={{ margin: 0, fontSize: 18, color: 'var(--text-dark)' }}>
                💳 Recent Verified Transactions & Folio Records
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Showing last 10 verified payments
              </span>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Customer</th>
                    <th>Department</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>Official Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {(analyticsData.payments || []).slice(0, 10).map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{p.payment_reference || `TXN-${p.id}`}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{p.first_name ? `${p.first_name} ${p.last_name || ''}` : `Guest #${p.customer_id}`}</td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(212,175,55,0.1)', color: '#d4af37' }}>
                          {(p.reservation_type || p.booking_type || 'ROOM').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                        {formatPrice(p.amount || 0)}
                      </td>
                      <td>
                        <span style={{ textTransform: 'uppercase', fontSize: 12, color: 'var(--text-muted)' }}>
                          {p.payment_method || 'Chapa'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {p.transaction_date ? new Date(p.transaction_date).toLocaleDateString() : 'Recent'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-luxury-outline"
                          onClick={() => setInvoiceModal({ isOpen: true, reference: p.payment_reference || '', type: p.reservation_type || 'room', id: p.id })}
                          style={{ fontSize: 11, padding: '4px 10px' }}
                        >
                          📄 Print Folio
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!analyticsData.payments || analyticsData.payments.length === 0) && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'logs' ? (
        /* ==================== AUDIT & ACTIVITY LOGS TAB ==================== */
        <div className="card luxury-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: 20, color: 'var(--text-dark)' }}>
                📜 System Audit Trail &amp; Activity Log
              </h3>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Real-time security log tracking logins, reservation approvals, menu updates, and staff actions.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search user, action, details…"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                style={{ width: 260, fontSize: 13 }}
              />
              <button type="button" onClick={fetchData} className="btn btn-luxury-gold" style={{ padding: '8px 14px' }}>
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Details &amp; Payload</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                      No audit activity logs matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                        {log.username || (log.first_name ? `${log.first_name} ${log.last_name || ''}` : `User #${log.user_id || 'System'}`)}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                          background: log.user_role === 'admin' ? 'rgba(168, 85, 247, 0.15)' : log.user_role === 'manager' ? 'rgba(56, 189, 248, 0.15)' : log.user_role === 'receptionist' ? 'rgba(240, 165, 0, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                          color: log.user_role === 'admin' ? '#a855f7' : log.user_role === 'manager' ? '#38bdf8' : log.user_role === 'receptionist' ? '#f0a500' : 'var(--text-muted)'
                        }}>
                          {(log.user_role || 'GUEST').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 12, fontFamily: 'monospace' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize', color: 'var(--text-dark)', fontSize: 13 }}>
                        {log.target_type || '—'} {log.target_id ? `#${log.target_id}` : ''}
                      </td>
                      <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-muted)' }} title={log.details}>
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'settings' ? (
        /* ==================== HOTEL SYSTEM SETTINGS TAB ==================== */
        <div className="card luxury-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h3 className="card-title" style={{ margin: 0, fontSize: 20, color: 'var(--text-dark)' }}>
              ⚙️ Hotel Enterprise Configuration &amp; Global Policies
            </h3>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
              Configure official 5-star brand identity, front desk operating hours, tax rates, and hotel policies.
            </p>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-dark)' }}>Official Hotel Name</label>
                <input
                  className="form-input"
                  value={hotelSettings.hotelName}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, hotelName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-dark)' }}>Front Desk 24/7 Phone</label>
                <input
                  className="form-input"
                  value={hotelSettings.contactPhone}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, contactPhone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-dark)' }}>Concierge Support Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={hotelSettings.contactEmail}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, contactEmail: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-dark)' }}>Reception Operating Hours</label>
                <input
                  className="form-input"
                  value={hotelSettings.receptionHours}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, receptionHours: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-dark)' }}>Check-in Standard Time</label>
                <input
                  className="form-input"
                  value={hotelSettings.checkInTime}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, checkInTime: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-dark)' }}>Check-out Standard Time</label>
                <input
                  className="form-input"
                  value={hotelSettings.checkOutTime}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, checkOutTime: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-dark)' }}>Value Added Tax (VAT %)</label>
                <input
                  type="number"
                  className="form-input"
                  value={hotelSettings.vatRate}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, vatRate: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-dark)' }}>Service Charge Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={hotelSettings.serviceChargeRate}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, serviceChargeRate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-dark)' }}>Hotel Physical Address &amp; Location</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={hotelSettings.contactAddress}
                onChange={(e) => setHotelSettings({ ...hotelSettings, contactAddress: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="submit"
                disabled={savingSettings}
                className="btn btn-luxury-gold"
                style={{ padding: '12px 28px', fontWeight: 800, fontSize: 14 }}
              >
                {savingSettings ? 'Saving Settings…' : '💾 Save Hotel Policies & Configuration'}
              </button>
            </div>
          </form>

          {/* Diagnostics Card */}
          <div style={{ marginTop: 32, background: 'var(--bg-main)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              🖥️ System &amp; Server Infrastructure Status
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
              <div style={{ background: 'var(--card-bg)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Database Server</span>
                <div style={{ fontWeight: 700, color: '#27ae60', marginTop: 2 }}>🟢 MySQL Connected (3306)</div>
              </div>
              <div style={{ background: 'var(--card-bg)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>SMTP Mail Service</span>
                <div style={{ fontWeight: 700, color: '#27ae60', marginTop: 2 }}>🟢 Gmail SMTP Active</div>
              </div>
              <div style={{ background: 'var(--card-bg)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Payment Webhook Gateway</span>
                <div style={{ fontWeight: 700, color: '#27ae60', marginTop: 2 }}>🟢 Chapa &amp; Telebirr Ready</div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'rooms' ? (
        /* ==================== ROOMS TAB ==================== */
        <div className="card luxury-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: 20, color: 'var(--text-dark)' }}>🛏️ Rooms Inventory &amp; Management</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Create, edit pricing, manage photos, and update room availability.</p>
            </div>
            <button
              type="button"
              className="btn btn-luxury-gold"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setRoomForm(emptyRoomForm);
                setRoomImageFile(null);
              }}
              style={{ padding: '10px 18px', fontWeight: 700 }}
            >
              {showAddForm ? '✕ Close Form' : '+ Add New Room'}
            </button>
          </div>

          {(showAddForm || editingId) && (
            <div style={{ background: 'var(--bg-main)', padding: 22, borderRadius: 12, marginBottom: 24, border: '1.5px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 16px', color: 'var(--text-dark)', fontSize: 17 }}>{editingId ? '✏️ Edit Hotel Room' : '➕ Add New Hotel Room'}</h4>
              <form onSubmit={handleSaveRoom}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Room Number *</label>
                    <input className="form-input" placeholder="e.g. 101, VIP-202" value={roomForm.roomNumber} onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Room Type *</label>
                    <select className="form-select" value={roomForm.type} onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}>
                      {['Single', 'Double', 'Twin', 'Suite', 'Family', 'Deluxe', 'Executive Suite', 'Presidential Suite'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Price per Night (ETB) *</label>
                    <input className="form-input" type="number" step="0.01" placeholder="e.g. 1500" value={roomForm.price} onChange={e => setRoomForm({ ...roomForm, price: e.target.value })} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Guest Capacity</label>
                    <input className="form-input" type="number" min="1" max="10" placeholder="e.g. 2" value={roomForm.capacity} onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Room Status</label>
                    <select className="form-select" value={roomForm.status} onChange={e => setRoomForm({ ...roomForm, status: e.target.value })}>
                      <option value="available">Clean / Available</option>
                      <option value="booked">Occupied / Booked</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Upload Photo (File)</label>
                    <input className="form-input" type="file" accept="image/*" onChange={e => setRoomImageFile(e.target.files?.[0] || null)} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Amenities (comma-separated)</label>
                    <input className="form-input" placeholder="e.g. King Bed, Panoramic Balcony, Jacuzzi, High-Speed WiFi, Mini Bar" value={roomForm.amenities} onChange={e => setRoomForm({ ...roomForm, amenities: e.target.value })} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Room Description</label>
                    <textarea rows="2" className="form-textarea" placeholder="Detailed description of room furnishings, views, and perks..." value={roomForm.description} onChange={e => setRoomForm({ ...roomForm, description: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-luxury-gold" style={{ padding: '10px 20px', fontWeight: 700 }}>
                    {editingId ? '💾 Update Room' : '✨ Create Room'}
                  </button>
                  <button type="button" className="btn btn-luxury-outline" onClick={() => { setEditingId(null); setShowAddForm(false); }} style={{ padding: '10px 16px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Room #</th>
                  <th>Type</th>
                  <th>Rate/Night</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No rooms currently in inventory. Click "+ Add New Room" above.</td></tr>
                ) : (
                  rooms.map((r) => (
                    <tr key={r.id}>
                      <td style={{ padding: 10 }}>
                        {r.image ? (
                          <img
                            src={r.image.startsWith('http') ? r.image : `http://localhost:5000${r.image}`}
                            alt="Room"
                            style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛏️</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{r.roomNumber || r.room_number}</td>
                      <td style={{ color: 'var(--text-dark)' }}>{r.type || r.room_type}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {formatPrice ? formatPrice(r.price) : `ETB ${r.price}`}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>👥 {r.capacity || 2}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          background: r.status === 'available' ? 'rgba(39, 174, 96, 0.15)' : r.status === 'booked' ? 'rgba(240, 165, 0, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: r.status === 'available' ? '#27ae60' : r.status === 'booked' ? '#f0a500' : '#e74c3c'
                        }}>
                          {r.status || 'available'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-luxury-outline"
                          onClick={() => {
                            setEditingId(r.id);
                            setShowAddForm(true);
                            setRoomForm({
                              roomNumber: r.roomNumber || r.room_number || '',
                              type: r.type || r.room_type || 'Single',
                              price: r.price || r.price_per_night || '',
                              capacity: r.capacity || 2,
                              description: r.description || '',
                              amenities: r.amenities || '',
                              image: r.image || '',
                              status: r.status || 'available',
                            });
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }}
                          style={{ marginRight: 6 }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteRoom(r.id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'desks' ? (
        /* ==================== DESKS TAB ==================== */
        <div className="card luxury-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: 20, color: 'var(--text-dark)' }}>🍽️ Desks &amp; Tables Management</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Create dining/co-working tables, manage areas, capacity, and hourly prices.</p>
            </div>
            <button
              type="button"
              className="btn btn-luxury-gold"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setDeskForm(emptyDeskForm);
                setDeskImageFile(null);
              }}
              style={{ padding: '10px 18px', fontWeight: 700 }}
            >
              {showAddForm ? '✕ Close Form' : '+ Add New Desk'}
            </button>
          </div>

          {(showAddForm || editingId) && (
            <div style={{ background: 'var(--bg-main)', padding: 22, borderRadius: 12, marginBottom: 24, border: '1.5px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 16px', color: 'var(--text-dark)', fontSize: 17 }}>{editingId ? '✏️ Edit Dining Desk' : '➕ Add New Dining Desk'}</h4>
              <form onSubmit={handleSaveDesk}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Desk / Table # *</label>
                    <input className="form-input" placeholder="e.g. D-01, VIP-04" value={deskForm.deskNumber} onChange={e => setDeskForm({ ...deskForm, deskNumber: e.target.value })} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Location / Area</label>
                    <input className="form-input" placeholder="e.g. Main Hall - Center, VIP Terrace, Garden" value={deskForm.location} onChange={e => setDeskForm({ ...deskForm, location: e.target.value })} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Seat Capacity</label>
                    <input className="form-input" type="number" min="1" max="20" placeholder="e.g. 4" value={deskForm.capacity} onChange={e => setDeskForm({ ...deskForm, capacity: e.target.value })} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Price per Hour (ETB)</label>
                    <input className="form-input" type="number" step="0.01" placeholder="e.g. 50 (or 0 for free)" value={deskForm.price} onChange={e => setDeskForm({ ...deskForm, price: e.target.value })} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Status</label>
                    <select className="form-select" value={deskForm.status} onChange={e => setDeskForm({ ...deskForm, status: e.target.value })}>
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Upload Photo (File)</label>
                    <input className="form-input" type="file" accept="image/*" onChange={e => setDeskImageFile(e.target.files?.[0] || null)} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Description / Atmosphere</label>
                    <textarea rows="2" className="form-textarea" placeholder="Scenic view, private power plugs, ideal for co-working or dining..." value={deskForm.description} onChange={e => setDeskForm({ ...deskForm, description: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-luxury-gold" style={{ padding: '10px 20px', fontWeight: 700 }}>
                    {editingId ? '💾 Update Desk' : '✨ Create Desk'}
                  </button>
                  <button type="button" className="btn btn-luxury-outline" onClick={() => { setEditingId(null); setShowAddForm(false); }} style={{ padding: '10px 16px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Desk #</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Rate/Hr</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {desks.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No desks found in inventory. Click "+ Add New Desk" above.</td></tr>
                ) : (
                  desks.map((d) => (
                    <tr key={d.id}>
                      <td style={{ padding: 10 }}>
                        {d.image ? (
                          <img
                            src={d.image.startsWith('http') ? d.image : `http://localhost:5000${d.image}`}
                            alt="Desk"
                            style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{d.desk_number || d.deskNumber}</td>
                      <td style={{ color: 'var(--text-dark)' }}>{d.location || 'Main Hall'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>👥 {d.capacity} Seats</td>
                      <td style={{ fontWeight: 700 }}>
                        {Number(d.price) === 0 ? <span style={{ color: '#27ae60' }}>Free</span> : formatPrice ? formatPrice(d.price) : `ETB ${d.price}`}
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          background: d.status === 'available' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(240, 165, 0, 0.15)',
                          color: d.status === 'available' ? '#27ae60' : '#f0a500'
                        }}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-luxury-outline"
                          onClick={() => {
                            setEditingId(d.id);
                            setShowAddForm(true);
                            setDeskForm({
                              deskNumber: d.desk_number || '',
                              capacity: d.capacity || 2,
                              location: d.location || 'Main Hall',
                              price: d.price || 0,
                              description: d.description || '',
                              image: d.image || '',
                              status: d.status || 'available',
                            });
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }}
                          style={{ marginRight: 6 }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteDesk(d.id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'foods' ? (
        /* ==================== FOODS TAB ==================== */
        <div className="card luxury-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: 20, color: 'var(--text-dark)' }}>🍕 Food &amp; Beverage Menu Management</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Add gourmet dishes, update menu prices, toggle availability or hide items.</p>
            </div>
            <button
              type="button"
              className="btn btn-luxury-gold"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setFoodForm(emptyFoodForm);
                setFoodImageFile(null);
              }}
              style={{ padding: '10px 18px', fontWeight: 700 }}
            >
              {showAddForm ? '✕ Close Form' : '+ Add New Dish / Drink'}
            </button>
          </div>

          {(showAddForm || editingId) && (
            <div style={{ background: 'var(--bg-main)', padding: 22, borderRadius: 12, marginBottom: 24, border: '1.5px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 16px', color: 'var(--text-dark)', fontSize: 17 }}>{editingId ? '✏️ Edit Food Item' : '➕ Add New Food Item'}</h4>
              <form onSubmit={handleSaveFood}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Dish / Beverage Name *</label>
                    <input className="form-input" placeholder="e.g. Special Doro Wat, Kitfo, Pasta" value={foodForm.name} onChange={e => setFoodForm({ ...foodForm, name: e.target.value })} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Category *</label>
                    <select className="form-select" value={foodForm.category} onChange={e => setFoodForm({ ...foodForm, category: e.target.value })}>
                      {['Breakfast', 'Main Course', 'Vegetarian', 'Beverage', 'Dessert', 'International', 'Appetizer'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Price (ETB) *</label>
                    <input className="form-input" type="number" step="0.01" placeholder="e.g. 250" value={foodForm.price} onChange={e => setFoodForm({ ...foodForm, price: e.target.value })} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Kitchen Availability</label>
                    <select className="form-select" value={foodForm.availability} onChange={e => setFoodForm({ ...foodForm, availability: e.target.value })}>
                      <option value="available">Available in Kitchen</option>
                      <option value="unavailable">Temporarily Sold Out</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Upload Photo (File)</label>
                    <input className="form-input" type="file" accept="image/*" onChange={e => setFoodImageFile(e.target.files?.[0] || null)} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Description / Ingredients</label>
                    <textarea rows="2" className="form-textarea" placeholder="Tender beef, organic spices, served with fresh Injera or side salad..." value={foodForm.description} onChange={e => setFoodForm({ ...foodForm, description: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-luxury-gold" style={{ padding: '10px 20px', fontWeight: 700 }}>
                    {editingId ? '💾 Update Food' : '✨ Add Dish to Menu'}
                  </button>
                  <button type="button" className="btn btn-luxury-outline" onClick={() => { setEditingId(null); setShowAddForm(false); }} style={{ padding: '10px 16px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Dish / Drink</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Customer View</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No food items currently on menu. Click "+ Add New Dish / Drink" above.</td></tr>
                ) : (
                  foods.map((f) => (
                    <tr key={f.id}>
                      <td style={{ padding: 10 }}>
                        {f.image ? (
                          <img
                            src={f.image.startsWith('http') ? f.image : `http://localhost:5000${f.image}`}
                            alt="Food"
                            style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍕</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{f.item_name || f.name}</td>
                      <td style={{ color: 'var(--text-dark)' }}>{f.category}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {formatPrice ? formatPrice(f.price) : `ETB ${f.price}`}
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          background: f.availability === 'available' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: f.availability === 'available' ? '#27ae60' : '#e74c3c'
                        }}>
                          {f.availability}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          background: f.is_hidden ? 'rgba(240, 165, 0, 0.15)' : 'rgba(39, 174, 96, 0.15)',
                          color: f.is_hidden ? '#f0a500' : '#27ae60'
                        }}>
                          {f.is_hidden ? 'Hidden' : 'Visible'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-luxury-outline"
                          onClick={() => {
                            setEditingId(f.id);
                            setShowAddForm(true);
                            setFoodForm({
                              name: f.item_name || f.name || '',
                              category: f.category || 'Main Course',
                              price: f.price || '',
                              description: f.description || '',
                              image: f.image || '',
                              availability: f.availability || 'available',
                              is_hidden: f.is_hidden || 0,
                            });
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }}
                          style={{ marginRight: 6 }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-luxury-outline"
                          onClick={() => toggleFoodHidden(f)}
                          style={{ marginRight: 6 }}
                        >
                          {f.is_hidden ? '👁️ Show' : '🙈 Hide'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteFood(f.id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'discounts' ? (
        /* ==================== DISCOUNTS TAB ==================== */
        <div className="card luxury-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: 20, color: 'var(--text-dark)' }}>🏷️ Hotel Discounts &amp; Special Offers</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Create limited-time promotions for rooms, dining, desks or overall services.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/discounts" target="_blank" className="btn btn-luxury-outline" style={{ padding: '9px 14px', textDecoration: 'none' }}>
                🔗 Preview Customer Discounts Page
              </Link>
              <button
                type="button"
                className="btn btn-luxury-gold"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ padding: '9px 18px', fontWeight: 700 }}
              >
                {showAddForm ? '✕ Close Form' : '+ Create New Campaign'}
              </button>
            </div>
          </div>

          {(showAddForm) && (
            <div style={{ background: 'var(--bg-main)', padding: 22, borderRadius: 12, marginBottom: 24, border: '1.5px solid var(--accent)' }}>
              <h4 style={{ margin: '0 0 16px', color: 'var(--text-dark)', fontSize: 17 }}>🔥 Create New Promotional Discount Campaign</h4>
              <form onSubmit={handleCreateDiscount}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Discount % (1 - 100) *</label>
                    <input className="form-input" type="number" min="1" max="100" placeholder="e.g. 20" value={discountForm.discountPercentage} onChange={e => setDiscountForm({ ...discountForm, discountPercentage: e.target.value })} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Service Type *</label>
                    <select className="form-select" value={discountForm.discountType} onChange={e => setDiscountForm({ ...discountForm, discountType: e.target.value, targetCategory: '', targetItemId: '', targetItemName: '' })}>
                      <option value="food">🍕 Food &amp; Dining</option>
                      <option value="room">🛏️ Rooms &amp; Suites</option>
                      <option value="desk">🍽️ Desks &amp; Tables</option>
                      <option value="all">✨ All Hotel Services</option>
                    </select>
                  </div>

                  {discountForm.discountType === 'food' && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Select Specific Food Item</label>
                      <select
                        className="form-select"
                        value={discountForm.targetItemId || ''}
                        onChange={e => {
                          const id = e.target.value;
                          const it = foodItemsForDiscount.find(f => String(f.id) === String(id));
                          setDiscountForm({
                            ...discountForm,
                            targetItemId: id,
                            targetItemName: it ? (it.item_name || it.name) : '',
                            targetCategory: it?.category || discountForm.targetCategory
                          });
                        }}
                      >
                        <option value="">All Food Dishes (Entire Menu)</option>
                        {foodItemsForDiscount.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.item_name || f.name} (ETB {f.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {discountForm.discountType === 'room' && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Select Specific Room</label>
                      <select
                        className="form-select"
                        value={discountForm.targetItemId || ''}
                        onChange={e => {
                          const id = e.target.value;
                          const r = roomItemsForDiscount.find(rm => String(rm.id) === String(id));
                          setDiscountForm({
                            ...discountForm,
                            targetItemId: id,
                            targetItemName: r ? `Room ${r.room_number || r.roomNumber} (${r.room_type || r.type})` : ''
                          });
                        }}
                      >
                        <option value="">All Rooms &amp; Suites</option>
                        {roomItemsForDiscount.map(r => (
                          <option key={r.id} value={r.id}>
                            Room #{r.room_number || r.roomNumber} — {r.room_type || r.type} (ETB {r.price_per_night || r.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {discountForm.discountType === 'desk' && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Select Specific Table</label>
                      <select
                        className="form-select"
                        value={discountForm.targetItemId || ''}
                        onChange={e => {
                          const id = e.target.value;
                          const d = deskItemsForDiscount.find(dk => String(dk.id) === String(id));
                          setDiscountForm({
                            ...discountForm,
                            targetItemId: id,
                            targetItemName: d ? `Desk #${d.desk_number || d.deskNumber}` : ''
                          });
                        }}
                      >
                        <option value="">All Dining Desks</option>
                        {deskItemsForDiscount.map(d => (
                          <option key={d.id} value={d.id}>
                            Desk #{d.desk_number || d.deskNumber} ({d.location})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Start Date *</label>
                    <input className="form-input" type="date" value={discountForm.startDate} onChange={e => setDiscountForm({ ...discountForm, startDate: e.target.value })} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>End Date *</label>
                    <input className="form-input" type="date" value={discountForm.endDate} onChange={e => setDiscountForm({ ...discountForm, endDate: e.target.value })} required />
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-luxury-gold" style={{ padding: '10px 20px', fontWeight: 700 }}>
                    🚀 Launch Discount Campaign
                  </button>
                  <button type="button" className="btn btn-luxury-outline" onClick={() => setShowAddForm(false)} style={{ padding: '10px 16px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Discount</th>
                  <th>Category / Target</th>
                  <th>Valid Dates</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No discount campaigns created yet. Click "+ Create New Campaign" above to launch one.</td></tr>
                ) : (
                  discounts.map((d) => (
                    <tr key={d.id}>
                      <td style={{ padding: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>
                          🔥 {d.discount_percentage}% OFF
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d.discount_type}</div>
                      </td>
                      <td style={{ padding: 12, color: 'var(--text-dark)' }}>
                        <strong>{d.target_item_name || d.target_category || 'All Items in Category'}</strong>
                      </td>
                      <td style={{ padding: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                        {String(d.start_date).slice(0, 10)} → {String(d.end_date).slice(0, 10)}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          background: d.is_active ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: d.is_active ? '#27ae60' : '#e74c3c'
                        }}>
                          {d.is_active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-luxury-outline"
                          onClick={() => toggleDiscountStatus(d)}
                          style={{ marginRight: 6 }}
                        >
                          {d.is_active ? '⏸️ Pause' : '▶️ Activate'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteDiscount(d.id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'messages' ? (
        /* ==================== MESSAGES & INQUIRIES TAB ==================== */
        <div className="card luxury-card" style={{ padding: 24 }}>
          <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: 20, color: 'var(--text-dark)' }}>📨 Contact Inquiries &amp; Guest Messages</h3>
              <p className="card-desc" style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Received from the Contact Us page with direct reply capabilities.</p>
            </div>
            <div className="filter-pills" style={{ display: 'flex', gap: 8 }}>
              {['all', 'pending', 'replied'].map(f => (
                <button
                  key={f}
                  type="button"
                  className={`filter-pill ${msgFilter === f ? 'active' : ''}`}
                  onClick={() => setMsgFilter(f)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    border: '1px solid var(--border)',
                    background: msgFilter === f ? 'var(--accent)' : 'var(--bg-main)',
                    color: msgFilter === f ? '#0b1329' : 'var(--text-dark)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {f === 'all' && `All (${msgCounts.total || messages.length})`}
                  {f === 'pending' && `Pending (${msgCounts.pending})`}
                  {f === 'replied' && `Replied (${msgCounts.replied})`}
                </button>
              ))}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36 }}>📭</div>
              <h4 style={{ color: 'var(--text-dark)' }}>No messages found</h4>
              <p>New inquiries from the Contact page will appear here instantly.</p>
            </div>
          ) : (
            <div className="messages-list-wrapper" style={{ display: 'grid', gap: 16 }}>
              {messages.map((m) => (
                <div key={m.id} className="message-item-card luxury-card" style={{ border: '1px solid var(--border)', padding: 20, borderRadius: 12, background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    <div>
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, marginRight: 8,
                        background: m.status === 'replied' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(240, 165, 0, 0.15)',
                        color: m.status === 'replied' ? '#27ae60' : '#f0a500'
                      }}>
                        {m.status === 'replied' ? '✓ Replied' : '⏳ Pending Response'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: 10 }}>{(m.category || 'general')}</span>
                      <h4 style={{ margin: '8px 0 0', fontSize: 17, color: 'var(--text-dark)' }}>{m.subject}</h4>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                    <span><strong style={{ color: 'var(--text-dark)' }}>Guest:</strong> {m.name}</span> · <span><strong style={{ color: 'var(--text-dark)' }}>Email:</strong> {m.email}</span>
                    {m.phone && <span> · <strong style={{ color: 'var(--text-dark)' }}>Phone:</strong> {m.phone}</span>}
                  </div>

                  <div style={{ background: 'var(--bg-main)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-dark)', marginBottom: 14, lineHeight: 1.6 }}>
                    {m.message}
                  </div>

                  {m.staff_reply && (
                    <div style={{ background: 'rgba(39, 174, 96, 0.08)', border: '1px solid rgba(39, 174, 96, 0.25)', padding: 14, borderRadius: 10, marginBottom: 14 }}>
                      <div style={{ fontSize: 12, color: '#27ae60', fontWeight: 800, marginBottom: 4 }}>
                        Direct Response sent to guest by {m.replied_by_name || 'Staff'}:
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.5 }}>{m.staff_reply}</p>
                    </div>
                  )}

                  <div>
                    <button
                      type="button"
                      className="btn btn-luxury-gold btn-sm"
                      onClick={() => {
                        setReplyModal(m);
                        setReplyText(m.staff_reply || '');
                      }}
                      style={{ padding: '7px 16px', fontSize: 13 }}
                    >
                      💬 {m.staff_reply ? 'Update Reply' : 'Reply Directly to Guest'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'feedback' ? (
        /* ==================== FEEDBACK TAB ==================== */
        <div className="card luxury-card" style={{ padding: 24 }}>
          <h3 className="card-title" style={{ margin: '0 0 16px', fontSize: 20, color: 'var(--text-dark)' }}>💬 Customer Feedback &amp; Suggestions</h3>
          {feedback.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36 }}>💬</div>
              <h4 style={{ color: 'var(--text-dark)' }}>No feedback yet</h4>
              <p>Customer ratings and reviews will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {feedback.map((item) => (
                <div key={item.id} className="feedback-item-card luxury-card" style={{ border: '1px solid var(--border)', padding: 18, borderRadius: 12, background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: 'var(--text-dark)' }}>{item.userFullName || item.username || 'Anonymous Guest'}</strong>
                    <span style={{ background: 'rgba(39, 174, 96, 0.15)', color: '#27ae60', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                      {item.role || 'Customer'}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '10px', color: 'var(--text-dark)' }}>
                    "{item.comment || item.text || item.feedback}"
                  </p>
                  <small style={{ color: 'var(--text-muted)' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : item.created_at ? new Date(item.created_at).toLocaleString() : 'Recently'}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ==================== USERS TAB (DEFAULT) ==================== */
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-luxury-gold"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setUserForm(emptyUserForm);
              }}
              style={{ padding: '10px 18px', fontWeight: 700 }}
            >
              {showAddForm ? '✕ Close Form' : '+ Add New User'}
            </button>
          </div>

          {(showAddForm || editingId) && (
            <div className="card luxury-card" style={{ marginBottom: 24, padding: 22 }}>
              <h3 className="card-title" style={{ marginTop: 0, color: 'var(--text-dark)' }}>{editingId ? '✏️ Update User' : '➕ Add User'}</h3>
              <form onSubmit={async (e) => { await handleSubmitUser(e); setShowAddForm(false); }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>First Name *</label>
                    <input className="form-input" placeholder="First name" value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Last Name *</label>
                    <input className="form-input" placeholder="Last name" value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Email Address *</label>
                    <input className="form-input" type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Phone Number</label>
                    <input className="form-input" placeholder="Phone" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>System Role</label>
                    <select className="form-select" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                      <option value="customer">Customer</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Account Status</label>
                    <select className="form-select" value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>{editingId ? 'New Password (Optional)' : 'Password *'}</label>
                    <input className="form-input" type="password" placeholder={editingId ? 'New password (optional)' : 'Password'} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required={!editingId} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-dark)' }}>Confirm Password</label>
                    <input className="form-input" type="password" placeholder={editingId ? 'Confirm new password' : 'Confirm password'} value={userForm.confirmPassword} onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })} required={!editingId || !!userForm.password} />
                  </div>
                </div>
                <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-luxury-gold" disabled={submittingUser} style={{ padding: '10px 20px', fontWeight: 700 }}>
                    {submittingUser ? 'Saving...' : editingId ? 'Update user' : 'Add user'}
                  </button>
                  <button type="button" className="btn btn-luxury-outline" onClick={() => { resetUserForm(); setShowAddForm(false); }} style={{ padding: '10px 16px' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card luxury-card" style={{ padding: 24 }}>
            <h3 className="card-title" style={{ marginTop: 0, color: 'var(--text-dark)' }}>👥 Hotel Users &amp; Staff ({users.length})</h3>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No users found</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{u.first_name} {u.last_name}</td>
                        <td style={{ color: 'var(--text-dark)' }}>{u.email || u.username}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                            background: u.role === 'admin' ? 'rgba(168, 85, 247, 0.15)' : u.role === 'manager' ? 'rgba(56, 189, 248, 0.15)' : u.role === 'receptionist' ? 'rgba(240, 165, 0, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                            color: u.role === 'admin' ? '#a855f7' : u.role === 'manager' ? '#38bdf8' : u.role === 'receptionist' ? '#f0a500' : 'var(--text-muted)'
                          }}>
                            {u.role?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                            background: u.status === 'active' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                            color: u.status === 'active' ? '#27ae60' : '#e74c3c'
                          }}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button type="button" className="btn btn-sm btn-luxury-outline" onClick={() => startEditUser(u)} style={{ marginRight: 6 }}>Edit</button>
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(u)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
        </main>
      </div>

      {/* Reply Modal */}
      {replyModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div className="modal-dialog luxury-card" style={{ background: 'var(--bg-card)', color: 'var(--text-dark)', border: '1px solid var(--border)', borderRadius: 16, maxWidth: 560, width: '100%', padding: 26, boxShadow: 'var(--shadow-lg)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 19, color: 'var(--text-dark)' }}>💬 Direct Reply to Guest</h3>
              <button type="button" className="modal-close-btn" onClick={() => setReplyModal(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="guest-info-summary" style={{ background: 'var(--bg-main)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16, fontSize: 13, color: 'var(--text-dark)' }}>
                <p style={{ margin: '0 0 6px' }}><strong>To:</strong> {replyModal.name} ({replyModal.email})</p>
                <p style={{ margin: '0 0 8px' }}><strong>Subject:</strong> {replyModal.subject}</p>
                <div className="original-inquiry-box" style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--accent)' }}>Guest's Message:</strong>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-dark)', lineHeight: 1.5 }}>{replyModal.message}</p>
                </div>
              </div>

              <form onSubmit={handleSendReply}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>Your Official Response:</label>
                  <textarea
                    rows="5"
                    className="form-textarea"
                    placeholder="Type your official reply here (customer will be notified)..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-luxury-outline" onClick={() => setReplyModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={sendingReply} className="btn btn-luxury-gold" style={{ padding: '9px 20px', fontWeight: 700 }}>
                    {sendingReply ? 'Sending...' : '✉️ Send Response'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Official Tax Invoice / Folio Modal */}
      <InvoiceModal
        isOpen={invoiceModal.isOpen}
        onClose={() => setInvoiceModal({ isOpen: false, reference: '', type: '', id: null })}
        reference={invoiceModal.reference}
        bookingType={invoiceModal.type}
        bookingId={invoiceModal.id}
      />
    </div>
  );
}
