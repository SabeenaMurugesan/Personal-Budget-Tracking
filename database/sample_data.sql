-- Sample Data for Personal Budget Tracker
-- This file contains sample data to help you get started

-- Insert sample categories
INSERT INTO categories (name, type, color) VALUES
('Salary', 'income', '#27ae60'),
('Freelance', 'income', '#2ecc71'),
('Investment', 'income', '#16a085'),
('Groceries', 'expense', '#e74c3c'),
('Rent', 'expense', '#c0392b'),
('Utilities', 'expense', '#f39c12'),
('Transportation', 'expense', '#9b59b6'),
('Entertainment', 'expense', '#e67e22'),
('Healthcare', 'expense', '#34495e'),
('Dining Out', 'expense', '#e91e63'),
('Shopping', 'expense', '#8e44ad'),
('Insurance', 'expense', '#2c3e50');

-- Insert sample accounts
INSERT INTO accounts (name, type, balance) VALUES
('Main Checking', 'checking', 2500.00),
('Savings Account', 'savings', 15000.00),
('Credit Card', 'credit', -850.00),
('Cash Wallet', 'cash', 200.00);

-- Insert sample transactions for the current month
INSERT INTO transactions (amount, description, category_id, account_id, transaction_date, type) VALUES
-- Income transactions
(3500.00, 'Monthly Salary', 1, 1, '2025-08-01', 'income'),
(800.00, 'Freelance Project', 2, 1, '2025-08-05', 'income'),
(150.00, 'Dividend Payment', 3, 2, '2025-08-15', 'income'),

-- Expense transactions
(1200.00, 'Monthly Rent', 5, 1, '2025-08-01', 'expense'),
(120.00, 'Electricity Bill', 6, 1, '2025-08-02', 'expense'),
(85.00, 'Internet Bill', 6, 1, '2025-08-02', 'expense'),
(450.00, 'Weekly Groceries', 4, 1, '2025-08-03', 'expense'),
(25.00, 'Bus Pass', 7, 4, '2025-08-03', 'expense'),
(65.00, 'Dinner Out', 10, 3, '2025-08-04', 'expense'),
(89.00, 'Gas Bill', 6, 1, '2025-08-05', 'expense'),
(200.00, 'Grocery Shopping', 4, 1, '2025-08-06', 'expense'),
(45.00, 'Movie Tickets', 8, 4, '2025-08-06', 'expense'),
(320.00, 'Car Insurance', 12, 1, '2025-08-07', 'expense'),
(75.00, 'Pharmacy', 9, 3, '2025-08-07', 'expense');

-- Insert sample budget limits for current month
INSERT INTO budget_limits (category_id, month_year, limit_amount) VALUES
(4, '2025-08', 800.00),  -- Groceries
(5, '2025-08', 1200.00), -- Rent
(6, '2025-08', 300.00),  -- Utilities
(7, '2025-08', 150.00),  -- Transportation
(8, '2025-08', 200.00),  -- Entertainment
(9, '2025-08', 250.00),  -- Healthcare
(10, '2025-08', 300.00), -- Dining Out
(11, '2025-08', 400.00), -- Shopping
(12, '2025-08', 350.00); -- Insurance

-- Previous month data for comparison
INSERT INTO transactions (amount, description, category_id, account_id, transaction_date, type) VALUES
-- July income
(3500.00, 'Monthly Salary', 1, 1, '2025-07-01', 'income'),
(600.00, 'Freelance Work', 2, 1, '2025-07-15', 'income'),

-- July expenses
(1200.00, 'Monthly Rent', 5, 1, '2025-07-01', 'expense'),
(95.00, 'Electricity Bill', 6, 1, '2025-07-02', 'expense'),
(85.00, 'Internet Bill', 6, 1, '2025-07-02', 'expense'),
(520.00, 'Groceries', 4, 1, '2025-07-10', 'expense'),
(180.00, 'Dining Out', 10, 3, '2025-07-15', 'expense'),
(120.00, 'Entertainment', 8, 4, '2025-07-20', 'expense');

-- Previous month budget limits
INSERT INTO budget_limits (category_id, month_year, limit_amount) VALUES
(4, '2025-07', 800.00),  -- Groceries
(5, '2025-07', 1200.00), -- Rent
(6, '2025-07', 300.00),  -- Utilities
(8, '2025-07', 200.00),  -- Entertainment
(10, '2025-07', 250.00); -- Dining Out

-- Display summary
SELECT 'Sample data inserted successfully!' as message;
SELECT 'Categories:', COUNT(*) as count FROM categories
UNION ALL
SELECT 'Accounts:', COUNT(*) FROM accounts
UNION ALL
SELECT 'Transactions:', COUNT(*) FROM transactions
UNION ALL
SELECT 'Budget Limits:', COUNT(*) FROM budget_limits;