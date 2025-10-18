# Personal Budget Tracker

A comprehensive personal finance management application built with Node.js, SQLite, and vanilla JavaScript. Track your income, expenses, set budgets, and generate detailed financial reports to take control of your personal finances.

![Budget Tracker Dashboard](https://via.placeholder.com/800x400/667eea/ffffff?text=Budget+Tracker+Dashboard)

## 🌟 Features

### 💰 Transaction Management
- Add, edit, and delete income and expense transactions
- Categorize transactions for better organization
- Support for multiple account types (checking, savings, credit, cash)
- Real-time balance updates across accounts
- Advanced search and filtering capabilities
- Bulk import/export functionality

### 📊 Financial Reporting
- Interactive dashboard with key financial metrics
- Monthly spending and income reports
- Budget vs. actual spending analysis
- Category-wise expense breakdown
- Spending trends and patterns analysis
- Year-over-year comparison reports
- Account performance tracking

### 🎯 Budget Planning
- Set monthly budget limits for expense categories
- Visual budget progress indicators
- Alerts for overspending and budget warnings
- Budget performance tracking
- Savings rate calculations

### 📱 User Experience
- Responsive design for desktop, tablet, and mobile
- Intuitive and modern user interface
- Real-time data updates
- Export capabilities for reports
- Keyboard shortcuts and accessibility features

## 🚀 Quick Start

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-budget-tracker.git
   cd personal-budget-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:init
   ```

4. **Load sample data (optional)**
   ```bash
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000` to access the application.

## 📁 Project Structure

```
budget-tracker/
├── database/
│   ├── schema.sql          # Database schema definition
│   ├── create_tables.sql   # Table creation scripts
│   └── sample_data.sql     # Sample data for testing
├── scripts/
│   ├── connect.js          # Database connection module
│   ├── transactions.js     # Transaction management logic
│   └── reports.js          # Reports and analytics module
├── frontend/
│   ├── index.html          # Dashboard page
│   ├── transactions.html   # Transaction management page
│   ├── reports.html        # Reports and analytics page
│   ├── style.css          # Main stylesheet
│   └── script.js          # Frontend JavaScript
├── package.json           # Project configuration
└── README.md             # Project documentation
```

## 💾 Database Schema

The application uses SQLite with the following main tables:

- **categories** - Income and expense categories
- **accounts** - Financial accounts (checking, savings, etc.)
- **transactions** - All financial transactions
- **budget_limits** - Monthly budget limits per category

See `database/schema.sql` for the complete database structure.

## 🔧 API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories & Accounts
- `GET /api/categories` - Get all categories
- `GET /api/accounts` - Get all accounts
- `POST /api/categories` - Add new category
- `POST /api/accounts` - Add new account

### Reports
- `GET /api/reports/summary` - Get financial summary
- `GET /api/reports/spending/:month` - Get monthly spending report
- `GET /api/reports/budget-performance/:month` - Get budget performance
- `GET /api/reports/trends` - Get spending trends

## 🛠️ Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run all tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run build` - Build production assets
- `npm run db:reset` - Reset database
- `npm run backup` - Backup database

### Development Setup

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Check code quality**
   ```bash
   npm run lint
   npm run format
   ```

### Adding New Features

1. **Database Changes**
   - Update `database/schema.sql` for new tables/columns
   - Create migration scripts if needed
   - Update sample data in `database/sample_data.sql`

2. **Backend Logic**
   - Add new functions to appropriate modules in `scripts/`
   - Follow the existing patterns for error handling
   - Add comprehensive tests for new functionality

3. **Frontend Updates**
   - Update HTML files for new UI components
   - Add styles to `frontend/style.css`
   - Implement JavaScript functionality in `frontend/script.js`

## 📊 Usage Examples

### Adding a Transaction

```javascript
// Example: Add a new expense
const transaction = {
    amount: 85.50,
    description: "Grocery shopping",
    categoryId: 4, // Groceries category
    accountId: 1,  // Main checking account
    transactionDate: "2025-08-08",
    type: "expense"
};

// This would be handled by the frontend form
await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
});
```

### Setting a Budget Limit

```javascript
// Example: Set monthly grocery budget
const budgetLimit = {
    categoryId: 4,        // Groceries
    monthYear: "2025-08", // August 2025
    limitAmount: 800.00
};
```

### Generating Reports

The application automatically generates various reports:

- **Monthly Summary**: Income vs expenses for the current month
- **Budget Performance**: How much you've spent vs your budget limits
- **Spending Trends**: Category-wise spending over time
- **Account Balances**: Current balances across all accounts

## 🔒 Security Considerations

- Input validation on all forms
- SQL injection prevention through parameterized queries
- XSS protection through proper data escaping
- CORS configuration for API access
- Rate limiting on API endpoints

## 🌐 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

If you find a bug, please create an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- System information (OS, browser, etc.)

## 💡 Feature Requests

We welcome feature requests! Please create an issue with:

- Clear description of the feature
- Use case and benefits
- Any implementation ideas

## 📞 Support

- Create an issue for bug reports and feature requests
- Check existing issues before creating new ones
- Provide as much detail as possible

## 🎯 Roadmap

### Upcoming Features

- [ ] Multi-currency support
- [ ] Recurring transaction templates
- [ ] Mobile app development
- [ ] Cloud synchronization
- [ ] Advanced analytics and insights
- [ ] Investment tracking
- [ ] Bill reminders and notifications
- [ ] Data export to popular accounting software
- [ ] Multi-user support
- [ ] Advanced reporting with charts and graphs

### Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced reporting and budget features
- **v1.2.0** - Mobile responsiveness improvements
- **v2.0.0** - Major UI overhaul and new features (planned)

---

Made with ❤️ for better personal finance