-- Project APEX Master Schema DDL Migration (Master Plan §13.2 & §21)

-- 1. Runs Registry Table
CREATE TABLE IF NOT EXISTS runs (
    run_id VARCHAR PRIMARY KEY,      -- date_strategy_hash
    created_at TIMESTAMP,
    kind VARCHAR,                    -- 'miner1','miner2','validation','wf','live','manual'
    strategy VARCHAR,
    params_json VARCHAR,
    pair VARCHAR,
    timeframe VARCHAR,
    data_start DATE,
    data_end DATE,
    cost_config VARCHAR,
    git_commit VARCHAR,
    seed INTEGER,
    n_variants INTEGER,              -- For DSR accounting (miner runs)
    metrics_json VARCHAR,
    status VARCHAR                   -- 'screened','validated','killed','live','benched'
);

-- 2. Labeled Trade Database Table ("The Edge Mine")
CREATE TABLE IF NOT EXISTS trades (
    trade_id BIGINT PRIMARY KEY,
    run_id VARCHAR REFERENCES runs(run_id),
    strategy VARCHAR,
    pair VARCHAR,
    timeframe VARCHAR,
    direction VARCHAR,               -- 'long'/'short'
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    entry_price DOUBLE,
    exit_price DOUBLE,
    qty DOUBLE,
    pnl_quote DOUBLE,                -- P&L in USDT
    pnl_pct DOUBLE,                  -- % on notional
    pnl_r DOUBLE,                    -- P&L in R-multiples
    fees DOUBLE,
    slippage DOUBLE,
    mae_pct DOUBLE,                  -- Maximum Adverse Excursion
    mfe_pct DOUBLE,                  -- Maximum Favorable Excursion
    bars_held INTEGER,
    exit_reason VARCHAR,             -- 'tp','sl','trail','time','signal','manual'
    source VARCHAR,                  -- 'backtest','paper','live'
    
    -- EDGE LABELS (The Gold):
    hour_utc INTEGER,
    day_of_week INTEGER,
    week_of_month INTEGER,
    month INTEGER,
    session VARCHAR,                 -- 'asia','europe','us','overlap','off'
    trend_regime VARCHAR,            -- 'up','down','range'
    vol_regime VARCHAR,              -- 'low','mid','high','extreme'
    rsi_at_entry DOUBLE,
    adx_at_entry DOUBLE,
    atr_pctile DOUBLE,
    dist_vwap_pct DOUBLE,
    funding_z DOUBLE,
    is_event_day BOOLEAN,
    minutes_to_event INTEGER,
    feature_version VARCHAR
);

-- 3. Edge Cards Table
CREATE TABLE IF NOT EXISTS edge_cards (
    card_id BIGINT PRIMARY KEY,
    strategy VARCHAR,
    pair VARCHAR,
    filter_json VARCHAR,             -- The slice definition
    n_trades INTEGER,
    expectancy_r DOUBLE,
    win_rate DOUBLE,
    profit_factor DOUBLE,
    sharpe DOUBLE,
    in_sample_ok BOOLEAN,
    oos_ok BOOLEAN,
    p_value DOUBLE,
    status VARCHAR,                  -- 'active','provisional','retired'
    created_at TIMESTAMP,
    last_validated TIMESTAMP
);

-- 4. Live Operating Journal Table
CREATE TABLE IF NOT EXISTS live_journal (
    journal_id BIGINT PRIMARY KEY,
    trade_id BIGINT,                 -- FK to trades (source='live')
    planned BOOLEAN,                 -- Was it on an active Edge Card?
    checklist_ok BOOLEAN,
    emotion_score INTEGER,           -- 1-5 self rating at entry
    screenshot VARCHAR,
    notes VARCHAR,
    created_at TIMESTAMP
);

-- 5. Supporting Tables (§21)
CREATE TABLE IF NOT EXISTS equity_curves (
    run_id VARCHAR,
    ts TIMESTAMP,
    equity DOUBLE,
    PRIMARY KEY (run_id, ts)
);

CREATE TABLE IF NOT EXISTS allocations (
    month DATE,
    strategy VARCHAR,
    weight DOUBLE,
    method VARCHAR,
    created_at TIMESTAMP,
    PRIMARY KEY (month, strategy, method)
);

