const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Always load backend/.env (works even if process is started from repo root)
dotenv.config({ path: path.join(__dirname, '.env') });

// --- Email / OTP status (shows on every start) ---
(function logSmtpStatus() {
    const user = String(process.env.SMTP_USER || '').trim();
    const pass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
    console.log('────────────────────────────────────────');
    if (user && pass) {
        console.log('✉️  SMTP: configured');
        console.log('   USER:', user);
        console.log('   PASS:', '*'.repeat(Math.min(pass.length, 16)) + ' (' + pass.length + ' chars)');
        console.log('   HOST:', process.env.SMTP_HOST || 'gmail (default)');
    } else {
        console.log('⚠️  SMTP: NOT configured — OTP will NOT be emailed');
        console.log('   Fix: edit backend/.env and set:');
        console.log('   SMTP_USER=your@gmail.com');
        console.log('   SMTP_PASS=your16charapppassword');
        console.log('   (no spaces in SMTP_PASS)');
    }
    try {
        require('nodemailer');
        console.log('   nodemailer: installed');
    } catch (e) {
        console.log('   nodemailer: MISSING → run: npm install nodemailer');
    }
    console.log('────────────────────────────────────────');
})();

const app = express();

// Middleware
app.use(cors({
    origin: true, // allow local React (any port) during development
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (ID card images, payment receipts, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const reservationRoutes = require('./routes/reservations');
const deskRoutes = require('./routes/desks');
const foodRoutes = require('./routes/food');
const commentRoutes = require('./routes/comments');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/reports');
const refundRoutes = require('./routes/refunds');
const managerRoutes = require('./routes/manager');
const accountRoutes = require('./routes/accounts');
const siteContentRoutes = require('./routes/siteContent');
const receptionistRoutes = require('./routes/receptionist');
const contactRoutes = require('./routes/contact');
const chatRoutes = require('./routes/chat');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/desks', deskRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/site', siteContentRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);

// Health check (also verifies the DB is actually reachable)
app.get('/api/health', async (req, res) => {
    try {
        const db = require('./config/db');
        await db.query('SELECT 1');
        res.json({ success: true, message: 'Server is running', database: 'connected' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server is running but database is NOT reachable', error: err.code || err.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏨 Paradise Hotel API Server',
        version: '1.0.0',
        endpoints: {
            register: '/api/auth/register',
            login: '/api/auth/login',
            rooms: '/api/rooms',
            reservations: '/api/reservations',
            desks: '/api/desks',
            food: '/api/food',
            payments: '/api/payments',
            refunds: '/api/refunds',
            chat: '/api/chat',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;

// Auto-release rooms when checkout date is reached and release expired desk reservations (every 60s)
try {
    const { releaseExpiredRooms } = require('./routes/rooms');
    const { releaseExpiredDesks } = require('./routes/desks');
    const runAutoReleases = () => {
        if (typeof releaseExpiredRooms === 'function') {
            releaseExpiredRooms().catch((e) => console.error('auto-release rooms:', e.message));
        }
        if (typeof releaseExpiredDesks === 'function') {
            releaseExpiredDesks().catch((e) => console.error('auto-release desks:', e.message));
        }
    };
    runAutoReleases();
    setInterval(runAutoReleases, 60 * 1000);
} catch (e) {
    console.warn('Room/Desk auto-release scheduler not started:', e.message);
}

// Auto-seed expanded luxury catalog (50 foods, 40 rooms, 30 desks) if catalog is incomplete
(async function verifyAndSeedCatalog() {
    try {
        const db = require('./config/db');
        const [r] = await db.query('SELECT COUNT(*) as c FROM rooms');
        const [d] = await db.query('SELECT COUNT(*) as c FROM desks');
        const [f] = await db.query('SELECT COUNT(*) as c FROM food_menu');
        if ((r[0]?.c || 0) < 30 || (d[0]?.c || 0) < 20 || (f[0]?.c || 0) < 30) {
            console.log('📦 Catalog incomplete, auto-seeding 50 foods, 40 rooms, 30 desks...');
            const { seedExpanded } = require('../seed_expanded_luxury_items');
            await seedExpanded(db);
        } else {
            console.log(`✨ Luxury Catalog verified: ${r[0]?.c} rooms, ${d[0]?.c} desks, ${f[0]?.c} foods`);
        }
    } catch (e) {
        console.warn('Catalog verification notice:', e.message);
    }
})();

app.listen(PORT, () => {
    const _smtpOk = !!(process.env.SMTP_USER && String(process.env.SMTP_PASS || '').replace(/\s+/g, ''));
    console.log(_smtpOk
        ? `✉️  SMTP email ready (user: ${process.env.SMTP_USER})`
        : '⚠️  SMTP not configured — OTP will only print in this console. Set SMTP_USER and SMTP_PASS in backend/.env');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});