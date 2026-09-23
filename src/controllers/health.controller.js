import pool from "../db.js";

export const healthCheck = (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running",
  });
};

export const databaseCheck = async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};
