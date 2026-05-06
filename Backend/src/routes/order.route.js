import express from "express";
import {
  createOrder,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getOrdersByUser);
router.get("/:orderId", authMiddleware, getOrderById);
router.post("/create", authMiddleware, createOrder);
router.post("/:orderId/cancel", authMiddleware, cancelOrder);



export default router;
