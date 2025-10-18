// Personal Budget Tracker - Main JavaScript File

// Global Variables
let categories = [];
let accounts = [];
let spendingChart = null;

// Utility Functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

// Loading and Error Handling
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showSuccess(message) {
    // Create a simple success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #d4edda;
        color: #155724;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        border-left: 4px solid #27ae60;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showError(message) {
    // Create a simple error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        border-left: 4px solid #e74c3c;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Mock API Functions (In a real app, these would make HTTP requests)
async function mockApiCall(endpoint, data = null) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    
    switch (endpoint) {
        case 'categories':
            return [
                { id: 1, name: 'Salary', type: 'income', color: '#27ae60' },
                { id: 2, name: 'Freelance', type: 'income', color: '#2ecc71' },
                { id: 3, name: 'Investment', type: 'income', color: '#16a085' },
                { id: 4, name: 'Groceries', type: 'expense', color: '#e74c3c' },
                { id: 5, name: 'Rent', type: 'expense', color: '#c0392b' },
                { id: 6, name: 'Utilities', type: 'expense', color: '#f39c12' },
                { id: 7, name: 'Transportation', type: 'expense', color: '#9b59b6' },
                { id: 8, name: 'Entertainment', type: 'expense', color: '#e67e22' },
                { id: 9, name: 'Healthcare', type: 'expense', color: '#34495e' },
                { id: 10, name: 'Dining Out', type: 'expense', color: '#e91e63' },
                { id: 11, name: 'Shopping', type: 'expense', color: '#8e44ad' },
                { id: 12, name: 'Insurance', type: 'expense', color: '#2c3e50' }
            ];
            
        case 'accounts':
            return [
                { id: 1, name: 'Main Checking', type: 'checking', balance: 2500.00 },
                { id: 2, name: 'Savings Account', type: 'savings', balance: 15000.00 },
                { id: 3, name: 'Credit Card', type: 'credit', balance: -850.00 },
                { id: 4, name: 'Cash Wallet', type: 'cash', balance: 200.00 }
            ];
            
        case 'transactions':
            return [
                {
                    id: 1, amount: 3500.00, description: 'Monthly Salary', category_id: 1,
                    account_id: 1, transaction_date: '2025-08-01', type: 'income',
                    category_name: 'Salary', category_color: '#27ae60',
                    account_name: 'Main Checking', account_type: 'checking'
                },
                {
                    id: 2, amount: 1200.00, description: 'Monthly Rent', category_id: 5,
                    account_id: 1, transaction_date: '2025-08-01', type: 'expense',
                    category_name: 'Rent', category_color: '#c0392b',
                    account_name: 'Main Checking', account_type: 'checking'
                },
                {
                    id: 3, amount: 450.00, description: 'Weekly Groceries', category_id: 4,
                    account_id: 1, transaction_date: '2025-08-03', type: 'expense',
                    category_name: 'Groceries', category_color: '#e74c3c',
                    account_name: 'Main Checking', account_type: 'checking'
                },
                {
                    id: 4, amount: 800.00, description: 'Freelance Project', category_id: 2,
                    account_id: 1, transaction_date: '2025-08-05', type: 'income',
                    category_name: 'Freelance', category_color: '#2ecc71',
                    account_name: 'Main Checking', account_type: 'checking'
                },
                {
                    id: 5, amount: 65.00, description: 'Dinner Out', category_id: 10,
                    account_id: 3, transaction_date: '2025-08-04', type: 'expense',
                    category_name: 'Dining Out', category_color: '#e91e63',
                    account_name: 'Credit Card', account_type: 'credit'
                }
            ];
            
        case 'financialSummary':
            return {
                income: { total: 4450.00, count: 3 },
                expenses: { total: 1715.00, count: 3 },
                netIncome: 2735.00,
                accounts: [
                    { name: 'Main Checking', type: 'checking', balance: 2500.00 },
                    { name: 'Savings Account', type: 'savings', balance: 15000.00 },
                    { name: 'Credit Card', type: 'credit', balance: -850.00 },
                    { name: 'Cash Wallet', type: 'cash', balance: 200.00 }
                ],
                totalAssets: 17700.00,
                totalLiabilities: 850.00,
                netWorth: 16850.00,
                budgetStatus: [
                    {
                        category: 'Groceries', limit_amount: 800.00, spent: 450.00,
                        usage_percent: 56.25, remaining: 350.00
                    },
                    {
                        category: 'Rent', limit_amount: 1200.00, spent: 1200.00,
                        usage_percent: 100.00, remaining: 0.00
                    }
                ]
            };
            
        case 'monthlySpendingReport':
            return [
                {
                    category: 'Rent', color: '#c0392b', total_spent: 1200.00,
                    transaction_count: 1, avg_transaction: 1200.00, budget_limit: 1200.00,
                    budget_usage_percent: 100.00
                },
                {
                    category: 'Groceries', color: '#e74c3c', total_spent: 450.00,
                    transaction_count: 1, avg_transaction: 450.00, budget_limit: 800.00,
                    budget_usage_percent: 56.25
                },
                {
                    category: 'Dining Out', color: '#e91e63', total_spent: 65.00,
                    transaction_count: 1, avg_transaction: 65.00, budget_limit: 300.00,
                    budget_usage_percent: 21.67
                }
            ];
            
        case 'monthlyIncomeReport':
            return [
                {
                    category: 'Salary', color: '#27ae60', total_income: 3500.00,
                    transaction_count: 1, avg_transaction: 3500.00
                },
                {
                    category: 'Freelance', color: '#2ecc71', total_income: 800.00,
                    transaction_count: 1, avg_transaction: 800.00
                },
                {
                    category: 'Investment', color: '#16a085', total_income: 150.00,
                    transaction_count: 1, avg_transaction: 150.00
                }
            ];
            
        case 'budgetPerformance':
            return [
                {
                    category: 'Rent', color: '#c0392b', budget: 1200.00, spent: 1200.00,
                    remaining: 0.00, usage_percent: 100.00, status: 'good', transaction_count: 1
                },
                {
                    category: 'Groceries', color: '#e74c3c', budget: 800.00, spent: 450.00,
                    remaining: 350.00, usage_percent: 56.25, status: 'good', transaction_count: 1
                },
                {
                    category: 'Dining Out', color: '#e91e63', budget: 300.00, spent: 65.00,
                    remaining: 235.00, usage_percent: 21.67, status: 'good', transaction_count: 1
                }
            ];
            
        case 'topSpendingCategories':
            return [
                {
                    category: 'Rent', color: '#c0392b', total_spent: 1200.00,
                    transaction_count: 1, avg_per_transaction: 1200.00, percentage_of_total: 69.97
                },
                {
                    category: 'Groceries', color: '#e74c3c', total_spent: 450.00,
                    transaction_count: 1, avg_per_transaction: 450.00, percentage_of_total: 26.24
                },
                {
                    category: 'Dining Out', color: '#e91e63', total_spent: 65.00,
                    transaction_count: 1, avg_per_transaction: 65.00, percentage_of_total: 3.79
                }
            ];
            
        case 'accountPerformance':
            return [
                {
                    account_name: 'Main Checking', account_type: 'checking',
                    current_balance: 2500.00, total_income: 4300.00, total_expenses: 1650.00,
                    net_flow: 2650.00, income_count: 2, expense_count: 2
                },
                {
                    account_name: 'Savings Account', account_type: 'savings',
                    current_balance: 15000.00, total_income: 150.00, total_expenses: 0.00,
                    net_flow: 150.00, income_count: 1, expense_count: 0
                },
                {
                    account_name: 'Credit Card', account_type: 'credit',
                    current_balance: -850.00, total_income: 0.00, total_expenses: 65.00,
                    net_flow: -65.00, income_count: 0, expense_count: 1
                },
                {
                    account_name: 'Cash Wallet', account_type: 'cash',
                    current_balance: 200.00, total_income: 0.00, total_expenses: 25.00,
                    net_flow: -25.00, income_count: 0, expense_count: 1
                }
            ];
            
        case 'incomeVsExpenses':
            const months = [];
            const currentDate = new Date();
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
                
                // Mock data with some variation
                const baseIncome = 4000 + (Math.random() * 1000 - 500);
                const baseExpenses = 2800 + (Math.random() * 800 - 400);
                
                months.push({
                    month: monthKey,
                    income: Math.round(baseIncome * 100) / 100,
                    expenses: Math.round(baseExpenses * 100) / 100,
                    netIncome: Math.round((baseIncome - baseExpenses) * 100) / 100,
                    savingsRate: ((baseIncome - baseExpenses) / baseIncome * 100).toFixed(2)
                });
            }
            return months;
            
        case 'spendingTrends':
            const trendMonths = [];
            const trendCategories = ['Groceries', 'Rent', 'Utilities', 'Transportation', 'Entertainment'];
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
                
                trendCategories.forEach(category => {
                    const baseAmount = {
                        'Groceries': 500,
                        'Rent': 1200,
                        'Utilities': 200,
                        'Transportation': 300,
                        'Entertainment': 150
                    }[category];
                    
                    trendMonths.push({
                        month: monthKey,
                        category: category,
                        total: Math.round((baseAmount + (Math.random() * 200 - 100)) * 100) / 100,
                        color: {
                            'Groceries': '#e74c3c',
                            'Rent': '#c0392b',
                            'Utilities': '#f39c12',
                            'Transportation': '#9b59b6',
                            'Entertainment': '#e67e22'
                        }[category]
                    });
                });
            }
            return trendMonths;
            
        case 'yearOverYearComparison':
            return [
                {
                    category: 'Groceries', color: '#e74c3c',
                    current_year_total: 5400.00, previous_year_total: 5000.00,
                    difference: 400.00, percentage_change: 8.0
                },
                {
                    category: 'Rent', color: '#c0392b',
                    current_year_total: 14400.00, previous_year_total: 13800.00,
                    difference: 600.00, percentage_change: 4.3
                },
                {
                    category: 'Utilities', color: '#f39c12',
                    current_year_total: 2200.00, previous_year_total: 2400.00,
                    difference: -200.00, percentage_change: -8.3
                }
            ];
            
        case 'addTransaction':
            return { id: Math.floor(Math.random() * 10000), success: true };
            
        case 'updateTransaction':
            return { success: true };
            
        case 'deleteTransaction':
            return { success: true };
            
        case 'setBudgetLimit':
            return { success: true, id: Math.floor(Math.random() * 1000) };
            
        default:
            throw new Error(`Unknown endpoint: ${endpoint}`);
    }
}

