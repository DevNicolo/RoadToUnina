CREATE TYPE game_status AS ENUM ('playing', 'won', 'abandoned');

-- tabella Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- tabella GameSessions
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_page VARCHAR(255) NOT NULL,
    target_page VARCHAR(255) NOT NULL,
    path TEXT[] NOT NULL DEFAULT '{}',
    steps INTEGER NOT NULL DEFAULT 0,
    start_time BIGINT NOT NULL, 
    status game_status NOT NULL DEFAULT 'playing',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);