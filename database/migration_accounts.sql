-- Bank / digital accounts for hotel and customers
CREATE TABLE IF NOT EXISTS bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_type ENUM('hotel', 'customer') NOT NULL,
    customer_id INT NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(50) NULL,
    account_number VARCHAR(50) NOT NULL,
    account_username VARCHAR(100) NOT NULL COMMENT 'Unique handle used with full name to authorize payments',
    account_holder_name VARCHAR(150) NOT NULL COMMENT 'Must match customer registration full name for customer accounts',
    balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'ETB',
    is_active TINYINT(1) DEFAULT 1,
    is_primary TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_account_number_bank (bank_name, account_number),
    UNIQUE KEY uq_account_username (account_username),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS account_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_account_id INT NOT NULL,
    to_account_id INT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETB',
    transaction_type ENUM('payment', 'refund', 'deposit', 'withdrawal', 'transfer') NOT NULL,
    reference_type ENUM('room', 'desk', 'food', 'refund', 'other') NULL,
    reference_id INT NULL,
    description TEXT,
    status ENUM('completed', 'failed', 'reversed') DEFAULT 'completed',
    initiated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES bank_accounts(id),
    FOREIGN KEY (to_account_id) REFERENCES bank_accounts(id)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed default hotel accounts (multiple banks)
INSERT INTO bank_accounts (owner_type, customer_id, bank_name, bank_code, account_number, account_username, account_holder_name, balance, is_primary)
SELECT 'hotel', NULL, 'Commercial Bank of Ethiopia', 'CBE', '1000532238122', 'paradise_cbe', 'Paradise Hotel', 1000000.00, 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM bank_accounts WHERE account_username = 'paradise_cbe');

INSERT INTO bank_accounts (owner_type, customer_id, bank_name, bank_code, account_number, account_username, account_holder_name, balance, is_primary)
SELECT 'hotel', NULL, 'Telebirr', 'TELEBIRR', '0915539686', 'paradise_telebirr', 'Paradise Hotel', 500000.00, 0
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM bank_accounts WHERE account_username = 'paradise_telebirr');

INSERT INTO bank_accounts (owner_type, customer_id, bank_name, bank_code, account_number, account_username, account_holder_name, balance, is_primary)
SELECT 'hotel', NULL, 'Bank of Abyssinia', 'BOA', '2000123456789', 'paradise_boa', 'Paradise Hotel', 250000.00, 0
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM bank_accounts WHERE account_username = 'paradise_boa');

-- Food availability flag if missing
-- ALTER TABLE food_menu ADD COLUMN IF NOT EXISTS is_hidden TINYINT(1) DEFAULT 0;
