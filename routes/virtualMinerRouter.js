import { Router } from "express";
import { getAllAvailableMiners } from "../controllers/virtualMinerController.js";

const router = Router();

router.get("/", getAllAvailableMiners);

export default router;
