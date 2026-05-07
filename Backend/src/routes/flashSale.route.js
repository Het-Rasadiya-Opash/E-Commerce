import express from "express";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

export default router;
