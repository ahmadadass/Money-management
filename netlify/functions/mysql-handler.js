const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { username, password } = JSON.parse(event.body);
  
  // Create connection to Aiven
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // 1. Check user and get subscription status
    const [userRows] = await connection.execute(
      'SELECT id, username, subscription FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (userRows.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ error: "Login failed" }) };
    }

    const userId = userRows[0].id;

    // 2. Get Transactions for this user
    const [transactions] = await connection.execute(
      'SELECT * FROM transactions WHERE user_id = ?',
      [userId]
    );

    // 3. Get Settings
    // Note: This assumes the 'id' in your settings table matches the 'id' of the user
    const [settings] = await connection.execute(
      'SELECT * FROM settings WHERE id = ?',
      [userId]
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: userRows[0],
        transactions: transactions,
        settings: settings[0] || null
      }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    await connection.end();
  }
};