import pool from "../db.js";

export const getMatchSuggestions = async (req, res) => {
  try {
    const { telegram_id } = req.params;

    const result = await pool.query(
      `
      SELECT
        u.telegram_id,
        u.tma_username,
        u.tma_first_name,
        u.tma_last_name,
        u.tma_photo_url,
        u.tma_age,
        u.tma_gender,
        u.tma_sexual_orientation
      FROM users u
      WHERE u.telegram_id <> $1
        AND NOT EXISTS (
          SELECT 1
          FROM user_interactions ui
          WHERE ui.user_telegram_id = $1
            AND ui.target_telegram_id = u.telegram_id
        )
      ORDER BY RANDOM()
      LIMIT 4
      `,
      [telegram_id],
    );

    return res.json({
      success: true,
      count: result.rows.length,
      matches: result.rows,
    });
  } catch (error) {
    console.error("Get match suggestions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get match suggestions",
    });
  }
};
export const likeMatch = async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const { target_telegram_id } = req.body;

    if (!target_telegram_id) {
      return res.status(400).json({
        success: false,
        message: "target_telegram_id is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO user_interactions (
        user_telegram_id,
        target_telegram_id,
        action
      )
      VALUES ($1, $2, 'like')
      ON CONFLICT (user_telegram_id, target_telegram_id)
      DO UPDATE SET
        action = 'like',
        updated_at = NOW()
      RETURNING *
      `,
      [telegram_id, target_telegram_id],
    );

    return res.status(200).json({
      success: true,
      message: "User liked successfully",
      interaction: result.rows[0],
    });
  } catch (error) {
    console.error("Like match error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to like user",
    });
  }
};

export const dislikeMatch = async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const { target_telegram_id } = req.body;

    if (!target_telegram_id) {
      return res.status(400).json({
        success: false,
        message: "target_telegram_id is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO user_interactions (
        user_telegram_id,
        target_telegram_id,
        action
      )
      VALUES ($1, $2, 'dislike')
      ON CONFLICT (user_telegram_id, target_telegram_id)
      DO UPDATE SET
        action = 'dislike',
        updated_at = NOW()
      RETURNING *
      `,
      [telegram_id, target_telegram_id],
    );

    return res.status(200).json({
      success: true,
      message: "User disliked successfully",
      interaction: result.rows[0],
    });
  } catch (error) {
    console.error("Dislike match error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to dislike user",
    });
  }
};
