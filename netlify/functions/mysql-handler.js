const mysql = require("mysql2/promise");

const getConn = async () => {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
};

let pool;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });
  }
  return pool;
};

module.exports = {
  getPool
}

// 🔐 LOGIN QUERY
exports.getUserByName = async (username) => {
  const conn = getPool();
  const [rows] = await conn.execute(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  console.log("getUserByName rows:" , JSON.stringify(rows));

  return rows[0];
};

exports.getTransactions = async (userId) => {
  const conn = await getPool();
  const [rows] = await conn.execute(
    "SELECT * FROM transactions WHERE user_id = ?",
    [userId]
  );

  return rows;
};

exports.getSettings = async (userId) => {
  const conn = await getPool();
  const [rows] = await conn.execute(
    "SELECT * FROM settings WHERE id = ?",
    [userId]
  );

  return rows[0] || null;
};

// 🧾 INSERT
exports.insertTransaction = async (userId, d) => {
  const conn = await getPool();
  await conn.execute(
    `INSERT INTO transactions (user_id, username, time, amount, type, notes, payment_method, paid, bookmark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, d.username, d.time, d.amount, d.type,
      d.notes, d.payment_method, d.paid, d.bookmark
    ]
  );

};

// ✏️ UPDATE
exports.updateTransaction = async (userId, d) => {
  const conn = await getPool();
  await conn.execute(
    `UPDATE transactions SET
     username=?, time=?, amount=?, type=?, notes=?,
     payment_method=?, paid=?, bookmark=?
     WHERE id=? AND user_id=?`,
    [
      d.username, d.time, d.amount, d.type, d.notes,
      d.payment_method, d.paid, d.bookmark,
      d.id, userId
    ]
  );

};

// ❌ DELETE
exports.deleteTransaction = async (user_id, d) => {
  const conn = await getPool();
  await conn.execute(
    "DELETE FROM transactions WHERE id=? AND user_id=?",
    [d.id, user_id]
  );

};

// ⚙️ SETTINGS
exports.updateSettings = async (userId, d) => {
  const conn = await getPool();
  await conn.execute(
    `REPLACE INTO settings
     (user_id, name_visibility, type_visibility, notes_visibility, time_visibility)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      d.name_visibility,
      d.type_visibility,
      d.notes_visibility,
      d.time_visibility
    ]
  );

};
