const db = require('../config/db');

// Ensure sms_logs table exists
(async () => {
    try {
        await db.execute(`CREATE TABLE IF NOT EXISTS sms_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recipient_phone VARCHAR(30) NOT NULL,
            message TEXT NOT NULL,
            gateway VARCHAR(50) DEFAULT 'simulator',
            status VARCHAR(30) DEFAULT 'sent',
            response_payload TEXT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    } catch (_) {}
})();

/**
 * Clean & normalize Ethiopian phone number format
 * Accepts: "0918123456", "+251918123456", "251918123456", "0718123456"
 * Returns standard: "+251918123456"
 */
function normalizeEthiopianPhone(phone) {
    if (!phone) return null;
    let clean = String(phone).replace(/[\s\-\(\)]/g, '');
    if (clean.startsWith('09') || clean.startsWith('07')) {
        return '+251' + clean.slice(1);
    }
    if (clean.startsWith('251')) {
        return '+' + clean;
    }
    if (clean.startsWith('+251')) {
        return clean;
    }
    return clean;
}

/**
 * Send an SMS message to an Ethiopian phone number
 * @param {string} toPhone - Recipient mobile number
 * @param {string} message - SMS body content (max 160 chars recommended for standard single SMS)
 * @returns {Promise<{success: boolean, messageId?: string, simulated?: boolean}>}
 */
async function sendSMS(toPhone, message) {
    const formattedPhone = normalizeEthiopianPhone(toPhone);
    if (!formattedPhone) {
        console.warn('[SMS] Skipped: Invalid or missing phone number:', toPhone);
        return { success: false, reason: 'invalid_phone' };
    }

    const afroKey = process.env.AFROMESSAGE_API_KEY;
    const afroSender = process.env.AFROMESSAGE_SENDER_NAME || 'ParadiseHtl';

    // 1. Live AfroMessage Gateway (if configured)
    if (afroKey) {
        try {
            const https = require('https');
            const url = 'https://api.afromessage.com/api/send';
            const payload = JSON.stringify({
                to: formattedPhone,
                message: message,
                sender: afroSender
            });

            const response = await new Promise((resolve, reject) => {
                const req = https.request(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${afroKey}`,
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(payload)
                    }
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve({ statusCode: res.statusCode, data }));
                });
                req.on('error', reject);
                req.write(payload);
                req.end();
            });

            await db.execute(
                'INSERT INTO sms_logs (recipient_phone, message, gateway, status, response_payload) VALUES (?, ?, ?, ?, ?)',
                [formattedPhone, message, 'afromessage', response.statusCode === 200 ? 'delivered' : 'failed', response.data]
            );

            console.log(`[SMS-AFRO] Sent to ${formattedPhone}: HTTP ${response.statusCode}`);
            return { success: response.statusCode === 200, gateway: 'afromessage' };
        } catch (err) {
            console.error('[SMS-AFRO Error]:', err.message);
        }
    }

    // 2. Production Ready Local Simulator & Audit Log
    // Always logs to database and terminal for complete testing and compliance
    try {
        await db.execute(
            'INSERT INTO sms_logs (recipient_phone, message, gateway, status, response_payload) VALUES (?, ?, ?, ?, ?)',
            [formattedPhone, message, 'simulator', 'delivered', JSON.stringify({ simulated: true, timestamp: new Date() })]
        );
    } catch (_) {}

    console.log(`\n======================================================`);
    console.log(`📱 [PARADISE HOTEL SMS DISPATCH]`);
    console.log(`📞 To: ${formattedPhone}`);
    console.log(`💬 Message: "${message}"`);
    console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
    console.log(`======================================================\n`);

    return {
        success: true,
        simulated: true,
        recipient: formattedPhone,
        message
    };
}

module.exports = {
    sendSMS,
    normalizeEthiopianPhone
};

