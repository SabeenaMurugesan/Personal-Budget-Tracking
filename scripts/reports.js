// Reports and Analytics Module
const { getDatabase } = require('./connect');

class ReportsManager {
    constructor() {
        this.db = getDatabase();
    }

    // Get monthly spending report
    async getMonthlySpendingReport(monthYear) {
        try {
            const sql = `
                SELECT 
                    c.name as category,
                    c.color,
                    SUM(t.amount) as total_spent,
                    COUNT(*) as transaction_count,
                    AVG(t.amount) as avg_transaction,
                    bl.limit_amount as budget_limit,
                    ROUND(((SUM(t.amount) / COALESCE(bl.limit_amount, SUM(t.amount))) * 100), 2) as budget_usage_percent
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                LEFT JOIN budget_limits bl ON c.id = bl.category_id AND bl.month_year = ?
                WHERE t.type = 'expense' 
                  AND strftime('%Y-%m', t.transaction_date) = ?
                GROUP BY c.id, c.name, c.color, bl.limit_amount
                ORDER BY total_spent DESC
            `;
            
            return await this.db.all(sql, [monthYear, monthYear]);
        } catch (error) {
            throw new Error(`Failed to get monthly spending report: ${error.message}`);
        }
    }

    // Get monthly income report
    async getMonthlyIncomeReport(monthYear) {
        try {
            const sql = `
                SELECT 
                    c.name as category,
                    c.color,
                    SUM(t.amount) as total_income,
                    COUNT(*) as transaction_count,
                    AVG(t.amount) as avg_transaction
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.type = 'income' 
                  AND strftime('%Y-%m', t.transaction_date) = ?
                GROUP BY c.id, c.name, c.color
                ORDER BY total_income DESC
            `;
            
            return await this.db.all(sql, [monthYear]);
        } catch (error) {
            throw new Error(`Failed to get monthly income report: ${error.message}`);
        }
    }

    // Get financial summary for a month
    async getFinancialSummary(monthYear) {
        try {
            const summaryData = {};

            // Get total income and expenses
            const totalsResult = await this.db.all(`
                SELECT 
                    type,
                    SUM(amount) as total,
                    COUNT(*) as count
                FROM transactions 
                WHERE strftime('%Y-%m', transaction_date) = ?
                GROUP BY type
            `, [monthYear]);

            summaryData.income = totalsResult.find(r => r.type === 'income') || { total: 0, count: 0 };
            summaryData.expenses = totalsResult.find(r => r.type === 'expense') || { total: 0, count: 0 };
            summaryData.netIncome = summaryData.income.total - summaryData.expenses.total;

            // Get account balances
            summaryData.accounts = await this.db.all(`
                SELECT name, type, balance 
                FROM accounts 
                ORDER BY balance DESC
            `);

            summaryData.totalAssets = summaryData.accounts
                .filter(acc => acc.type !== 'credit')
                .reduce((sum, acc) => sum + acc.balance, 0);

            summaryData.totalLiabilities = summaryData.accounts
                .filter(acc => acc.type === 'credit' && acc.balance < 0)
                .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

            summaryData.netWorth = summaryData.totalAssets - summaryData.totalLiabilities;

            // Get budget status
            summaryData.budgetStatus = await this.db.all(`
                SELECT 
                    c.name as category,
                    bl.limit_amount,
                    COALESCE(spent.total, 0) as spent,
                    ROUND((COALESCE(spent.total, 0) / bl.limit_amount) * 100, 2) as usage_percent,
                    (bl.limit_amount - COALESCE(spent.total, 0)) as remaining
                FROM budget_limits bl
                JOIN categories c ON bl.category_id = c.id
                LEFT JOIN (
                    SELECT category_id, SUM(amount) as total
                    FROM transactions 
                    WHERE type = 'expense' AND strftime('%Y-%m', transaction_date) = ?
                    GROUP BY category_id
                ) spent ON c.id = spent.category_id
                WHERE bl.month_year = ?
                ORDER BY usage_percent DESC
            `, [monthYear, monthYear]);

            return summaryData;
        } catch (error) {
            throw new Error(`Failed to get financial summary: ${error.message}`);
        }
    }