// Data Loading Functions
async function loadCategories() {
    try {
        categories = await mockApiCall('categories');
        populateCategorySelects();
    } catch (error) {
        throw new Error(`Failed to load categories: ${error.message}`);
    }
}

async function loadAccounts() {
    try {
        accounts = await mockApiCall('accounts');
        populateAccountSelects();
    } catch (error) {
        throw new Error(`Failed to load accounts: ${error.message}`);
    }
}

function populateCategorySelects() {
    const selects = document.querySelectorAll('select[id*="Category"]');
    selects.forEach(select => {
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            option.dataset.type = category.type;
            select.appendChild(option);
        });
    });
}

function populateAccountSelects() {
    const selects = document.querySelectorAll('select[id*="Account"]');
    selects.forEach(select => {
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.name} (${formatCurrency(account.balance)})`;
            select.appendChild(option);
        });
    });
}

function filterCategoriesByType(type) {
    const categorySelect = document.getElementById('transactionCategory');
    if (!categorySelect) return;
    
    // Clear and repopulate
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    categories
        .filter(category => category.type === type)
        .forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
}

// Dashboard Functions
async function initializeDashboard() {
    try {
        showLoading();
        
        await Promise.all([
            loadCategories(),
            loadAccounts(),
            loadDashboardData()
        ]);
        
        populateMonthSelect();
        await loadSpendingChart();
        
    } catch (error) {
        showError('Failed to initialize dashboard: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function loadDashboardData() {
    try {
        const [summaryData, recentTransactions] = await Promise.all([
            mockApiCall('financialSummary'),
            mockApiCall('transactions')
        ]);
        
        updateSummaryCards(summaryData);
        displayRecentTransactions(recentTransactions.slice(0, 5));
        displayAccountBalances(summaryData.accounts);
        displayBudgetProgress(summaryData.budgetStatus);
        
    } catch (error) {
        throw error;
    }
}

function updateSummaryCards(data) {
    const totalIncome = document.getElementById('totalIncome');
    const totalExpenses = document.getElementById('totalExpenses');
    const netIncome = document.getElementById('netIncome');
    const netWorth = document.getElementById('netWorth');
    
    if (totalIncome) totalIncome.textContent = formatCurrency(data.income.total);
    if (totalExpenses) totalExpenses.textContent = formatCurrency(data.expenses.total);
    if (netIncome) {
        netIncome.textContent = formatCurrency(data.netIncome);
        netIncome.className = `amount ${data.netIncome >= 0 ? 'income' : 'expense'}`;
    }
    if (netWorth) netWorth.textContent = formatCurrency(data.netWorth);
}

function displayRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="no-data">No recent transactions</p>';
        return;
    }
    
    transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const date = new Date(transaction.transaction_date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-details">
                    ${transaction.category_name} • ${transaction.account_name} • ${formattedDate}
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'expense' ? '-' : '+'}${formatCurrency(transaction.amount)}
            </div>
        `;
        
        container.appendChild(item);
    });
}

