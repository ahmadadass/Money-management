const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log("1. Function Started");
  const { username, password } = JSON.parse(event.body);
  
  // Create connection to Aiven
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // 1. Check user and get subscription status
    console.log("2. Received request for user:", username);
    const [userRows] = await connection.execute(
      'SELECT id, username, subscription FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    console.log("3. Connection Successful!");

    if (userRows.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ error: "Login failed" }) };
    }
    console.log("4. Query finished. Rows found:", userRows.length);

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
    console.error("CRITICAL ERROR:", error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    await connection.end();
  }
};