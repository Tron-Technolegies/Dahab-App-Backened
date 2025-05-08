import { Router } from "express";
import { UpdateWorkers } from "../controllers/workerController.js";

const router = Router();

router.get("/workers", UpdateWorkers);

export default router;
