import pool from "../db.js";

export const createUser = async (req, res) => {
  try {
    const {
      telegram_id,
      telegram_username,
      telegram_first_name,
      telegram_last_name,
      telegram_photo_url,
      telegram_language_code,
      tma_username,
      tma_first_name,
      tma_last_name,
      tma_photo_url,
      tma_age,
      tma_gender,
      tma_sexual_orientation,
    } = req.body;

    // Use Telegram values when TMA username/photo are empty
    const finalTmaUsername = tma_username?.trim() || telegram_username?.trim();

    const finalTmaPhotoUrl =
      tma_photo_url?.trim() || telegram_photo_url?.trim();

    // Required fields
    if (
      telegram_id === undefined ||
      !telegram_username?.trim() ||
      !telegram_first_name?.trim() ||
      !telegram_last_name?.trim() ||
      !telegram_photo_url?.trim() ||
      !telegram_language_code?.trim() ||
      !finalTmaUsername ||
      !tma_first_name?.trim() ||
      !tma_last_name?.trim() ||
      !finalTmaPhotoUrl ||
      tma_age === undefined ||
      tma_age === null
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO users (
        telegram_id,
        telegram_username,
        telegram_first_name,
        telegram_last_name,
        telegram_photo_url,
        telegram_language_code,
        tma_username,
        tma_first_name,
        tma_last_name,
        tma_photo_url,
        tma_age,
        tma_gender,
        tma_sexual_orientation
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )
      RETURNING *
      `,
      [
        telegram_id,
        telegram_username.trim(),
        telegram_first_name.trim(),
        telegram_last_name.trim(),
        telegram_photo_url.trim(),
        telegram_language_code.trim(),
        finalTmaUsername,
        tma_first_name.trim(),
        tma_last_name.trim(),
        finalTmaPhotoUrl,
        tma_age,
        tma_gender?.trim() || null,
        tma_sexual_orientation?.trim() || null,
      ],
    );

    return res.status(201).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY tma_id DESC");

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

export const getUserByTelegramId = async (req, res) => {
  try {
    const { telegram_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM users WHERE telegram_id = $1",
      [telegram_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      exists: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get user by Telegram ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to check user",
    });
  }
};

export const updateUserByTelegramId = async (req, res) => {
  try {
    const { telegram_id } = req.params;

    const {
      tma_username,
      tma_first_name,
      tma_last_name,
      tma_age,
      tma_gender,
      tma_sexual_orientation,
      tma_photo_url,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET
        tma_username = COALESCE($1, tma_username),
        tma_first_name = COALESCE($2, tma_first_name),
        tma_last_name = COALESCE($3, tma_last_name),
        tma_age = COALESCE($4, tma_age),
        tma_gender = $5,
        tma_sexual_orientation = $6,
        tma_photo_url = COALESCE($7, tma_photo_url),
        tma_updated_at = CURRENT_TIMESTAMP
      WHERE telegram_id = $8
      RETURNING *
      `,
      [
        tma_username?.trim(),
        tma_first_name?.trim(),
        tma_last_name?.trim(),
        tma_age,
        tma_gender?.trim() || null,
        tma_sexual_orientation?.trim() || null,
        tma_photo_url?.trim(),
        telegram_id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};
