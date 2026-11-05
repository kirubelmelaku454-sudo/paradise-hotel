const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

function normalizeRoomImage(row) {
    if (!row) return row;
    let img = row.image;
    if (!img) return row;
    img = String(img).replace(/\\/g, '/').trim();
    if (img.startsWith('http') || img.startsWith('/uploads/')) {
        row.image = img;
    } else if (img.startsWith('uploads/')) {
        row.image = '/' + img;
    } else {
        row.image = '/uploads/rooms/' + img.replace(/^.*\//, '');
    }
    return row;
}


/**
 * When checkout DATE is reached (check_out_date <= today):
 *  1) reservation → checked_out
 *  2) room.status → available (if no other active paid stay)
 * Runs on every rooms API call and via server interval.
 */
async function rejectUnpaidRoomReservations() {
    try {
        await db.execute(
            `UPDATE room_reservations
             SET status = 'rejected',
                 rejection_reason = COALESCE(rejection_reason, 'Payment not completed — reservation rejected')
             WHERE status IN ('pending', 'awaiting_payment')
               AND (payment_status IS NULL OR payment_status IN ('pending', 'unpaid', 'failed'))
               AND reservation_date < (NOW() - INTERVAL 20 MINUTE)`
        );
        await db.execute(
            `UPDATE room_reservations
             SET status = 'rejected',
                 rejection_reason = COALESCE(rejection_reason, 'Payment failed — reservation rejected')
             WHERE status IN ('pending', 'awaiting_payment')
               AND payment_status = 'failed'`
        );
    } catch (e) {
        console.error('rejectUnpaidRoomReservations:', e.message);
    }
}

async function releaseExpiredRooms() {
    try {
        await rejectUnpaidRoomReservations();

        // 1. Checkout date reached → mark stay finished
        await db.execute(
            `UPDATE room_reservations
             SET status = 'checked_out'
             WHERE status IN ('pending', 'approved', 'checked_in')
               AND DATE(check_out_date) <= CURDATE()`
        );

        // 2. Mark rooms with active stay today as 'booked'
        try {
            await db.execute(
                `UPDATE rooms r
                 SET r.status = 'booked'
                 WHERE COALESCE(r.status, '') <> 'maintenance'
                   AND EXISTS (
                     SELECT 1 FROM room_reservations rr
                     WHERE rr.room_id = r.id
                       AND rr.status NOT IN ('cancelled', 'rejected', 'checked_out')
                       AND (
                         (rr.status IN ('approved', 'checked_in') AND rr.payment_status = 'paid')
                         OR
                         (rr.status IN ('pending', 'awaiting_payment') AND rr.reservation_date >= (NOW() - INTERVAL 20 MINUTE))
                       )
                       AND DATE(rr.check_in_date) <= CURDATE()
                       AND DATE(rr.check_out_date) > CURDATE()
                   )`
            );
        } catch (e1) {
            console.error('mark active room status:', e1.message);
        }

        // 3. Any room with NO active stay today → available
        try {
            await db.execute(
                `UPDATE rooms r
                 SET r.status = 'available'
                 WHERE COALESCE(r.status, 'available') IN ('booked', 'reserved')
                   AND COALESCE(r.status, '') <> 'maintenance'
                   AND NOT EXISTS (
                     SELECT 1 FROM room_reservations rr
                     WHERE rr.room_id = r.id
                       AND rr.status NOT IN ('cancelled', 'rejected', 'checked_out')
                       AND (
                         (rr.status IN ('approved', 'checked_in') AND rr.payment_status = 'paid')
                         OR
                         (rr.status IN ('pending', 'awaiting_payment') AND rr.reservation_date >= (NOW() - INTERVAL 20 MINUTE))
                       )
                       AND DATE(rr.check_in_date) <= CURDATE()
                       AND DATE(rr.check_out_date) > CURDATE()
                   )`
            );
        } catch (e2) {
            console.error('free room status:', e2.message);
        }
    } catch (e) {
        console.error('releaseExpiredRooms:', e.message);
    }
}

// Decorate room with availability and checkout details while keeping ALL rooms visible
function decorateRoomAvailability(room, activeReservations, checkIn, checkOut) {
    const isMaintenance = room.status === 'maintenance';
    let overlapping = null;

    if (checkIn && checkOut) {
        overlapping = activeReservations.find(rr => {
            if (Number(rr.room_id) !== Number(room.id)) return false;
            const rIn = new Date(rr.check_in_date).toISOString().slice(0, 10);
            const rOut = new Date(rr.check_out_date).toISOString().slice(0, 10);
            return rIn < checkOut && rOut > checkIn;
        });
    } else {
        const todayStr = new Date().toISOString().slice(0, 10);
        overlapping = activeReservations.find(rr => {
            if (Number(rr.room_id) !== Number(room.id)) return false;
            const rIn = new Date(rr.check_in_date).toISOString().slice(0, 10);
            const rOut = new Date(rr.check_out_date).toISOString().slice(0, 10);
            return rIn <= todayStr && rOut > todayStr;
        });
        if (!overlapping && (room.status === 'booked' || room.status === 'reserved')) {
            overlapping = activeReservations.find(rr => Number(rr.room_id) === Number(room.id));
        }
    }

    const isAvailable = !isMaintenance && !overlapping;
    const norm = normalizeRoomImage({ ...room });
    norm.is_available = isAvailable;
    norm.status = isMaintenance ? 'maintenance' : (!isAvailable ? 'booked' : 'available');

    if (overlapping) {
        const outDateStr = new Date(overlapping.check_out_date).toISOString().slice(0, 10);
        norm.occupied_until = outDateStr;
        norm.current_reservation = {
            id: overlapping.id,
            check_in_date: new Date(overlapping.check_in_date).toISOString().slice(0, 10),
            check_out_date: outDateStr,
            status: overlapping.status
        };
    } else {
        norm.occupied_until = null;
        norm.current_reservation = null;
    }
    return norm;
}

// Export for server.js interval
router.releaseExpiredRooms = releaseExpiredRooms;

router.get('/', async (req, res) => {
    try {
        await releaseExpiredRooms();
        const [rooms] = await db.execute('SELECT * FROM rooms ORDER BY id DESC, room_number ASC');
        const [activeReservations] = await db.execute(
            `SELECT id, room_id, check_in_date, check_out_date, status, payment_status, guest_name
             FROM room_reservations
             WHERE status NOT IN ('cancelled', 'rejected', 'checked_out')
               AND (
                 (status IN ('approved', 'checked_in') AND payment_status = 'paid')
                 OR
                 (status IN ('pending', 'awaiting_payment') AND reservation_date >= (NOW() - INTERVAL 20 MINUTE))
               )
               AND DATE(check_out_date) > CURDATE()
             ORDER BY check_in_date ASC`
        );
        res.json({
            success: true,
            rooms: rooms.map(r => decorateRoomAvailability(r, activeReservations))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/available', async (req, res) => {
    try {
        await releaseExpiredRooms();
        let checkIn = req.query.checkIn || req.query.check_in;
        let checkOut = req.query.checkOut || req.query.check_out;
        if (checkIn && !checkOut) {
            const d = new Date(checkIn);
            d.setDate(d.getDate() + 1);
            checkOut = d.toISOString().slice(0, 10);
        }

        // Return ALL rooms with calculated availability so occupied rooms remain visible but blocked
        const [rooms] = await db.execute('SELECT * FROM rooms ORDER BY id DESC, room_number ASC');
        const [activeReservations] = await db.execute(
            `SELECT id, room_id, check_in_date, check_out_date, status, payment_status, guest_name
             FROM room_reservations
             WHERE status NOT IN ('cancelled', 'rejected', 'checked_out')
               AND (
                 (status IN ('approved', 'checked_in') AND payment_status = 'paid')
                 OR
                 (status IN ('pending', 'awaiting_payment') AND reservation_date >= (NOW() - INTERVAL 20 MINUTE))
               )
               AND DATE(check_out_date) > CURDATE()
             ORDER BY check_in_date ASC`
        );

        res.json({
            success: true,
            rooms: rooms.map(r => decorateRoomAvailability(r, activeReservations, checkIn, checkOut)),
            checkIn,
            checkOut
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/status', auth, authorize('receptionist', 'admin', 'manager'), async (req, res) => {
    try {
        await releaseExpiredRooms();
        const filter = String(req.query.filter || 'available').toLowerCase();

        if (filter === 'all') {
            const [rows] = await db.execute(
                `SELECT
                    r.*,
                    CASE
                      WHEN EXISTS (
                        SELECT 1 FROM room_reservations rr
                        WHERE rr.room_id = r.id
                          AND rr.status IN ('approved', 'checked_in')
                          AND rr.payment_status = 'paid'
                          AND DATE(rr.check_out_date) > CURDATE()
                      ) THEN 'reserved'
                      ELSE 'available'
                    END AS inventory_status
                 FROM rooms r
                 WHERE (r.status IS NULL OR r.status NOT IN ('maintenance'))
                 ORDER BY r.id DESC, r.room_number ASC`
            );
            return res.json({ success: true, rooms: rows, filter: 'all', count: rows.length });
        }

        if (filter === 'reserved' || filter === 'booked') {
            const [rows] = await db.execute(
                `SELECT
                    r.*,
                    'reserved' AS inventory_status,
                    rr.id AS reservation_id,
                    rr.check_in_date,
                    rr.check_out_date,
                    'reserved' AS reservation_status,
                    rr.payment_status,
                    rr.total_price,
                    COALESCE(
                      NULLIF(TRIM(rr.guest_name), ''),
                      NULLIF(TRIM(CONCAT(COALESCE(c.first_name, u.first_name, ''), ' ', COALESCE(c.last_name, u.last_name, ''))), ''),
                      '—'
                    ) AS guest_name,
                    COALESCE(NULLIF(c.first_name, ''), NULLIF(u.first_name, ''), '') AS first_name,
                    COALESCE(NULLIF(c.last_name, ''), NULLIF(u.last_name, ''), '') AS last_name,
                    u.username,
                    COALESCE(c.email, rr.guest_email, u.email, '') AS email,
                    COALESCE(c.phone, rr.guest_phone, u.phone, '') AS phone
                 FROM room_reservations rr
                 INNER JOIN rooms r ON r.id = rr.room_id
                 LEFT JOIN customers c ON c.id = rr.customer_id
                 LEFT JOIN users u ON u.id = c.user_id
                 WHERE rr.status IN ('approved', 'checked_in')
                   AND rr.payment_status = 'paid'
                   AND DATE(rr.check_out_date) > CURDATE()
                 ORDER BY rr.id DESC, r.room_number ASC`
            );
            return res.json({ success: true, rooms: rows, filter: 'reserved', count: rows.length });
        }

        const [rows] = await db.execute(
            `SELECT
                r.*,
                'available' AS inventory_status,
                NULL AS reservation_id,
                '' AS first_name,
                '' AS last_name,
                '—' AS guest_name,
                '' AS email,
                '' AS phone,
                '' AS username
             FROM rooms r
             WHERE (r.status IS NULL OR r.status NOT IN ('maintenance'))
               AND NOT EXISTS (
                 SELECT 1 FROM room_reservations rr
                 WHERE rr.room_id = r.id
                   AND rr.status IN ('approved', 'checked_in')
                   AND rr.payment_status = 'paid'
                   AND DATE(rr.check_out_date) > CURDATE()
               )
             ORDER BY r.id DESC, r.room_number ASC`
        );
        return res.json({ success: true, rooms: rows, filter: 'available', count: rows.length });
    } catch (error) {
        console.error('rooms/status error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/release-expired', auth, authorize('receptionist', 'admin', 'manager'), async (req, res) => {
    try {
        await releaseExpiredRooms();
        res.json({
            success: true,
            message: 'Rooms with checkout date reached are now available.',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
module.exports.releaseExpiredRooms = releaseExpiredRooms;
