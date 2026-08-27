-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE meal_segment AS ENUM (
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks'
);

-- ============================================================
-- USER SETTINGS TABLE
-- ============================================================
CREATE TABLE user_settings (
    id varchar(50) PRIMARY KEY,
    weight_kg numeric(5, 2),
    baseline_calories numeric(7, 2) NOT NULL DEFAULT 2000.0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DAILY ACTIVITIES TABLE
-- ============================================================
CREATE TABLE daily_activities (
    id serial PRIMARY KEY,
    date varchar(10) NOT NULL UNIQUE,
    steps integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_daily_activities_date ON daily_activities(date);

-- ============================================================
-- MEALS TABLE
-- ============================================================
CREATE TABLE meals (
    id varchar(36) PRIMARY KEY,
    meal_text text NOT NULL,
    segment meal_segment NOT NULL,
    date varchar(10) NOT NULL,
    calories numeric(7, 2) NOT NULL,
    protein numeric(6, 2) NOT NULL DEFAULT 0,
    carbs numeric(6, 2) NOT NULL DEFAULT 0,
    fibre numeric(6, 2) NOT NULL DEFAULT 0,
    fats numeric(6, 2) NOT NULL DEFAULT 0,
    confidence numeric(4, 3),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meals_date ON meals(date);
CREATE INDEX idx_meals_created_at ON meals(created_at);
CREATE INDEX idx_meals_segment ON meals(segment);

-- ============================================================
-- MEAL PRESETS TABLE
-- ============================================================
CREATE TABLE presets (
    id varchar(36) PRIMARY KEY,
    name varchar(60),
    meal_text text NOT NULL,
    calories numeric(7, 2) NOT NULL,
    protein numeric(6, 2) NOT NULL DEFAULT 0,
    carbs numeric(6, 2) NOT NULL DEFAULT 0,
    fibre numeric(6, 2) NOT NULL DEFAULT 0,
    fats numeric(6, 2) NOT NULL DEFAULT 0,
    confidence numeric(4, 3),
    use_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_presets_use_count ON presets(use_count DESC);
CREATE INDEX idx_presets_created_at ON presets(created_at DESC);

-- ============================================================
-- STATUS CHECKS TABLE (HEALTH MONITORING)
-- ============================================================
CREATE TABLE status_checks (
    id varchar(36) PRIMARY KEY,
    client_name varchar(255) NOT NULL,
    timestamp timestamptz NOT NULL DEFAULT NOW()
);
