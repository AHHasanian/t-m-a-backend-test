import express from "express";
import crypto from "crypto";

const router = express.Router();

router.post("/telegram", async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({
        success: false,
        message: "Telegram initData is required",
      });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({
        success: false,
        message: "Telegram bot token is not configured",
      });
    }

    const params = new URLSearchParams(initData);
    const receivedHash = params.get("hash");

    if (!receivedHash) {
      return res.status(401).json({
        success: false,
        message: "Telegram hash is missing",
      });
    }

    params.delete("hash");

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // 1. Telegram authentication
    if (calculatedHash !== receivedHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid Telegram initData",
      });
    }

    // 2. Telegram authentication successful
    const userData = params.get("user");
    const telegramUser = userData ? JSON.parse(userData) : null;

    if (!telegramUser?.id) {
      return res.status(400).json({
        success: false,
        message: "Telegram user data is missing",
      });
    }

    const telegramId = telegramUser.id;

    // 3. Find user in database
    const userResponse = await fetch(
      `http://localhost:3001/api/users/telegram/${telegramId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const userResult = await userResponse.json();

    // 4. User exists
    if (userResponse.ok) {
      return res.status(200).json({
        success: true,
        newUser: false,
        telegramUser,
        user: userResult.user,
      });
    }

    // 5. User does not exist
    return res.status(200).json({
      success: true,
      newUser: true,
      telegramUser,
    });
  } catch (error) {
    console.error("Telegram authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Telegram authentication failed",
    });
  }
});

export default router;
