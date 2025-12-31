const mysql = require("mysql2/promise");

const getConn = async () => {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
};

let pool;

const getPool = () => {
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

const query = async (sql, params) => {
  try {
    const db = getPool();
    const [result] = await db.execute(sql, params);
    return result;
  } catch (error) {
    console.error("Database Error:", error.message);
    throw error; // Pass error to the route handler
  }
};

//module.exports = {
//  getPool,
//  getUserByName,
//  getTransactions,
//  getSettings,
//  insertTransaction,
//  updateTransaction,
//  deleteTransaction,
//  updateSettings
//}

// 🔐 LOGIN QUERY
exports.getUserByName = async (username) => {
  const rows = await query(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  return rows[0];
};

exports.getTransactions = async (userId) => {
  return await query(
    "SELECT * FROM transactions WHERE user_id = ?",
    [userId]
  );
};

exports.getSettings = async (userId) => {
  const rows = await query(
    "SELECT * FROM settings WHERE user_id = ?",
    [userId]
  );
  return rows[0] || null;
};

// 🧾 INSERT
exports.insertTransaction = async (userId, d) => {
  return await query(
    `INSERT INTO transactions (user_id, name, time, amount, type, notes, payment_method, paid, bookmark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [Number(userId), d.name, Number(d.time), Number(d.amount), d.type, d.notes, d.payment_method, Number(d.paid), Number(d.bookmark)]
  );
};

// ✏️ UPDATE
exports.updateTransaction = async (userId, d) => {
  return await query(
    `UPDATE transactions SET name=?, time=?, amount=?, type=?, notes=?, payment_method=?, paid=?, bookmark=? WHERE id=? AND user_id=?`,
    [d.name, Number(d.time), Number(d.amount), d.type, d.notes, d.payment_method, Number(d.paid), Number(d.bookmark), Number(d.id), Number(userId)]
  );
};

// ❌ DELETE
exports.deleteTransaction = async (user_id, d) => {
  return await query(
    "DELETE FROM transactions WHERE id=? AND user_id=?",
    [d.id, user_id]
  );

};

// ⚙️ SETTINGS
exports.updateSettings = async (userId, d) => {
  return await query(
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