    // Get spending trends over multiple months
    async getSpendingTrends(months = 6) {
        try {
            const sql = `
                SELECT 
                    strftime('%Y-%m', transaction_date) as month,
                    strftime('%Y', transaction_date) as year,
                    strftime('%m', transaction_date) as month_num,
                    c.name as category,
                    c.color,
                    SUM(amount) as total
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.type = 'expense' 
                  AND transaction_date >= date('now', '-${months} months')
                GROUP BY month, c.id, c.name, c.color
                ORDER BY month DESC, total DESC
            `;
            
            return await this.db.all(sql);
        } catch (error) {
            throw new Error(`Failed to get spending trends: ${error.message}`);
        }
    }

    // Get income vs expenses comparison
    async getIncomeVsExpenses(months = 12) {
        try {
            const sql = `
                SELECT 
                    strftime('%Y-%m', transaction_date) as month,
                    type,
                    SUM(amount) as total
                FROM transactions
                WHERE transaction_date >= date('now', '-${months} months')
                GROUP BY month, type
                ORDER BY month DESC
            `;
            
            const data = await this.db.all(sql);
            
            // Transform data for easier consumption
            const monthlyData = {};
            data.forEach(row => {
                if (!monthlyData[row.month]) {
                    monthlyData[row.month] = { month: row.month, income: 0, expenses: 0 };
                }
                monthlyData[row.month][row.type === 'income' ? 'income' : 'expenses'] = row.total;
            });

            return Object.values(monthlyData).map(month => ({
                ...month,
                netIncome: month.income - month.expenses,
                savingsRate: month.income > 0 ? ((month.income - month.expenses) / month.income * 100).toFixed(2) : 0
            }));
        } catch (error) {
            throw new Error(`Failed to get income vs expenses: ${error.message}`);
        }
    }

    // Get top spending categories
    async getTopSpendingCategories(monthYear, limit = 10) {
        try {
            const sql = `
                SELECT 
                    c.name as category,
                    c.color,
                    SUM(t.amount) as total_spent,
                    COUNT(*) as transaction_count,
                    ROUND(AVG(t.amount), 2) as avg_per_transaction,
                    ROUND((SUM(t.amount) / (SELECT SUM(amount) FROM transactions WHERE type = 'expense' AND strftime('%Y-%m', transaction_date) = ?)) * 100, 2) as percentage_of_total
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.type = 'expense' 
                  AND strftime('%Y-%m', t.transaction_date) = ?
                GROUP BY c.id, c.name, c.color
                ORDER BY total_spent DESC
                LIMIT ?
            `;
            
            return await this.db.all(sql, [monthYear, monthYear, limit]);
        } catch (error) {
            throw new Error(`Failed to get top spending categories: ${error.message}`);
        }
    }

    // Get budget performance report
    async getBudgetPerformance(monthYear) {
        try {
            const sql = `
                SELECT 
                    c.name as category,
                    c.color,
                    bl.limit_amount as budget,
                    COALESCE(spent.total, 0) as spent,
                    (bl.limit_amount - COALESCE(spent.total, 0)) as remaining,
                    ROUND((COALESCE(spent.total, 0) / bl.limit_amount) * 100, 2) as usage_percent,
                    CASE 
                        WHEN COALESCE(spent.total, 0) > bl.limit_amount THEN 'over_budget'
                        WHEN COALESCE(spent.total, 0) > (bl.limit_amount * 0.8) THEN 'warning'
                        ELSE 'good'
                    END as status,
                    spent.transaction_count
                FROM budget_limits bl
                JOIN categories c ON bl.category_id = c.id
                LEFT JOIN (
                    SELECT 
                        category_id, 
                        SUM(amount) as total,
                        COUNT(*) as transaction_count
                    FROM transactions 
                    WHERE type = 'expense' AND strftime('%Y-%m', transaction_date) = ?
                    GROUP BY category_id
                ) spent ON c.id = spent.category_id
                WHERE bl.month_year = ?
                ORDER BY usage_percent DESC
            `;
            
            return await this.db.all(sql, [monthYear, monthYear]);
        } catch (error) {
            throw new Error(`Failed to get budget performance: ${error.message}`);
        }
    }

    // Get cash flow analysis
    async getCashFlowAnalysis(startDate, endDate) {
        try {
            const sql = `
                SELECT 
                    DATE(transaction_date) as date,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as daily_income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as daily_expenses,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as daily_net
                FROM transactions
                WHERE transaction_date BETWEEN ? AND ?
                GROUP BY DATE(transaction_date)
                ORDER BY date
            `;
            
            const dailyFlow = await this.db.all(sql, [startDate, endDate]);
            
            // Calculate running balance
            let runningBalance = 0;
            const cashFlow = dailyFlow.map(day => {
                runningBalance += day.daily_net;
                return {
                    ...day,
                    running_balance: runningBalance
                };
            });

            return cashFlow;
        } catch (error) {
            throw new Error(`Failed to get cash flow analysis: ${error.message}`);
        }
    }

