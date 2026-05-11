import express from "express";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createFlashSale,
  getFlashSales,
  joinQueue,
} from "../controllers/flashSale.controller.js";

const router = express.Router();

router.post("/create", authMiddleware, authorizeRole("ADMIN"), createFlashSale);
router.get("/", getFlashSales);
router.post("/:saleId/join-queue", authMiddleware, joinQueue);

export default router;
