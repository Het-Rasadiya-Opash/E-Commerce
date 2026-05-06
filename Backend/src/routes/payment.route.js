import express from "express";
import { createPayment } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/create-checkout-session", authMiddleware, createPayment);

export default router;
