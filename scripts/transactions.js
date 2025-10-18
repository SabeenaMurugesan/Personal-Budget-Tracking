// Transaction Management Module
const { getDatabase } = require('./connect');

class TransactionManager {
    constructor() {
        this.db = getDatabase();
    }

    // Add a new transaction
    async addTransaction(transactionData) {
        const { amount, description, categoryId, accountId, transactionDate, type } = transactionData;
        
        try {
            // Validate required fields
            if (!amount || !description || !categoryId || !accountId || !transactionDate || !type) {
                throw new Error('Missing required transaction fields');
            }

            // Validate transaction type
            if (!['income', 'expense'].includes(type)) {
                throw new Error('Invalid transaction type. Must be "income" or "expense"');
            }

            // Insert transaction
            const result = await this.db.run(
                `INSERT INTO transactions (amount, description, category_id, account_id, transaction_date, type)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [amount, description, categoryId, accountId, transactionDate, type]
            );

            // Update account balance
            await this.updateAccountBalance(accountId, amount, type);

            return { id: result.id, success: true };
        } catch (error) {
            throw new Error(`Failed to add transaction: ${error.message}`);
        }
    }

    // Update account balance based on transaction
    async updateAccountBalance(accountId, amount, type) {
        try {
            const account = await this.db.get('SELECT balance, type as account_type FROM accounts WHERE id = ?', [accountId]);
            
            if (!account) {
                throw new Error('Account not found');
            }

            let balanceChange = parseFloat(amount);
            
            // For credit accounts, income decreases the balance (payment), expense increases it (charges)
            if (account.account_type === 'credit') {
                balanceChange = type === 'income' ? -balanceChange : balanceChange;
            } else {
                // For other accounts, income increases balance, expense decreases it
                balanceChange = type === 'income' ? balanceChange : -balanceChange;
            }

            await this.db.run(
                'UPDATE accounts SET balance = balance + ? WHERE id = ?',
                [balanceChange, accountId]
            );
        } catch (error) {
            throw new Error(`Failed to update account balance: ${error.message}`);
        }
    }

    // Get all transactions with category and account details
    async getAllTransactions(limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT t.*, c.name as category_name, c.color as category_color,
                       a.name as account_name, a.type as account_type
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                JOIN accounts a ON t.account_id = a.id
                ORDER BY t.transaction_date DESC, t.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            return await this.db.all(sql, [limit, offset]);
        } catch (error) {
            throw new Error(`Failed to get transactions: ${error.message}`);
        }
    }

    // Get transactions by date range
    async getTransactionsByDateRange(startDate, endDate, limit = 100) {
        try {
            const sql = `
                SELECT t.*, c.name as category_name, c.color as category_color,
                       a.name as account_name, a.type as account_type
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                JOIN accounts a ON t.account_id = a.id
                WHERE t.transaction_date BETWEEN ? AND ?
                ORDER BY t.transaction_date DESC, t.created_at DESC
                LIMIT ?
            `;
            
            return await this.db.all(sql, [startDate, endDate, limit]);
        } catch (error) {
            throw new Error(`Failed to get transactions by date range: ${error.message}`);
        }
    }

    // Get transactions by category
    async getTransactionsByCategory(categoryId, limit = 100) {
        try {
            const sql = `
                SELECT t.*, c.name as category_name, c.color as category_color,
                       a.name as account_name, a.type as account_type
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                JOIN accounts a ON t.account_id = a.id
                WHERE t.category_id = ?
                ORDER BY t.transaction_date DESC, t.created_at DESC
                LIMIT ?
            `;
            
            return await this.db.all(sql, [categoryId, limit]);
        } catch (error) {
            throw new Error(`Failed to get transactions by category: ${error.message}`);
        }
    }

    // Get monthly transaction summary
    async getMonthlyTransactionSummary(monthYear) {
        try {
            const sql = `
                SELECT 
                    t.type,
                    c.name as category_name,
                    c.color as category_color,
                    SUM(t.amount) as total_amount,
                    COUNT(*) as transaction_count
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE strftime('%Y-%m', t.transaction_date) = ?
                GROUP BY t.type, t.category_id, c.name, c.color
                ORDER BY t.type, total_amount DESC
            `;
            
            return await this.db.all(sql, [monthYear]);
        } catch (error) {
            throw new Error(`Failed to get monthly summary: ${error.message}`);
        }
    }

    // Update transaction
    async updateTransaction(id, transactionData) {
        try {
            // Get original transaction to reverse balance changes
            const originalTransaction = await this.db.get('SELECT * FROM transactions WHERE id = ?', [id]);
            if (!originalTransaction) {
                throw new Error('Transaction not found');
            }

            // Reverse original balance change
            await this.updateAccountBalance(
                originalTransaction.account_id, 
                originalTransaction.amount, 
                originalTransaction.type === 'income' ? 'expense' : 'income'
            );

            // Update transaction
            const { amount, description, categoryId, accountId, transactionDate, type } = transactionData;
            
            await this.db.run(
                `UPDATE transactions 
                 SET amount = ?, description = ?, category_id = ?, account_id = ?, 
                     transaction_date = ?, type = ?
                 WHERE id = ?`,
                [amount, description, categoryId, accountId, transactionDate, type, id]
            );

            // Apply new balance change
            await this.updateAccountBalance(accountId, amount, type);

            return { success: true };
        } catch (error) {
            throw new Error(`Failed to update transaction: ${error.message}`);
        }
    }

    // Delete transaction
    async deleteTransaction(id) {
        try {
            // Get transaction to reverse balance changes
            const transaction = await this.db.get('SELECT * FROM transactions WHERE id = ?', [id]);
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Reverse balance change
            await this.updateAccountBalance(
                transaction.account_id, 
                transaction.amount, 
                transaction.type === 'income' ? 'expense' : 'income'
            );

            // Delete transaction
            await this.db.run('DELETE FROM transactions WHERE id = ?', [id]);

            return { success: true };
        } catch (error) {
            throw new Error(`Failed to delete transaction: ${error.message}`);
        }
    }

    // Get transaction by ID
    async getTransactionById(id) {
        try {
            const sql = `
                SELECT t.*, c.name as category_name, c.color as category_color,
                       a.name as account_name, a.type as account_type
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                JOIN accounts a ON t.account_id = a.id
                WHERE t.id = ?
            `;
            
            return await this.db.get(sql, [id]);
        } catch (error) {
            throw new Error(`Failed to get transaction: ${error.message}`);
        }
    }

    // Search transactions
    async searchTransactions(searchTerm, limit = 50) {
        try {
            const sql = `
                SELECT t.*, c.name as category_name, c.color as category_color,
                       a.name as account_name, a.type as account_type
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                JOIN accounts a ON t.account_id = a.id
                WHERE t.description LIKE ? OR c.name LIKE ? OR a.name LIKE ?
                ORDER BY t.transaction_date DESC, t.created_at DESC
                LIMIT ?
            `;
            
            const searchPattern = `%${searchTerm}%`;
            return await this.db.all(sql, [searchPattern, searchPattern, searchPattern, limit]);
        } catch (error) {
            throw new Error(`Failed to search transactions: ${error.message}`);
        }
    }

    // Get account balance
    async getAccountBalance(accountId) {
        try {
            const account = await this.db.get('SELECT balance FROM accounts WHERE id = ?', [accountId]);
            return account ? account.balance : null;
        } catch (error) {
            throw new Error(`Failed to get account balance: ${error.message}`);
        }
    }

    // Get all categories
    async getCategories() {
        try {
            return await this.db.all('SELECT * FROM categories ORDER BY type, name');
        } catch (error) {
            throw new Error(`Failed to get categories: ${error.message}`);
        }
    }

    // Get all accounts
    async getAccounts() {
        try {
            return await this.db.all('SELECT * FROM accounts ORDER BY name');
        } catch (error) {
            throw new Error(`Failed to get accounts: ${error.message}`);
        }
    }

    // Add new category
    async addCategory(name, type, color = '#3498db') {
        try {
            const result = await this.db.run(
                'INSERT INTO categories (name, type, color) VALUES (?, ?, ?)',
                [name, type, color]
            );
            return { id: result.id, success: true };
        } catch (error) {
            throw new Error(`Failed to add category: ${error.message}`);
        }
    }

    // Add new account
    async addAccount(name, type, balance = 0) {
        try {
            const result = await this.db.run(
                'INSERT INTO accounts (name, type, balance) VALUES (?, ?, ?)',
                [name, type, balance]
            );
            return { id: result.id, success: true };
        } catch (error) {
            throw new Error(`Failed to add account: ${error.message}`);
        }
    }
}

module.exports = TransactionManager;