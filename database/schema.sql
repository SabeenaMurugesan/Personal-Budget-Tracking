-- Personal Budget Tracker Database Schema

-- Categories table for organizing transactions
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    color VARCHAR(7) DEFAULT '#3498db',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table for different financial accounts
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'cash')),
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table for all financial transactions
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    transaction_date DATE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Budget limits table for monthly budget planning
CREATE TABLE budget_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    limit_amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(category_id, month_year)
);

-- Indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_budget_limits_month ON budget_limits(month_year);