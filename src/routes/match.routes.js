import express from "express";

import {
  getMatchSuggestions,
  likeMatch,
  dislikeMatch,
} from "../controllers/match.controller.js";

const router = express.Router();

router.get("/:telegram_id", getMatchSuggestions);

router.post("/:telegram_id/like", likeMatch);

router.post("/:telegram_id/dislike", dislikeMatch);

export default router;
