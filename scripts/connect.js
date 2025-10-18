// Database Connection Module for Personal Budget Tracker
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../database/budget.db');
    }

    // Initialize database connection
    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON');
                    resolve();
                }
            });
        });
    }

    // Close database connection
    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // Execute a single SQL query
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('Error running query:', err.message);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Get a single row
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('Error getting row:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Get all rows
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Error getting rows:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Initialize database with tables
    async initializeDatabase() {
        try {
            // Read and execute create tables script
            const fs = require('fs');
            const createTablesScript = fs.readFileSync(
                path.join(__dirname, '../database/create_tables.sql'), 
                'utf8'
            );

            // Split script by semicolons and execute each statement
            const statements = createTablesScript
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            for (const statement of statements) {
                if (statement.toLowerCase().startsWith('select')) {
                    // Skip SELECT statements (messages)
                    continue;
                }
                await this.run(statement);
            }

            console.log('Database initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing database:', error.message);
            throw error;
        }
    }

    // Load sample data
    async loadSampleData() {
        try {
            const fs = require('fs');
            const sampleDataScript = fs.readFileSync(
                path.join(__dirname, '../database/sample_data.sql'), 
                'utf8'
            );

            // Split script by semicolons and execute each statement
            const statements = sampleDataScript
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            for (const statement of statements) {
                if (statement.toLowerCase().startsWith('select')) {
                    // Skip SELECT statements (messages)
                    continue;
                }
                await this.run(statement);
            }

            console.log('Sample data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading sample data:', error.message);
            throw error;
        }
    }

    // Transaction wrapper for multiple operations
    async runTransaction(operations) {
        return new Promise(async (resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                
                Promise.all(operations.map(op => {
                    if (typeof op === 'function') {
                        return op();
                    } else if (op.sql) {
                        return this.run(op.sql, op.params);
                    }
                }))
                .then((results) => {
                    this.db.run('COMMIT', (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                })
                .catch((error) => {
                    this.db.run('ROLLBACK', (rollbackErr) => {
                        if (rollbackErr) {
                            console.error('Rollback error:', rollbackErr);
                        }
                        reject(error);
                    });
                });
            });
        });
    }

    // Health check
    async healthCheck() {
        try {
            const result = await this.get('SELECT 1 as test');
            return result.test === 1;
        } catch (error) {
            console.error('Health check failed:', error.message);
            return false;
        }
    }
}

// Singleton instance
let dbInstance = null;

// Get database instance
function getDatabase() {
    if (!dbInstance) {
        dbInstance = new Database();
    }
    return dbInstance;
}

// Initialize and connect to database
async function initializeApp() {
    const db = getDatabase();
    await db.connect();
    
    // Check if tables exist, if not create them
    try {
        await db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="categories"');
    } catch (error) {
        console.log('Tables not found, initializing database...');
        await db.initializeDatabase();
        await db.loadSampleData();
    }
    
    return db;
}

module.exports = {
    Database,
    getDatabase,
    initializeApp
};