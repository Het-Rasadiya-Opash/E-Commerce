import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Stripe from "stripe";
import productModel from "../models/product.mode.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = asyncHandler(async (req, res) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new ApiError(400, "No products provided for payment");
  }

  const lineItems = products.map((item) => {
    const price =
      item.selectedVariant && item.selectedVariant.price
        ? item.selectedVariant.price
        : item.product.basePrice;

    const variantDetails = item.selectedVariant 
      ? ` (${[item.selectedVariant.color, item.selectedVariant.size].filter(Boolean).join(", ")})`
      : "";

    const imageUrls = item.selectedVariant?.images?.length > 0 
      ? item.selectedVariant.images 
      : (item.product.images?.length > 0 ? item.product.images : []);

    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: `${item.product.name}${variantDetails}`,
          images: imageUrls.slice(0, 1),
        },
        unit_amount: Math.round(price * 100), 
      },
      quantity: item.cartQuantity,
    };
  });

  for (const item of products) {
    const updated = await productModel.decrementStock(
      item.product._id,
      item.selectedVariant?._id,
      item.cartQuantity,
    );
    if (!updated) {
      throw new ApiError(
        400,
        `Insufficient stock for ${item.product.name}${item.selectedVariant ? ` (${item.selectedVariant.color || item.selectedVariant.size})` : ""}`,
      );
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}`,
    cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}`,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id: session.id, url: session.url },
        "Payment session created and stock updated",
      ),
    );
});