CREATE TABLE IF NOT EXISTS breaker_events (
    event_id BIGINT PRIMARY KEY,
    ts TIMESTAMP,
    kind VARCHAR,                    -- 'daily_loss','weekly_loss','strategy_dd','portfolio_dd','lockout'
    detail VARCHAR,
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decay_events (
    event_id BIGINT PRIMARY KEY,
    ts TIMESTAMP,
    strategy VARCHAR,
    z_score DOUBLE,
    action VARCHAR,
    note VARCHAR
);

CREATE TABLE IF NOT EXISTS data_quality_log (
    log_id BIGINT PRIMARY KEY,
    ts TIMESTAMP,
    pair VARCHAR,
    timeframe VARCHAR,
    check_name VARCHAR,
    severity VARCHAR,
    detail VARCHAR
);

-- 6. Analytical Views (§13.4)
CREATE VIEW IF NOT EXISTS v_strategy_summary AS
SELECT 
    strategy, 
    pair, 
    source, 
    COUNT(*) AS n,
    AVG(pnl_r) AS exp_r, 
    SUM(pnl_quote) AS pnl,
    AVG(CASE WHEN pnl_r > 0 THEN 1.0 ELSE 0.0 END) * 100 AS winrate,
    SUM(CASE WHEN pnl_r > 0 THEN pnl_r ELSE 0 END) / NULLIF(-SUM(CASE WHEN pnl_r < 0 THEN pnl_r ELSE 0 END), 0) AS pf
FROM trades 
GROUP BY 1, 2, 3;

CREATE VIEW IF NOT EXISTS v_hourly AS
SELECT
    strategy,
    pair,
    hour_utc,
    COUNT(*) AS n,
    AVG(pnl_r) AS exp_r,
    AVG(CASE WHEN pnl_r > 0 THEN 1.0 ELSE 0.0 END) * 100 AS winrate,
    SUM(CASE WHEN pnl_r > 0 THEN pnl_r ELSE 0 END) / NULLIF(-SUM(CASE WHEN pnl_r < 0 THEN pnl_r ELSE 0 END), 0) AS pf
FROM trades
GROUP BY 1, 2, 3;

CREATE VIEW IF NOT EXISTS v_daily AS
SELECT
    strategy,
    pair,
    day_of_week,
    COUNT(*) AS n,
    AVG(pnl_r) AS exp_r,
    AVG(CASE WHEN pnl_r > 0 THEN 1.0 ELSE 0.0 END) * 100 AS winrate,
    SUM(CASE WHEN pnl_r > 0 THEN pnl_r ELSE 0 END) / NULLIF(-SUM(CASE WHEN pnl_r < 0 THEN pnl_r ELSE 0 END), 0) AS pf
FROM trades
GROUP BY 1, 2, 3;

CREATE VIEW IF NOT EXISTS v_session AS
SELECT
    strategy,
    pair,
    session,
    COUNT(*) AS n,
    AVG(pnl_r) AS exp_r,
    AVG(CASE WHEN pnl_r > 0 THEN 1.0 ELSE 0.0 END) * 100 AS winrate,
    SUM(CASE WHEN pnl_r > 0 THEN pnl_r ELSE 0 END) / NULLIF(-SUM(CASE WHEN pnl_r < 0 THEN pnl_r ELSE 0 END), 0) AS pf
FROM trades
GROUP BY 1, 2, 3;

CREATE VIEW IF NOT EXISTS v_regime AS
SELECT
    strategy,
    pair,
    trend_regime,
    vol_regime,
    COUNT(*) AS n,
    AVG(pnl_r) AS exp_r,
    AVG(CASE WHEN pnl_r > 0 THEN 1.0 ELSE 0.0 END) * 100 AS winrate,
    SUM(CASE WHEN pnl_r > 0 THEN pnl_r ELSE 0 END) / NULLIF(-SUM(CASE WHEN pnl_r < 0 THEN pnl_r ELSE 0 END), 0) AS pf
FROM trades
GROUP BY 1, 2, 3, 4;
