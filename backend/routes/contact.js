const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, optionalAuth, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

// Ensure contact_messages table exists
let tableReady = false;
async function ensureContactTable() {
    if (tableReady) return;
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(150) NOT NULL,
                phone VARCHAR(50) NULL,
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                category VARCHAR(50) DEFAULT 'general',
                status ENUM('pending', 'replied', 'archived') DEFAULT 'pending',
                user_id INT NULL,
                staff_reply TEXT NULL,
                replied_by INT NULL,
                replied_by_name VARCHAR(100) NULL,
                replied_by_role VARCHAR(50) NULL,
                replied_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        tableReady = true;
    } catch (err) {
        console.error('ensureContactTable error:', err.message);
    }
}

/**
 * Public or Logged-in: Submit a contact message / concierge inquiry
 */
router.post('/messages', optionalAuth, async (req, res) => {
    try {
        await ensureContactTable();
        const { name, email, phone, subject, message, category } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, subject, and message are required.'
            });
        }

        const userId = req.user ? req.user.id : null;
        const cat = category || 'general';

        const [result] = await db.execute(
            `INSERT INTO contact_messages 
             (name, email, phone, subject, message, category, status, user_id) 
             VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [name.trim(), email.trim(), phone ? phone.trim() : null, subject.trim(), message.trim(), cat, userId]
        );

        const newId = result.insertId;

        // Notify Admin, Manager, and Receptionist
        try {
            const [staff] = await db.execute(
                "SELECT id, role FROM users WHERE role IN ('admin', 'manager', 'receptionist')"
            );
            for (const s of staff) {
                const link = `/dashboard/${s.role === 'admin' ? 'admin' : s.role === 'manager' ? 'manager' : 'receptionist'}?tab=messages`;
                await db.execute(
                    'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
                    [
                        s.id,
                        'contact_message',
                        `📩 New Message: ${subject.slice(0, 35)}`,
                        `From ${name.trim()} (${cat}): ${message.slice(0, 75)}...`,
                        link
                    ]
                );
            }
        } catch (notifErr) {
            console.error('Error notifying staff for contact message:', notifErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully! Our hotel management & reception will respond promptly.',
            id: newId
        });
    } catch (error) {
        console.error('Contact message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Staff (Admin, Manager, Receptionist): Get all contact messages
 */
router.get('/messages', auth, authorize('admin', 'manager', 'receptionist'), async (req, res) => {
    try {
        await ensureContactTable();
        const { status, q } = req.query;

        let query = 'SELECT * FROM contact_messages WHERE 1=1';
        const params = [];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        if (q) {
            query += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)';
            const term = `%${q}%`;
            params.push(term, term, term, term);
        }

        query += ' ORDER BY created_at DESC';

        const [messages] = await db.execute(query, params);

        // Count pending
        const [counts] = await db.execute(
            'SELECT status, COUNT(*) as cnt FROM contact_messages GROUP BY status'
        );
        const countMap = { pending: 0, replied: 0, archived: 0, total: 0 };
        for (const row of counts) {
            countMap[row.status] = row.cnt;
            countMap.total += row.cnt;
        }

        res.json({ success: true, messages, counts: countMap });
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Customer: Get my messages & replies
 */
router.get('/messages/my', auth, async (req, res) => {
    try {
        await ensureContactTable();
        const userId = req.user.id;
        const userEmail = req.user.email || '';

        const [messages] = await db.execute(
            'SELECT * FROM contact_messages WHERE user_id = ? OR email = ? ORDER BY created_at DESC',
            [userId, userEmail]
        );

        res.json({ success: true, messages });
    } catch (error) {
        console.error('Get my messages error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Staff: Reply to a contact message
 */
router.post('/messages/:id/reply', auth, authorize('admin', 'manager', 'receptionist'), async (req, res) => {
    try {
        await ensureContactTable();
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply || reply.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Reply content is required.' });
        }

        const [existing] = await db.execute('SELECT * FROM contact_messages WHERE id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }
        const msg = existing[0];

        const staffName = [req.user.first_name, req.user.last_name].filter(Boolean).join(' ') || req.user.username || 'Hotel Staff';
        const staffRole = req.user.role || 'Staff';

        await db.execute(
            `UPDATE contact_messages 
             SET staff_reply = ?, status = 'replied', replied_by = ?, replied_by_name = ?, replied_by_role = ?, replied_at = NOW() 
             WHERE id = ?`,
            [reply.trim(), req.user.id, staffName, staffRole, id]
        );

        // Notify customer in-app if registered
        if (msg.user_id) {
            try {
                await db.execute(
                    'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
                    [
                        msg.user_id,
                        'contact_reply',
                        `💬 Reply from Paradise Hotel (${staffRole})`,
                        `Re: "${msg.subject.slice(0, 30)}": ${reply.trim().slice(0, 100)}...`,
                        '/contact'
                    ]
                );
            } catch (notifErr) {
                console.error('Error creating customer notification:', notifErr.message);
            }
        }

        // Send email reply if configured
        if (msg.email && sendEmail) {
            try {
                await sendEmail({
                    to: msg.email,
                    subject: `Response from Paradise Hotel: ${msg.subject}`,
                    text: `Dear ${msg.name},\n\nThank you for reaching out to Paradise Hotel Debre Markos.\n\n${reply.trim()}\n\nWarm regards,\n${staffName} (${staffRole})\nParadise Hotel Concierge & Management\nDebre Markos, Ethiopia`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 8px;">
                            <h2 style="color: #0b1329; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Paradise Hotel</h2>
                            <p>Dear <strong>${msg.name}</strong>,</p>
                            <p>Thank you for reaching out to Paradise Hotel, Debre Markos. Here is our response to your inquiry regarding <em>"${msg.subject}"</em>:</p>
                            <div style="background: #f8f9fa; border-left: 4px solid #d4af37; padding: 15px; margin: 15px 0; font-size: 15px; line-height: 1.6;">
                                ${reply.trim().replace(/\n/g, '<br/>')}
                            </div>
                            <p style="color: #666; font-size: 13px;">Original Inquiry: "${msg.message}"</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 14px; margin: 0;"><strong>${staffName}</strong></p>
                            <p style="font-size: 12px; color: #888; margin: 2px 0 0;">${staffRole.toUpperCase()} · Paradise Hotel Reception & Concierge</p>
                            <p style="font-size: 12px; color: #888;">Debre Markos, Amhara, Ethiopia · Reception: 24/7</p>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.log('Notice: Could not send reply email (SMTP may not be active):', emailErr.message);
            }
        }

        res.json({
            success: true,
            message: 'Reply sent successfully! Customer has been notified.'
        });
    } catch (error) {
        console.error('Reply contact message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Staff: Delete or archive message
 */
router.delete('/messages/:id', auth, authorize('admin', 'manager'), async (req, res) => {
    try {
        await ensureContactTable();
        const { id } = req.params;
        await db.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
        res.json({ success: true, message: 'Message deleted successfully.' });
    } catch (error) {
        console.error('Delete contact message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

