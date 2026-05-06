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
        quantity
      );

      if (!updatedProduct) {
        throw new ApiError(
          400,
          `Insufficient stock or invalid variant for product ID: ${productId}`
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

