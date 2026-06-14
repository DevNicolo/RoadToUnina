import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'RoadToUnina',
  password: process.env.DB_PASSWORD || 'Admin',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('error', (err, client) => {
  console.error('Errore inaspettato nel pool di connessione a PostgreSQL:', err);
});

export const findUserByUsername = async (username: string) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};

export const createUser = async (username: string, passwordHash: string) => {
  const result = await pool.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
    [username, passwordHash]
  );
  return result.rows[0];
};



// Game

export const createGameSession = async (userId: string, currentPage: string, targetPage: string, path: string[], startTime: number) => {
  const result = await pool.query(
    'INSERT INTO game_sessions (user_id, current_page, target_page, path, start_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, currentPage, targetPage, path, startTime]
  );
  return result.rows[0];
};

export const findGameSession = async (gameId: string, userId: string) => {
  const result = await pool.query('SELECT * FROM game_sessions WHERE id = $1 AND user_id = $2', [gameId, userId]);
  return result.rows[0];
};

export const updateGameSessionMove = async (gameId: string, newPage: string, newStatus: string) => {
  const result = await pool.query(
    `UPDATE game_sessions 
     SET current_page = $1::varchar, 
         path = array_append(path, $1::text), 
         steps = steps + 1, 
         status = $2::game_status, 
         last_updated = CURRENT_TIMESTAMP 
     WHERE id = $3 
     RETURNING *`,
    [newPage, newStatus, gameId]
  );
  return result.rows[0];
};

export const findActiveGameSession = async (userId: string) => {
  const result = await pool.query(
    "SELECT * FROM game_sessions WHERE user_id = $1 AND status = 'playing' ORDER BY last_updated DESC LIMIT 1",
    [userId]
  );
  return result.rows[0];
};

export const abandonGameSession = async (gameId: string, userId: string) => {
  await pool.query(
    "UPDATE game_sessions SET status = 'abandoned'::game_status, last_updated = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2", 
    [gameId, userId]
  );
};

export const getLeaderboard = async () => {
  const result = await pool.query(
    `WITH user_stats AS (
         SELECT user_id, COUNT(id) AS games_won, MIN(steps) AS best_steps
         FROM game_sessions
         WHERE status = 'won'
         GROUP BY user_id
     ),
     best_games AS (
         SELECT DISTINCT ON (user_id) user_id, steps, path, 
                ROUND(EXTRACT(EPOCH FROM last_updated) * 1000 - start_time) as total_time_ms
         FROM game_sessions
         WHERE status = 'won'
         ORDER BY user_id, steps ASC, ROUND(EXTRACT(EPOCH FROM last_updated) * 1000 - start_time) ASC
     )
     SELECT u.username, bg.steps, bg.path, bg.total_time_ms, us.games_won
     FROM user_stats us
     JOIN best_games bg ON us.user_id = bg.user_id
     JOIN users u ON us.user_id = u.id
     ORDER BY bg.steps ASC, us.games_won DESC, bg.total_time_ms ASC
     LIMIT 10`
  );
  return result.rows;
};

export const getRecentGames = async () => {
  const result = await pool.query(
    `SELECT u.username, g.status, g.path[1] as start_page, g.path, g.steps, 
            ROUND(EXTRACT(EPOCH FROM g.last_updated) * 1000 - g.start_time) as total_time_ms
     FROM game_sessions g
     JOIN users u ON g.user_id = u.id
     WHERE g.status != 'playing'
     ORDER BY g.last_updated DESC
     LIMIT 100`
  );
  return result.rows;
};

export default {
  pool,
  findUserByUsername,
  createUser,
  createGameSession,
  findGameSession,
  updateGameSessionMove,
  findActiveGameSession,
  abandonGameSession,
  getLeaderboard,
  getRecentGames
};
