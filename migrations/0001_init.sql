-- D1 Database Initialization Schema
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    file_hash TEXT UNIQUE NOT NULL,
    file_name TEXT NOT NULL,
    bank_name TEXT,
    account_number_mask TEXT,
    statement_period TEXT,
    total_deposits REAL DEFAULT 0,
    total_withdrawals REAL DEFAULT 0,
    deposit_count INTEGER DEFAULT 0,
    withdrawal_count INTEGER DEFAULT 0,
    avg_daily_balance REAL DEFAULT 0,
    nsf_count INTEGER DEFAULT 0,
    mca_stacking_detected INTEGER DEFAULT 0,
    raw_json TEXT NOT NULL,
    model_used TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);
