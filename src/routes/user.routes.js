import express from "express";
import {
  createUser,
  getUsers,
  getUserByTelegramId,
  updateUserByTelegramId,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/telegram/:telegram_id", getUserByTelegramId);
router.patch("/telegram/:telegram_id", updateUserByTelegramId);

export default router;
