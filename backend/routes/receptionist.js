const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

async function ensureSeenColumns() {
    const alters = [
        "ALTER TABLE payments ADD COLUMN receptionist_seen TINYINT(1) NOT NULL DEFAULT 0",
        "ALTER TABLE room_reservations ADD COLUMN receptionist_seen TINYINT(1) NOT NULL DEFAULT 0",
        "ALTER TABLE desk_reservations ADD COLUMN receptionist_seen TINYINT(1) NOT NULL DEFAULT 0",
        "ALTER TABLE food_orders ADD COLUMN receptionist_seen TINYINT(1) NOT NULL DEFAULT 0",
    ];
    for (const sql of alters) {
        try { await db.execute(sql); } catch (_) { }
    }
}

let columnsReady = false;
async function ready() {
    if (!columnsReady) {
        await ensureSeenColumns();
        columnsReady = true;
    }
}

async function countUnseen(table) {
    try {
        const [rows] = await db.execute(
            `SELECT COUNT(*) AS c FROM ${table} WHERE IFNULL(receptionist_seen, 0) = 0`
        );
        return Number(rows[0]?.c || 0);
    } catch (e) {
        console.warn('countUnseen', table, e.message);
        return 0;
    }
}

/**
 * GET /api/receptionist/unread
 * Counts unseen payments, room reservations, desk reservations, food orders
 */
