import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { LanguageContext } from '../../context/LanguageContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import LuxuryHorizontalScroll from '../Common/LuxuryHorizontalScroll';
import { SkeletonGrid } from '../Common/SkeletonLoader';
import api from '../../api';
import toast from 'react-hot-toast';

const resolveMediaUrl = (src, folder = 'foods') => {
  const fallbacks = {
    rooms: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    desks: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    foods: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
  };
  const def = fallbacks[folder] || fallbacks.foods;
  if (!src) return def;
  let p = String(src).trim().replace(/\\/g, '/');
  if (!p || p === 'undefined' || p === 'null') return def;
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  if (p.startsWith('/uploads/')) return p;
  if (p.startsWith('uploads/')) return '/' + p;
  const file = p.replace(/^.*\//, '');
  return '/uploads/' + folder + '/' + file;
};

// Chunk array into max 10 items per horizontal slider
const chunkArray = (arr, size = 10) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const FOOD_SHELF_META = [
  {
    title: 'Traditional Ethiopian Signatures & Royal Specials',
    icon: '👑',
    desc: 'Slow-simmered Doro Wat, Special Sizzling Tibs, Kitfo Na Ayib, Beyaynetu, and Shiro Tegabino',
    tag: 'Traditional Ethiopian'
  },
  {
    title: 'Gourmet Steaks, International Entrees & Pasta',
    icon: '🥩',
    desc: 'Prime Beef Fillet Mignon, Grilled Ribeye, Atlantic Salmon, Truffle Tagliatelle, & Classics',
    tag: 'International Gourmet'
  },
  {
    title: 'Morning Breakfast & Artisan Bakery Delights',
    icon: '🥐',
    desc: 'Golden Pancakes, Shakshuka, Eggs Benedict, Fresh Waffles, Croissants & Debre Markos Chechebsa',
    tag: 'Breakfast & Bakery'
  },
  {
    title: 'Chilled Soft Drinks, Sparkling Sodas & Fresh Juices',
    icon: '🍹',
    desc: 'Signature Layered Spris, Pure Mango, Avocado Smoothies, San Pellegrino & Chilled Sodas',
    tag: 'Beverages & Soft Drinks'
  },
  {
    title: 'Grand Reserve Fine Wines, Beers & Crafted Cocktails',
    icon: '🍷',
    desc: 'Axumite Reserve, Rift Valley Merlot, St. George Draught, Signature Mojitos & Aged Whiskey',
    tag: 'Fine Wines & Spirits'
  },
  {
    title: 'Executive Chef Specialties & Seasonal Creations',
    icon: '🌟',
    desc: 'Handcrafted appetizers, side dishes, and master chef seasonal recommendations',
    tag: 'Executive Reserve'
  }
];

export default function OrderFood() {
  const { user } = useContext(AuthContext);
  const { formatPrice } = useContext(CurrencyContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All', 'Breakfast', 'Main Course', 'Vegetarian', 'Beverage', 'Dessert', 'International']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [userDesks, setUserDesks] = useState([]);
  const [selectedDeskId, setSelectedDeskId] = useState('');
  const [orderType, setOrderType] = useState('takeaway'); // 'room' | 'desk' | 'takeaway'
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [requiredTime, setRequiredTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);

  const minDateTimeLocal = () => {
    const n = new Date();
    n.setMinutes(n.getMinutes() - n.getTimezoneOffset());
    return n.toISOString().slice(0, 16);
  };

  useEffect(() => {
    (async () => {
      setMenuLoading(true);
      try {
        let res;
        try { res = await api.get('/food'); }
        catch (_) { res = await api.get('/food/menu'); }
        const items = res.data.menuItems || res.data.items || res.data.foods || (Array.isArray(res.data) ? res.data : []);
        setMenuItems(Array.isArray(items) ? items : []);
        if (Array.isArray(items) && items.length > 0) {
          const cats = ['All', ...Array.from(new Set(items.map(i => i.category || 'Other').filter(Boolean)))];
          setCategories(cats);
        }
      } catch (err) {
        toast.error('Could not load food menu. Ensure backend is running.');
        setMenuItems([]);
      } finally {
        setMenuLoading(false);
      }
    })();

    if (user) {
      api.get('/desks/my')
        .then((res) => {
          const list = res.data.reservations || [];
          setUserDesks(list.filter(d => d.status !== 'cancelled' && d.status !== 'rejected'));
        })
        .catch(console.error);
    }

    const params = new URLSearchParams(location.search);
    const deskResId = params.get('deskReservationId');
    if (deskResId) {
      setOrderType('desk');
      setSelectedDeskId(deskResId);
    }
  }, [user, location.search]);

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hay = `${item.item_name || item.name || ''} ${item.category || ''} ${item.description || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const addToCart = (item) => {
    if (!user) {
      toast.error('Please log in before ordering food.');
      navigate('/login');
      return;
    }
    setCart((prev) => {
      const existing = prev.find(i => i.menuId === item.id);
      if (existing) {
        return prev.map(i => i.menuId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        const unit = Number(item.discounted_price != null ? item.discounted_price : item.price);
        return [...prev, {
          menuId: item.id,
          name: item.item_name || item.name,
          price: unit,
          quantity: 1,
          has_discount: !!item.has_discount,
          original_price: item.original_price != null ? item.original_price : item.price
        }];
      }
    });
    toast.success(`Added ${item.item_name || item.name} to cart`);
    setTimeout(() => {
      const cartEl = document.getElementById('food-cart-section');
      if (cartEl) {
        cartEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const updateQuantity = (menuId, delta) => {
    setCart((prev) => {
      return prev.map(i => {
        if (i.menuId === menuId) {
          const q = i.quantity + delta;
          return q > 0 ? { ...i, quantity: q } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to place an order.');
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your dining cart is empty.');
      return;
    }
    if (orderType === 'desk' && !selectedDeskId) {
      toast.error('Please select which reserved table to deliver to.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/food/order', {
        items: cart.map(i => ({ menuId: i.menuId, quantity: i.quantity })),
        requiredTime: requiredTime || null,
        orderType,
        referenceId: orderType === 'desk' ? selectedDeskId : null,
        specialInstructions: specialInstructions || null,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Food order placed! Redirecting to payment...');
        navigate(`/payment?type=food&id=${res.data.order.id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error placing food order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inside luxury-page-container">
      {/* 5-Star Header Box */}
      <div className="luxury-header-box">
        <div className="luxury-badge">🍕 5-STAR GOURMET DINING &amp; BANQUET</div>
        <h1 className="page-title">Order Delicious Food &amp; Beverages</h1>
        <p className="page-subtitle">
          Savor authentic Ethiopian culinary masterpieces, traditional Jebena coffee, dry-aged steaks, wood-fired artisan pizza, and fresh beverages.
        </p>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="luxury-section-panel" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Categories */}
          <div className="luxury-food-category-bar" style={{ marginBottom: 0, paddingBottom: 0, flex: '1 1 auto', minWidth: 0 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`luxury-food-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="search"
            placeholder="Search dish, beverage, ingredients…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="clean-input"
            style={{ flex: '0 1 280px', minWidth: 200, padding: '9px 14px' }}
          />
        </div>
      </div>

      {/* 2. Full-Width Gourmet Dishes Horizontal Carousel Shelves (Max 10 Items Per Shelf) */}
      <div className="luxury-section-panel" style={{ padding: '24px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
          <h2 className="luxury-panel-title" style={{ margin: 0 }}>
            <span>🍕</span> Gourmet Menu Collections
          </h2>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
            ← Swipe or scroll horizontally (Max 10 items per shelf) →
          </span>
        </div>
        <p className="luxury-panel-desc">
          Browse our master chef creations arranged into dedicated horizontal movable shelves with <strong>at most 10 items per slider</strong>. Click <strong>"+ Add to Cart"</strong> to select your dishes.
        </p>

        {menuLoading ? (
          <div style={{ padding: '16px 0' }}>
            <SkeletonGrid count={4} height={280} columns="repeat(auto-fill, minmax(260px, 1fr))" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No culinary dishes found matching your criteria.
          </div>
        ) : (
          <div className="luxury-food-shelves" style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 14 }}>
            {chunkArray(filteredItems, 10).map((chunk, shelfIdx) => {
              const meta = FOOD_SHELF_META[shelfIdx] || {
                title: `Curated Culinary Reserve (Collection ${shelfIdx + 1})`,
                icon: '🍽️',
                desc: `Specialty dishes and chef creations (Items ${shelfIdx * 10 + 1}–${shelfIdx * 10 + chunk.length})`,
                tag: `Collection ${shelfIdx + 1}`
              };

              return (
                <div
                  key={`food-shelf-${shelfIdx}`}
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
                        {chunk.length} / 10 Items
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        ← Scroll 10 items →
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Scroll containing exactly at most 10 items */}
                  <LuxuryHorizontalScroll itemWidth={310} stepScroll={330}>
                    {chunk.map((item) => {
                      const img = resolveMediaUrl(item.image, 'foods');
                      const isInCart = cart.some(ci => ci.menuId === item.id);
                      const cartQty = cart.find(ci => ci.menuId === item.id)?.quantity || 0;
                      return (
                        <div
                          key={item.id}
                          className={`luxury-hscroll-card ${isInCart ? 'selected' : ''}`}
                          onClick={() => addToCart(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="food-card-img-wrap" style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                            <img
                              src={img}
                              alt={item.item_name || item.name}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <span className="food-card-cat-badge">{item.category || 'Specialty'}</span>
                            {item.has_discount && (
                              <span className="food-card-discount-badge">{item.discount_percent || 15}% OFF</span>
                            )}
                            <span style={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              background: 'rgba(11, 19, 41, 0.82)',
                              color: '#ffffff',
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 12,
                              fontWeight: 600,
                              backdropFilter: 'blur(4px)'
                            }}>
                              ⏱️ {item.preparation_time || 15}m
                            </span>
                            {isInCart && (
                              <span style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                background: '#27ae60',
                                color: '#ffffff',
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: 20,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                              }}>
                                ✓ {cartQty} in Cart
                              </span>
                            )}
                          </div>

                          <div className="food-card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                              <h3 className="food-card-title" style={{ fontSize: 16, margin: 0, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                                {item.item_name || item.name}
                              </h3>
                              <span style={{ fontSize: 12, color: '#f0a500', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                ★ 4.9
                              </span>
                            </div>

                            <p className="food-card-desc" style={{
                              fontSize: 13,
                              color: 'var(--text-muted)',
                              lineHeight: 1.4,
                              marginBottom: 14,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {item.description || 'Prepared fresh by our master culinary chefs with authentic Ethiopian spices and ingredients.'}
                            </p>

                            <div className="food-card-footer" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
                              <div className="food-card-price" style={{ display: 'flex', flexDirection: 'column' }}>
                                {item.has_discount ? (
                                  <>
                                    <span className="food-price-main" style={{ fontSize: 17, fontWeight: 800, color: 'var(--accent)' }}>
                                      {formatPrice(item.discounted_price || item.price)}
                                    </span>
                                    <span className="food-price-orig" style={{ fontSize: 12, textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                                      {formatPrice(item.original_price || item.price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="food-price-main" style={{ fontSize: 17, fontWeight: 800, color: 'var(--accent)' }}>
                                    {formatPrice(item.price)}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                className="food-add-cart-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: 12,
                                  borderRadius: 20,
                                  background: isInCart ? 'linear-gradient(135deg, #27ae60 0%, #219150 100%)' : 'var(--accent-gradient, linear-gradient(135deg, #f0a500 0%, #d4920a 100%))',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <span>{isInCart ? '✓ Add More' : '+ Add to Cart'}</span>
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

      {/* 3. Bottom Dining Order & Checkout Form (Spacious, Luxury, Full Width) */}
      <div id="food-cart-section" className="luxury-section-panel" style={{ scrollMarginTop: 90, marginTop: 28, padding: '30px 28px' }}>
        {/* Header with Cart Summary Badge */}
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
              🍽️
            </span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                Debre Markos · 5-Star Gourmet Dining · 24/7 Service
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, margin: '2px 0 0', color: 'var(--text-dark)' }}>
                Your Dining Order &amp; Checkout
              </h2>
            </div>
          </div>

          {/* Active Cart Counter Badge */}
          <div style={{
            background: cart.length > 0 ? 'rgba(39, 174, 96, 0.1)' : 'rgba(212, 175, 55, 0.1)',
            border: `1.5px solid ${cart.length > 0 ? '#27ae60' : 'var(--accent)'}`,
            borderRadius: 14,
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div>
              <div style={{ fontSize: 11, color: cart.length > 0 ? '#27ae60' : 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                {cart.length > 0 ? '✓ Items In Basket' : '🛒 Basket Empty'}
              </div>
              <strong style={{ fontSize: 15, color: 'var(--text-dark)' }}>
                {cartItemsCount} {cartItemsCount === 1 ? 'Dish' : 'Dishes'} Selected
              </strong>
            </div>
            {cart.length > 0 && (
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', marginLeft: 8 }}>
                {formatPrice(cartTotal)}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          {/* Row 1: Destination Selector */}
          <div style={{ marginBottom: 20 }}>
            <label className="clean-label">Dining Destination <span className="req">*</span></label>
            <div className="cart-dest-selector" style={{ maxWidth: 460 }}>
              <button
                type="button"
                className={`cart-dest-btn ${orderType === 'desk' ? 'active' : ''}`}
                onClick={() => setOrderType('desk')}
              >
                🍽️ At Table
              </button>
              <button
                type="button"
                className={`cart-dest-btn ${orderType === 'room' ? 'active' : ''}`}
                onClick={() => setOrderType('room')}
              >
                🛏️ In-Room
              </button>
              <button
                type="button"
                className={`cart-dest-btn ${orderType === 'takeaway' ? 'active' : ''}`}
                onClick={() => setOrderType('takeaway')}
              >
                🛍️ Takeaway
              </button>
            </div>

            {orderType === 'desk' && (
              <div style={{ marginTop: 10, maxWidth: 500 }}>
                {userDesks.length > 0 ? (
                  <select
                    className="clean-input"
                    value={selectedDeskId}
                    onChange={(e) => setSelectedDeskId(e.target.value)}
                    required
                  >
                    <option value="">Select your reserved table…</option>
                    {userDesks.map((d) => (
                      <option key={d.id} value={d.id}>
                        Desk #{d.desk_number} ({d.date} · {d.start_time} - {d.end_time})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                    💡 Tip: You don't have an active desk reservation yet. You can reserve one on the Desks page or write your table number in chef instructions!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 2: Cart Items List */}
          <div style={{ marginBottom: 20 }}>
            <label className="clean-label">Selected Dishes &amp; Beverages ({cartItemsCount})</label>
            <div style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '14px 16px',
              maxHeight: 280,
              overflowY: 'auto'
            }}>
              {cart.map((item) => (
                <div key={item.menuId} className="cart-item-row" style={{ marginBottom: 8, padding: '10px 14px' }}>
                  <div className="cart-item-info">
                    <div className="cart-item-title" style={{ fontSize: 14.5 }}>{item.name}</div>
                    <div className="cart-item-unit-price" style={{ fontSize: 12 }}>{formatPrice(item.price)} each</div>
                  </div>

                  <div className="cart-item-stepper">
                    <button
                      type="button"
                      className="cart-step-btn"
                      onClick={() => updateQuantity(item.menuId, -1)}
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="cart-qty-val" style={{ minWidth: 24, fontSize: 14 }}>{item.quantity}</span>
                    <button
                      type="button"
                      className="cart-step-btn"
                      onClick={() => updateQuantity(item.menuId, 1)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div style={{ marginLeft: 16, fontSize: 14.5, fontWeight: 800, color: 'var(--accent)', minWidth: 80, textAlign: 'right' }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 14px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
                  <strong style={{ display: 'block', fontSize: 15, color: 'var(--text-dark)', marginBottom: 4 }}>Your culinary basket is empty</strong>
                  Select dishes and beverages from the carousel above to begin your order!
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Preferred Serving Time & Chef Notes in 2 columns */}
          <div className="clean-grid-2" style={{ marginBottom: 20 }}>
            <div className="form-group-clean">
              <label className="clean-label">Preferred Serving Time (Optional)</label>
              <input
                type="datetime-local"
                min={minDateTimeLocal()}
                className="clean-input"
                value={requiredTime}
                onChange={(e) => setRequiredTime(e.target.value)}
              />
            </div>

            <div className="form-group-clean">
              <label className="clean-label">Chef Instructions / Dietary Notes</label>
              <textarea
                className="clean-input"
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Mild spice, dressing on the side, extra ice, allergies…"
              />
            </div>
          </div>

          {/* Row 4: Pricing Breakdown & Submit Bar (Matching ReserveDesk) */}
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
                  Subtotal
                </div>
                <strong style={{ fontSize: 16, color: 'var(--text-dark)' }}>
                  {formatPrice(cartTotal)}
                </strong>
              </div>

              <div style={{ height: 32, width: 1, background: 'var(--border)' }} />

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Service &amp; Delivery
                </div>
                <strong style={{ fontSize: 16, color: '#27ae60' }}>
                  Complimentary (Free)
                </strong>
              </div>

              <div style={{ height: 32, width: 1, background: 'var(--border)' }} />

              <div>
                <div style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total to Pay
                </div>
                <strong style={{ fontSize: 22, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                  {formatPrice(cartTotal)}
                </strong>
              </div>
            </div>

            <button
              type="submit"
              className="auth-gold-submit-btn"
              disabled={loading || cart.length === 0}
              style={{ width: 'auto', minWidth: 260, padding: '14px 28px', margin: 0, fontSize: 15 }}
            >
              {loading ? 'Submitting Order…' : '🍕 Place Gourmet Order & Pay ➔'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
