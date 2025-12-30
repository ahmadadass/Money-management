const mysql = require("mysql2/promise");

const getConn = async () => {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
};


// 🔐 LOGIN QUERY
exports.getUserByName = async (username) => {
  const conn = await getConn();
  const [rows] = await conn.execute(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  console.log("getUserByName rows:" , JSON.stringify(rows));
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
    `INSERT INTO transactions (user_id, username, time, amount, type, notes, payment_method, paid, bookmark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, d.username, d.time, d.amount, d.type,
      d.notes, d.payment_method, d.paid, d.bookmark
    ]
  );
  await conn.end();
};

// ✏️ UPDATE
exports.updateTransaction = async (userId, d) => {
  const conn = await getConn();
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
  await conn.end();
};

// ❌ DELETE
exports.deleteTransaction = async (user_id, d) => {
  const conn = await getConn();
  await conn.execute(
    "DELETE FROM transactions WHERE id=? AND user_id=?",
    [d.id, user_id]
  );
  await conn.end();
};

// ⚙️ SETTINGS
exports.updateSettings = async (userId, d) => {
  const conn = await getConn();
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
  await conn.end();
};
