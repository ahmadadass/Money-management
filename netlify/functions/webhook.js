const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./mysql_handler");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const body = JSON.parse(event.body);

    // 🔑 LOGIN ACTION
    if (body.action === "login") {
      const { name, password } = body.data;

      const user = await db.getUserByName(name);
      if (!user) throw new Error("Invalid login");

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) throw new Error("Invalid login");

      const token = jwt.sign(
        { user_id: user.id, name: user.name },
        process.env.	,
        { expiresIn: "7d" }
      );

      const transactions = await db.getTransactions(user.id);
      const settings = await db.getSettings(user.id);

      return {
        statusCode: 200,
        body: JSON.stringify({
          token,
          user: {
            id: user.id,
            name: user.name,
            subscription: user.subscription
          },
          transactions,
          settings
        })
      };
    }

    // 🔐 ALL OTHER ACTIONS NEED TOKEN
    const user = jwt.verify(body.token, process.env.JWT_SECRET);

    switch (body.action) {

      case "insert_transaction":
        await db.insertTransaction(user.user_id, body.data);
        break;

      case "update_transaction":
        await db.updateTransaction(user.user_id, body.data);
        break;

      case "delete_transaction":
        await db.deleteTransaction(body.data);
        break;

      case "update_settings":
        await db.updateSettings(user.user_id, body.data);
        break;

      default:
        return { statusCode: 400, body: "Unknown action" };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (e) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: e.message })
    };
  }
};