    // Get expense patterns analysis
    async getExpensePatterns(categoryId, months = 6) {
        try {
            const sql = `
                SELECT 
                    strftime('%w', transaction_date) as day_of_week,
                    strftime('%H', created_at) as hour_of_day,
                    strftime('%Y-%m', transaction_date) as month,
                    COUNT(*) as transaction_count,
                    AVG(amount) as avg_amount,
                    SUM(amount) as total_amount
                FROM transactions t
                WHERE t.category_id = ? 
                  AND t.type = 'expense'
                  AND transaction_date >= date('now', '-${months} months')
                GROUP BY day_of_week, hour_of_day, month
                ORDER BY month DESC, day_of_week, hour_of_day
            `;
            
            return await this.db.all(sql, [categoryId]);
        } catch (error) {
            throw new Error(`Failed to get expense patterns: ${error.message}`);
        }
    }

    // Get account performance
    async getAccountPerformance() {
        try {
            const sql = `
                SELECT 
                    a.name as account_name,
                    a.type as account_type,
                    a.balance as current_balance,
                    income_data.total_income,
                    expense_data.total_expenses,
                    (COALESCE(income_data.total_income, 0) - COALESCE(expense_data.total_expenses, 0)) as net_flow,
                    income_data.income_count,
                    expense_data.expense_count
                FROM accounts a
                LEFT JOIN (
                    SELECT 
                        account_id,
                        SUM(amount) as total_income,
                        COUNT(*) as income_count
                    FROM transactions 
                    WHERE type = 'income'
                      AND transaction_date >= date('now', '-1 month')
                    GROUP BY account_id
                ) income_data ON a.id = income_data.account_id
                LEFT JOIN (
                    SELECT 
                        account_id,
                        SUM(amount) as total_expenses,
                        COUNT(*) as expense_count
                    FROM transactions 
                    WHERE type = 'expense'
                      AND transaction_date >= date('now', '-1 month')
                    GROUP BY account_id
                ) expense_data ON a.id = expense_data.account_id
                ORDER BY current_balance DESC
            `;
            
            return await this.db.all(sql);
        } catch (error) {
            throw new Error(`Failed to get account performance: ${error.message}`);
        }
    }

    // Set or update budget limit
    async setBudgetLimit(categoryId, monthYear, limitAmount) {
        try {
            const sql = `
                INSERT INTO budget_limits (category_id, month_year, limit_amount)
                VALUES (?, ?, ?)
                ON CONFLICT(category_id, month_year)
                DO UPDATE SET limit_amount = excluded.limit_amount
            `;
            
            const result = await this.db.run(sql, [categoryId, monthYear, limitAmount]);
            return { success: true, id: result.id || result.changes };
        } catch (error) {
            throw new Error(`Failed to set budget limit: ${error.message}`);
        }
    }

    // Get year-over-year comparison
    async getYearOverYearComparison(currentYear, previousYear) {
        try {
            const sql = `
                SELECT 
                    c.name as category,
                    c.color,
                    current_year.total as current_year_total,
                    previous_year.total as previous_year_total,
                    (current_year.total - COALESCE(previous_year.total, 0)) as difference,
                    ROUND(((current_year.total - COALESCE(previous_year.total, 0)) / COALESCE(previous_year.total, current_year.total)) * 100, 2) as percentage_change
                FROM categories c
                LEFT JOIN (
                    SELECT category_id, SUM(amount) as total
                    FROM transactions 
                    WHERE strftime('%Y', transaction_date) = ? AND type = 'expense'
                    GROUP BY category_id
                ) current_year ON c.id = current_year.category_id
                LEFT JOIN (
                    SELECT category_id, SUM(amount) as total
                    FROM transactions 
                    WHERE strftime('%Y', transaction_date) = ? AND type = 'expense'
                    GROUP BY category_id
                ) previous_year ON c.id = previous_year.category_id
                WHERE current_year.total IS NOT NULL OR previous_year.total IS NOT NULL
                ORDER BY ABS(percentage_change) DESC
            `;
            
            return await this.db.all(sql, [currentYear, previousYear]);
        } catch (error) {
            throw new Error(`Failed to get year-over-year comparison: ${error.message}`);
        }
    }
}

module.exports = ReportsManager;