import { Router } from "express";
import {
  collectRewards,
  getUserRewards,
} from "../controllers/rewardController.js";

const router = Router();

router.get("/user", getUserRewards);
router.post("/user/collect", collectRewards);

export default router;
