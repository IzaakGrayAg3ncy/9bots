const Database = require('better-sqlite3');
const db = new Database('kittencord_points.db');

// Initialize the database
db.exec(`
  CREATE TABLE IF NOT EXISTS user_points (
    user_id TEXT PRIMARY KEY,
    points INTEGER DEFAULT 0
  )
`);

function addPoints(userId, points) {
  const stmt = db.prepare('INSERT INTO user_points (user_id, points) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET points = points + ?');
  stmt.run(userId, points, points);
}

function getPoints(userId) {
  const stmt = db.prepare('SELECT points FROM user_points WHERE user_id = ?');
  const result = stmt.get(userId);
  return result ? result.points : 0;
}

function getLeaderboard() {
    const stmt = db.prepare('SELECT user_id, points FROM user_points ORDER BY points DESC');
    return stmt.all();
}

module.exports = { addPoints, getPoints, getLeaderboard };
