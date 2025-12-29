const mysql = require("mysql2/promise");

const getConn = async () => {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
};

// 🔐 LOGIN QUERY
exports.getUserByName = async (name) => {
  const conn = await getConn();
  const [rows] = await conn.execute(
    "SELECT * FROM users WHERE name = ?",
    [name]
  );
  await conn.end();
  return rows[0];
};

exports.getTransactions = async (userId) => {
  const conn = await getConn();
  const [rows] = await conn.execute(
    "SELECT * FROM transactions WHERE user_id = ?",
    [userId]
  );
  await conn.end();
  return rows;
};

exports.getSettings = async (userId) => {
  const conn = await getConn();
  const [rows] = await conn.execute(
    "SELECT * FROM settings WHERE id = ?",
    [userId]
  );
  await conn.end();
  return rows[0] || null;
};

// 🧾 INSERT
exports.insertTransaction = async (userId, d) => {
  const conn = await getConn();
  await conn.execute(
    `INSERT INTO transactions
     (user_id, name, time, amount, type, notes, payment_method, paid, book_mark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, d.name, d.time, d.amount, d.type,
      d.notes, d.payment_method, d.paid, d.book_mark
    ]
  );
  await conn.end();
};

// ✏️ UPDATE
exports.updateTransaction = async (userId, d) => {
  const conn = await getConn();
  await conn.execute(
    `UPDATE transactions SET
     name=?, time=?, amount=?, type=?, notes=?,
     payment_method=?, paid=?, book_mark=?
     WHERE id=? AND user_id=?`,
    [
      d.name, d.time, d.amount, d.type, d.notes,
      d.payment_method, d.paid, d.book_mark,
      d.id, userId
    ]
  );
  await conn.end();
};

// ❌ DELETE
exports.deleteTransaction = async (d) => {
  const conn = await getConn();
  await conn.execute(
    "DELETE FROM transactions WHERE id=?",
    [d.id]
  );
  await conn.end();
};

// ⚙️ SETTINGS
exports.updateSettings = async (userId, d) => {
  const conn = await getConn();
  await conn.execute(
    `REPLACE INTO settings
     (id, name_visibility, type_visibility, notes_visibility, time_visibility)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      d.name_visibility,
      d.type_visibility,
      d.notes_visibility,
      d.time_visibility
    ]
  );
  await conn.end();
};
