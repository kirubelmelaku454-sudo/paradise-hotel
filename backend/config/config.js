const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || 'default_secret',
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'paradise_hotel'
    },
    cbe: {
        accountNumber: process.env.CBE_ACCOUNT_NUMBER || '1000532238122',
        accountName: process.env.CBE_ACCOUNT_NAME || 'Paradise Hotel',
        bankName: process.env.CBE_BANK_NAME || 'Commercial Bank of Ethiopia'
    },
    telebirr: {
        phoneNumber: process.env.TELEBIRR_NUMBER || '0920439009',
        accountName: process.env.TELEBIRR_NAME || 'Paradise Hotel'
    },
    currency: process.env.CURRENCY || 'ETB'
};
