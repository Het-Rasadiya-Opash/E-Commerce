import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.mode.js";
import mongoose from "mongoose";

export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    subtotal,
    discount,
    tax,
    shippingFee,
    grandTotal,
    notes,
  } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, "Items are required to create an order");
  }

  if (!shippingAddress) {
    throw new ApiError(400, "Shipping address is required");
  }

  try {
    const processedItems = [];

    for (const item of items) {
      const { productId, variantId, quantity, price } = item;

      const updatedProduct = await productModel.decrementStock(
        productId,
        variantId,
        quantity,
      );

      if (!updatedProduct) {
        throw new ApiError(
          400,
          `Insufficient stock or invalid variant for product ID: ${productId}`,
        );
      }

      const variant = updatedProduct.variants.id(variantId);
      if (!variant) {
        throw new ApiError(400, `Variant not found: ${variantId}`);
      }

      processedItems.push({
        product: productId,
        variant: variantId,
        snapshot: {
          productName: updatedProduct.name,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          image: variant.images?.[0] || updatedProduct.images?.[0] || "",
          originalPrice: variant.price || updatedProduct.basePrice,
          paidPrice: price,
        },
        quantity,
        lineTotal: price * quantity,
      });
    }

    const orderData = {
      user: req.user._id,
      items: processedItems,
      shippingAddress,
      payment: {
        method: paymentMethod || "COD",
        status: "PENDING",
      },
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      shippingFee: shippingFee || 0,
      grandTotal,
      notes,
      statusTimeline: [
        {
          status: "PLACED",
          updatedBy: req.user._id,
        },
      ],
    };

    const order = await orderModel.create(orderData);

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully"));
  } catch (error) {
    throw error;
  }
});

export const getOrdersByUser = asyncHandler(async (req, res) => {
  const orders = await orderModel
    .find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("items.product", "name slug images");

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await orderModel.findOne({
    _id: orderId,
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await orderModel.findOne({
    _id: orderId,
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!order.isCancellable) {
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  order.advanceStatus("CANCELLED", reason || "Cancelled by user", req.user._id);
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});
