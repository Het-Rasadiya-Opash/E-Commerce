import express from "express";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createProduct,
  getProductById,
  getProducts,
  getProductsByUser,
  deleteProduct,
  getAllCategories,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getAllCategories);

router.get("/user", authMiddleware, getProductsByUser);

router.get("/:id", getProductById);

router.delete("/:id", authMiddleware, authorizeRole("ADMIN"), deleteProduct);

router.post(
  "/create",
  authMiddleware,
  authorizeRole("ADMIN"),
  upload.any(),
  createProduct,
);

export default router;
