const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

module.exports = async function handler(req, res) {
  try {
    // GET — retrieve all messages
    if (req.method === "GET") {
      const messages = await sql`
        SELECT id, name, email, message, date, status
        FROM messages
        ORDER BY date DESC
      `;

      return res.status(200).json(messages);
    }

    // POST — create a new message
    if (req.method === "POST") {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({
          error: "Name, email, and message are required.",
        });
      }

      const id =
        "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);

      await sql`
        INSERT INTO messages (id, name, email, message, status)
        VALUES (${id}, ${name}, ${email}, ${message}, 'unread')
      `;

      return res.status(201).json({
        success: true,
        message: "Message saved successfully.",
      });
    }

    // PATCH — update message status
    if (req.method === "PATCH") {
      const { id, status } = req.body;

      if (!id || (status !== "read" && status !== "unread")) {
        return res.status(400).json({
          error: "Valid id and status are required.",
        });
      }

      const result = await sql`
        UPDATE messages
        SET status = ${status}
        WHERE id = ${id}
        RETURNING id, name, email, message, date, status
      `;

      if (!result.length) {
        return res.status(404).json({
          error: "Message not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: result[0],
      });
    }

    // DELETE — delete one or all messages
    if (req.method === "DELETE") {
      const { id, all } = req.body || {};

      if (all === true) {
        await sql`
          DELETE FROM messages
        `;

        return res.status(200).json({
          success: true,
          message: "All messages deleted.",
        });
      }

      if (!id) {
        return res.status(400).json({
          error: "Message id is required.",
        });
      }

      const result = await sql`
        DELETE FROM messages
        WHERE id = ${id}
        RETURNING id
      `;

      if (!result.length) {
        return res.status(404).json({
          error: "Message not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Message deleted.",
      });
    }

    return res.status(405).json({
      error: "Method not allowed.",
    });
  } catch (error) {
    console.error("API error:", error);

    return res.status(500).json({
      error: "Internal server error.",
    });
  }
};
