import mongoose from "mongoose";
import flashSaleModel from "../models/flashSale.model.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.mode.js";
import { emitToUser } from "../socket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    flashSaleId,
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
      const {
        productId,
        variantId,
        quantity,
        price,
        flashSaleId: itemFlashSaleId,
      } = item;

      const targetFlashSaleId = itemFlashSaleId || flashSaleId;

      if (targetFlashSaleId) {
        const updatedFlashSale = await flashSaleModel.decrementUnits(
          targetFlashSaleId,
          quantity,
        );

        if (!updatedFlashSale) {
          throw new ApiError(
            400,
            "Flash sale is either inactive or sold out for this product.",
          );
        }

        await flashSaleModel.updateOne(
          { _id: targetFlashSaleId, "participants.user": req.user._id },
          { $set: { "participants.$.hasOrdered": true } },
        );
      }

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
          isFlashSale: !!targetFlashSaleId,
          flashSaleId: targetFlashSaleId || null,
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
      flashSale: flashSaleId || null,
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

  const query = { _id: orderId };
  if (req.user.role !== "ADMIN") {
    query.user = req.user._id;
  }

  const order = await orderModel
    .findOne(query)
    .populate("user", "name email")
    .populate("items.product", "name slug images");

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

  const filter = { _id: orderId, status: { $in: ["PLACED", "PAID"] } };
  if (req.user.role !== "ADMIN") filter.user = req.user._id;

  const order = await orderModel.findOneAndUpdate(
    filter,
    {
      $set: { status: "CANCELLED", cancellationReason: reason || "Cancelled by user" },
      $push: {
        statusTimeline: {
          status: "CANCELLED",
          note: reason || "Cancelled by user",
          updatedBy: req.user._id,
          timestamp: new Date(),
        },
      },
    },
    { returnDocument: "after" },
  );

  if (!order) {
    const existing = await orderModel.findById(orderId, "status user");
    if (!existing) throw new ApiError(404, "Order not found");
    if (req.user.role !== "ADMIN" && !existing.user.equals(req.user._id))
      throw new ApiError(403, "Not authorized");
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  for (const item of order.items) {
    await productModel.incrementStock(item.product, item.variant, item.quantity);
  }

  emitToUser(order.user, "orderStatusUpdated", order);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

export const getOrdersByAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [{ orderNumber: { $regex: search, $options: "i" } }];
  }

  const skip = (page - 1) * limit;

  const orders = await orderModel
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("user", "name email")
    .populate("items.product", "name slug images");

  const total = await orderModel.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "Orders retrieved successfully",
    ),
  );
});

export const updateOrderStatusByAdmin = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const validStatuses = ["PLACED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const $set = { status };
  if (status === "PAID") {
    $set["payment.status"] = "PAID";
    $set["payment.isPaid"] = true;
    $set["payment.paidAt"] = new Date();
  }
  if (status === "CANCELLED") {
    $set.cancellationReason = note || "Cancelled by Admin";
  }

  const prevOrder = await orderModel.findOneAndUpdate(
    { _id: orderId, status: { $ne: status } },
    {
      $set,
      $push: {
        statusTimeline: {
          status,
          note: note || `Order status updated to ${status} by Admin`,
          updatedBy: req.user._id,
          timestamp: new Date(),
        },
      },
    },
    { returnDocument: "after" },
  );

  if (!prevOrder) {
    const existing = await orderModel.findById(orderId);
    if (!existing) throw new ApiError(404, "Order not found");
    return res
      .status(200)
      .json(new ApiResponse(200, existing, "Order status updated successfully"));
  }

  if (status === "CANCELLED" && prevOrder.status !== "CANCELLED") {
    for (const item of prevOrder.items) {
      await productModel.incrementStock(item.product, item.variant, item.quantity);
    }
  }

  const updatedOrder = await orderModel.findById(orderId);
  emitToUser(prevOrder.user, "orderStatusUpdated", updatedOrder);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order status updated successfully"));
});