function displayAccountBalances(accounts) {
    const container = document.getElementById('accountBalances');
    if (!container) return;
    
    container.innerHTML = '';
    
    accounts.forEach(account => {
        const item = document.createElement('div');
        item.className = 'account-item';
        
        item.innerHTML = `
            <div class="account-info">
                <h4>${account.name}</h4>
                <span class="account-type">${account.type}</span>
            </div>
            <div class="account-balance">${formatCurrency(account.balance)}</div>
        `;
        
        container.appendChild(item);
    });
}

function displayBudgetProgress(budgetStatus) {
    const container = document.getElementById('budgetProgress');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (budgetStatus.length === 0) {
        container.innerHTML = '<p class="no-data">No budget limits set</p>';
        return;
    }
    
    budgetStatus.forEach(budget => {
        const item = document.createElement('div');
        item.className = 'budget-item';
        
        const statusClass = budget.usage_percent > 100 ? 'over-budget' :
                           budget.usage_percent > 80 ? 'warning' : 'good';
        
        item.innerHTML = `
            <div class="budget-header">
                <span class="category-name">${budget.category}</span>
                <span class="budget-amount">${formatCurrency(budget.spent)} / ${formatCurrency(budget.limit_amount)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${statusClass}" style="width: ${Math.min(budget.usage_percent, 100)}%"></div>
            </div>
            <div class="budget-details">
                <span class="usage-percent">${budget.usage_percent.toFixed(1)}% used</span>
                <span class="remaining">${formatCurrency(budget.remaining)} remaining</span>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function populateMonthSelect() {
    const select = document.getElementById('monthSelect');
    if (!select) return;
    
    const currentDate = new Date();
    
    // Add current month and previous 11 months
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const value = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        const text = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        if (i === 0) option.selected = true;
        
        select.appendChild(option);
    }
}

async function loadSpendingChart() {
    try {
        const monthYear = document.getElementById('monthSelect')?.value || getCurrentMonthYear();
        const data = await mockApiCall('topSpendingCategories', { 
            period: 'current-month', 
            limit: 8 
        });
        
        const ctx = document.getElementById('spendingChart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (spendingChart) {
            spendingChart.destroy();
        }
        
        spendingChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.category),
                datasets: [{
                    data: data.map(item => item.total_spent),
                    backgroundColor: data.map(item => item.color),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Failed to load spending chart:', error);
    }
}

// Modal Functions
function showTransactionModal(type, transactionId = null) {
    const modal = document.getElementById('transactionModal');
    if (!modal) return;
    
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.querySelector('#transactionForm button[type="submit"]');
    const form = document.getElementById('transactionForm');
    
    // Reset form
    form.reset();
    document.getElementById('transactionType').value = type;
    document.getElementById('transactionDate').value = formatDate(new Date());
    
    if (transactionId) {
        modalTitle.textContent = `Edit ${type === 'income' ? 'Income' : 'Expense'}`;
        submitBtn.textContent = 'Update Transaction';
        // In a real app, you would load the transaction data here
    } else {
        modalTitle.textContent = `Add ${type === 'income' ? 'Income' : 'Expense'}`;
        submitBtn.textContent = 'Add Transaction';
    }
    
    // Filter categories by type
    filterCategoriesByType(type);
    
    modal.style.display = 'block';
}

function showBudgetModal() {
    const modal = document.getElementById('budgetModal');
    if (!modal) return;
    
    const form = document.getElementById('budgetForm');
    form.reset();
    
    // Set current month as default
    const currentDate = new Date();
    const monthValue = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
    document.getElementById('budgetMonth').value = monthValue;
    
    // Filter categories to only show expense categories
    const categorySelect = document.getElementById('budgetCategory');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        categories
            .filter(category => category.type === 'expense')
            .forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
    }
    
    modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Handle transaction form submission
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }
    
    // Handle budget form submission
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', handleBudgetSubmit);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
});

async function handleTransactionSubmit(event) {
    event.preventDefault();
    
    const formData = {
        amount: parseFloat(document.getElementById('transactionAmount').value),
        description: document.getElementById('transactionDescription').value,
        categoryId: parseInt(document.getElementById('transactionCategory').value),
        accountId: parseInt(document.getElementById('transactionAccount').value),
        transactionDate: document.getElementById('transactionDate').value,
        type: document.getElementById('transactionType').value
    };
    
    try {
        showLoading();
        
        // In a real app, this would be an API call
        await mockApiCall('addTransaction', formData);
        
        showSuccess('Transaction added successfully!');
        closeModal('transactionModal');
        
        // Refresh dashboard data if we're on the dashboard
        if (typeof loadDashboardData === 'function') {
            await loadDashboardData();
            await loadSpendingChart();
        }
        
    } catch (error) {
        showError('Failed to add transaction: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function handleBudgetSubmit(event) {
    event.preventDefault();
    
    const formData = {
        categoryId: parseInt(document.getElementById('budgetCategory').value),
        monthYear: document.getElementById('budgetMonth').value,
        limitAmount: parseFloat(document.getElementById('budgetAmount').value)
    };
    
    try {
        showLoading();
        
        await mockApiCall('setBudgetLimit', formData);
        
        showSuccess('Budget limit set successfully!');
        closeModal('budgetModal');
        
        // Refresh dashboard data
        if (typeof loadDashboardData === 'function') {
            await loadDashboardData();
        }
        
    } catch (error) {
        showError('Failed to set budget limit: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Utility function to get current month-year
function getCurrentMonthYear() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
}

// Export functions for use in other files
window.budgetTracker = {
    formatCurrency,
    formatDate,
    formatNumber,
    showLoading,
    hideLoading,
    showSuccess,
    showError,
    mockApiCall,
    loadCategories,
    loadAccounts,
    showTransactionModal,
    showBudgetModal,
    closeModal,
    getCurrentMonthYear,
    categories,
    accounts
};