router.get('/unread', auth, authorize('receptionist', 'admin', 'manager'), async (req, res) => {
    try {
        await ready();
        const [payments, rooms, desks, food] = await Promise.all([
            countUnseen('payments'),
            countUnseen('room_reservations'),
            countUnseen('desk_reservations'),
            countUnseen('food_orders'),
        ]);
        const reservations = rooms + desks;
        const total = payments + rooms + desks + food;
        res.json({
            success: true,
            unread: {
                payments,
                rooms,
                desks,
                reservations,
                food,
                orders: food,
                total,
            },
        });
    } catch (error) {
        console.error('GET /receptionist/unread:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/receptionist/mark-seen
 * body: { type: 'payments' | 'rooms' | 'desks' | 'food' | 'reservations' | 'all', ids?: number[] }
 */
router.post('/mark-seen', auth, authorize('receptionist', 'admin', 'manager'), async (req, res) => {
    try {
        await ready();
        const type = String(req.body.type || 'all').toLowerCase();
        const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : null;

        const mark = async (table) => {
            if (ids && ids.length) {
                const placeholders = ids.map(() => '?').join(',');
                await db.execute(
                    `UPDATE ${table} SET receptionist_seen = 1 WHERE id IN (${placeholders})`,
                    ids
                );
            } else {
                await db.execute(`UPDATE ${table} SET receptionist_seen = 1 WHERE IFNULL(receptionist_seen, 0) = 0`);
            }
        };

        if (type === 'payments' || type === 'all') await mark('payments');
        if (type === 'rooms' || type === 'reservations' || type === 'all') await mark('room_reservations');
        if (type === 'desks' || type === 'reservations' || type === 'all') await mark('desk_reservations');
        if (type === 'food' || type === 'orders' || type === 'all') await mark('food_orders');

        const [payments, rooms, desks, food] = await Promise.all([
            countUnseen('payments'),
            countUnseen('room_reservations'),
            countUnseen('desk_reservations'),
            countUnseen('food_orders'),
        ]);
        res.json({
            success: true,
            message: 'Marked as seen',
            unread: {
                payments,
                rooms,
                desks,
                reservations: rooms + desks,
                food,
                orders: food,
                total: payments + rooms + desks + food,
            },
        });
    } catch (error) {
        console.error('POST /receptionist/mark-seen:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/receptionist/unread-items
 * Recent unseen rows for the Unread panel
 */
router.get('/unread-items', auth, authorize('receptionist', 'admin', 'manager'), async (req, res) => {
    try {
        await ready();
        const [payments] = await db.execute(
            `SELECT p.id, p.amount, p.status, p.payment_method, p.transaction_date, p.reservation_type,
                    COALESCE(c.first_name, u.first_name) AS first_name,
                    COALESCE(c.last_name, u.last_name) AS last_name
             FROM payments p
             LEFT JOIN customers c ON p.customer_id = c.id
             LEFT JOIN users u ON c.user_id = u.id
             WHERE IFNULL(p.receptionist_seen, 0) = 0
             ORDER BY p.id DESC LIMIT 50`
        ).catch(() => [[]]);
        const [rooms] = await db.execute(
            `SELECT r.id, r.status, r.check_in_date, r.check_out_date, r.total_price,
                    COALESCE(c.first_name, u.first_name) AS first_name,
                    COALESCE(c.last_name, u.last_name) AS last_name,
                    rm.room_number
             FROM room_reservations r
             LEFT JOIN customers c ON r.customer_id = c.id
             LEFT JOIN users u ON c.user_id = u.id
             LEFT JOIN rooms rm ON r.room_id = rm.id
             WHERE IFNULL(r.receptionist_seen, 0) = 0
             ORDER BY r.id DESC LIMIT 50`
        ).catch(() => [[]]);
        const [desks] = await db.execute(
            `SELECT d.id, d.status, d.reservation_date, d.start_time, d.end_time,
                    COALESCE(c.first_name, u.first_name) AS first_name,
                    COALESCE(c.last_name, u.last_name) AS last_name,
                    dk.desk_number
             FROM desk_reservations d
             LEFT JOIN customers c ON d.customer_id = c.id
             LEFT JOIN users u ON c.user_id = u.id
             LEFT JOIN desks dk ON d.desk_id = dk.id
             WHERE IFNULL(d.receptionist_seen, 0) = 0
             ORDER BY d.id DESC LIMIT 50`
        ).catch(() => [[]]);
        const [food] = await db.execute(
            `SELECT o.id, o.status, o.total_amount, o.order_date,
                    COALESCE(c.first_name, u.first_name) AS first_name,
                    COALESCE(c.last_name, u.last_name) AS last_name
             FROM food_orders o
             LEFT JOIN customers c ON o.customer_id = c.id
             LEFT JOIN users u ON c.user_id = u.id
             WHERE IFNULL(o.receptionist_seen, 0) = 0
             ORDER BY o.id DESC LIMIT 50`
        ).catch(() => [[]]);

        res.json({
            success: true,
            payments: payments || [],
            rooms: rooms || [],
            desks: desks || [],
            food: food || [],
        });
    } catch (error) {
        console.error('GET /receptionist/unread-items:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/receptionist/shift-summary
 * Daily Front Desk Shift & Cashier Till Reconciliation
 */
router.get('/shift-summary', auth, authorize('receptionist', 'admin', 'manager'), async (req, res) => {
    try {
        // Query today's payments grouped by payment method
        const [paymentRows] = await db.execute(
            `SELECT
                payment_method,
                COUNT(*) as tx_count,
                SUM(amount) as total_amount
             FROM payments
             WHERE DATE(transaction_date) = CURDATE()
               AND status IN ('approved', 'completed')
             GROUP BY payment_method`
        );

        // Daily room statistics
        const [roomStats] = await db.execute(
            `SELECT
                COUNT(CASE WHEN DATE(check_in_date) = CURDATE() THEN 1 END) as today_checkins,
                COUNT(CASE WHEN DATE(check_out_date) = CURDATE() THEN 1 END) as today_checkouts,
                COUNT(CASE WHEN status = 'checked_in' THEN 1 END) as in_house_guests,
                COUNT(CASE WHEN status = 'approved' AND DATE(check_in_date) >= CURDATE() THEN 1 END) as upcoming_arrivals
             FROM room_reservations`
        );

        let cashTotal = 0;
        let telebirrTotal = 0;
        let cbeTotal = 0;
        let cardTotal = 0;
        let bankTransferTotal = 0;
        let grandTotal = 0;

        for (const row of paymentRows) {
            const method = String(row.payment_method || '').toLowerCase();
            const amt = Number(row.total_amount || 0);
            grandTotal += amt;
            if (method.includes('cash') || method.includes('pay_at_hotel') || method.includes('arrival')) {
                cashTotal += amt;
            } else if (method.includes('telebirr')) {
                telebirrTotal += amt;
            } else if (method.includes('cbe')) {
                cbeTotal += amt;
            } else if (method.includes('card') || method.includes('pos')) {
                cardTotal += amt;
            } else {
                bankTransferTotal += amt;
            }
        }

        res.json({
            success: true,
            summary: {
                date: new Date().toISOString().split('T')[0],
                cashier: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.username,
                cashInDrawer: cashTotal,
                telebirrCollected: telebirrTotal,
                cbeCollected: cbeTotal,
                cardPosCollected: cardTotal,
                bankTransferCollected: bankTransferTotal,
                grandTotalCollected: grandTotal,
                operations: roomStats[0] || {}
            }
        });
    } catch (error) {
        console.error('GET /receptionist/shift-summary:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/receptionist/housekeeping
 * List all rooms with housekeeping status, active guest details, and summary stats
 */
router.get('/housekeeping', auth, authorize('receptionist', 'admin', 'manager', 'housekeeping'), async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT 
                r.id,
                r.room_number,
                r.room_type,
                r.status AS room_status,
                COALESCE(r.housekeeping_status, 'clean') AS housekeeping_status,
                r.housekeeper_notes,
                r.last_cleaned_at,
                r.price_per_night,
                r.capacity,
                -- Active guest info if currently occupied
                rr.guest_name,
                rr.guest_phone,
                rr.check_in_date,
                rr.check_out_date,
                rr.status AS reservation_status
            FROM rooms r
            LEFT JOIN room_reservations rr ON rr.room_id = r.id 
                AND rr.status IN ('approved', 'checked_in')
                AND CURDATE() BETWEEN DATE(rr.check_in_date) AND DATE(rr.check_out_date)
            ORDER BY CAST(r.room_number AS UNSIGNED) ASC, r.room_number ASC
        `);

        // Calculate summary counts
        const stats = {
            total: rooms.length,
            clean: rooms.filter(r => r.housekeeping_status === 'clean').length,
            dirty: rooms.filter(r => r.housekeeping_status === 'dirty').length,
            cleaning: rooms.filter(r => r.housekeeping_status === 'cleaning').length,
            inspecting: rooms.filter(r => r.housekeeping_status === 'inspecting').length,
            maintenance: rooms.filter(r => r.housekeeping_status === 'maintenance' || r.room_status === 'maintenance').length,
            occupied: rooms.filter(r => r.room_status === 'booked' || r.reservation_status === 'checked_in').length,
        };

        res.json({
            success: true,
            stats,
            rooms
        });
    } catch (error) {
        console.error('GET /receptionist/housekeeping:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/receptionist/rooms/:id/housekeeping
 * Update room status / housekeeping condition
 */
router.post('/rooms/:id/housekeeping', auth, authorize('receptionist', 'admin', 'manager', 'housekeeping'), async (req, res) => {
    try {
        const { id } = req.params;
        const { housekeepingStatus, notes, roomStatus } = req.body;
        const validHK = ['clean', 'dirty', 'cleaning', 'inspecting', 'maintenance'];
        const targetHK = validHK.includes(housekeepingStatus) ? housekeepingStatus : 'clean';

        let query = 'UPDATE rooms SET housekeeping_status = ?, housekeeper_notes = COALESCE(?, housekeeper_notes)';
        let params = [targetHK, notes !== undefined ? notes : null];

        if (targetHK === 'clean') {
            query += ', last_cleaned_at = NOW()';
        }

        if (roomStatus && ['available', 'booked', 'reserved', 'pending', 'maintenance'].includes(roomStatus)) {
            query += ', status = ?';
            params.push(roomStatus);
        } else if (targetHK === 'maintenance') {
            query += ', status = "maintenance"';
        } else if (targetHK === 'clean') {
            // Restore from maintenance to available if room is currently maintenance
            query += ', status = CASE WHEN status = "maintenance" THEN "available" ELSE status END';
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.execute(query, params);

        res.json({
            success: true,
            message: `Room #${id} housekeeping status updated to "${targetHK}"`,
            housekeepingStatus: targetHK
        });
    } catch (error) {
        console.error('POST /receptionist/rooms/:id/housekeeping:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
