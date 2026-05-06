import express from "express";
import { createOrder } from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createOrder);

export default router;
