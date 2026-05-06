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

    const imageUrls =
      item.selectedVariant?.images?.length > 0
        ? item.selectedVariant.images
        : item.product.images?.length > 0
          ? item.product.images
          : [];

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
    const product = await productModel.findById(item.product._id);
    if (!product) {
      throw new ApiError(404, `Product not found: ${item.product.name}`);
    }

    if (item.selectedVariant) {
      const variant = product.variants.id(item.selectedVariant._id);
      if (!variant || variant.stock < item.cartQuantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${item.product.name}${variant ? ` (${variant.color || variant.size})` : ""}`,
        );
      }
    } else {
      if (product.totalStock < item.cartQuantity) {
        throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
      }
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    // Store cart data in metadata to retrieve it in the webhook
    metadata: {
      cartItems: JSON.stringify(
        products.map((item) => ({
          productId: item.product._id,
          variantId: item.selectedVariant?._id || null,
          quantity: item.cartQuantity,
        })),
      ),
    },
    success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/success`,
    cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/cancel`,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id: session.id, url: session.url },
        "Payment session created",
      ),
    );
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Retrieve cart items from metadata
    const cartItems = JSON.parse(session.metadata.cartItems);

    console.log("Payment successful. Decrementing stock for items:", cartItems);

    for (const item of cartItems) {
      const updated = await productModel.decrementStock(
        item.productId,
        item.variantId,
        item.quantity,
      );

      if (!updated) {
        console.error(
          `Failed to decrement stock for product ${item.productId} variant ${item.variantId}. Stock might have been depleted between session creation and payment.`,
        );
      }
    }
  }

  res.status(200).json({ received: true });
});
