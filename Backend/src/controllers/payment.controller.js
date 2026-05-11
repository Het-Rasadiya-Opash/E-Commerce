import Stripe from "stripe";
import flashSaleModel from "../models/flashSale.model.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.mode.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = asyncHandler(async (req, res) => {
  const { products, orderData } = req.body;

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
          metadata: {
            productId: item.product._id.toString(),
            variantId: item.selectedVariant?._id?.toString() || "",
            flashSaleId: item.flashSaleId?.toString() || "",
          },
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: item.cartQuantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    metadata: {
      fullName: orderData.shippingAddress.fullName,
      phone: orderData.shippingAddress.phone,
      street: orderData.shippingAddress.street,
      city: orderData.shippingAddress.city,
      state: orderData.shippingAddress.state,
      zip: orderData.shippingAddress.zip,
      country: orderData.shippingAddress.country,
      notes: orderData.notes || "",
      subtotal: orderData.subtotal.toString(),
      grandTotal: orderData.grandTotal.toString(),
      userId: req.user._id.toString(),
    },
    success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/cart`,
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

export const verifySession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product"],
  });

  if (session.payment_status !== "paid") {
    throw new ApiError(400, "Payment not completed");
  }

  const existingOrder = await orderModel.findOne({ idempotencyKey: sessionId });
  if (existingOrder) {
    return res
      .status(200)
      .json(new ApiResponse(200, existingOrder, "Order already created"));
  }

  const {
    fullName,
    phone,
    street,
    city,
    state,
    zip,
    country,
    notes,
    subtotal,
    grandTotal,
    userId,
  } = session.metadata;

  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    expand: ["data.price.product"],
  });

  const processedItems = [];

  for (const item of lineItems.data) {
    const stripeProduct = item.price.product;
    const { productId, variantId } = stripeProduct.metadata;

    const updatedProduct = await productModel.decrementStock(
      productId,
      variantId,
      item.quantity,
    );

    if (!updatedProduct) {
      throw new ApiError(
        400,
        `Insufficient stock for product: ${stripeProduct.name}`,
      );
    }

    const variant = variantId ? updatedProduct.variants.id(variantId) : null;

    const { flashSaleId } = stripeProduct.metadata;
    if (flashSaleId) {
      const updatedFlashSale = await flashSaleModel.decrementUnits(
        flashSaleId,
        item.quantity,
      );

      if (!updatedFlashSale) {
        console.error(
          `Flash sale sold out after payment for session: ${sessionId}`,
        );
      }

      await flashSaleModel.updateOne(
        { _id: flashSaleId, "participants.user": userId },
        { $set: { "participants.$.hasOrdered": true } },
      );
    }

    processedItems.push({
      product: productId,
      variant: variantId || null,
      snapshot: {
        productName: updatedProduct.name,
        sku: variant?.sku || "N/A",
        size: variant?.size || "",
        color: variant?.color || "",
        image: variant?.images?.[0] || updatedProduct.images?.[0] || "",
        originalPrice: variant?.price || updatedProduct.basePrice,
        paidPrice: item.price.unit_amount / 100,
        isFlashSale: !!flashSaleId,
        flashSaleId: flashSaleId || null,
      },
      quantity: item.quantity,
      lineTotal: (item.price.unit_amount / 100) * item.quantity,
    });
  }

  const orderData = {
    user: userId,
    items: processedItems,
    shippingAddress: {
      fullName,
      phone,
      street,
      city,
      state,
      zip,
      country,
    },
    payment: {
      method: "CARD",
      status: "PAID",
      isPaid: true,
      paidAt: new Date(),
    },
    subtotal: parseFloat(subtotal),
    grandTotal: parseFloat(grandTotal),
    notes,
    status: "PAID",
    statusTimeline: [
      {
        status: "PLACED",
        updatedBy: userId,
      },
      {
        status: "PAID",
        updatedBy: userId,
      },
    ],
    idempotencyKey: sessionId,
  };

  try {
    const order = await orderModel.create(orderData);

    res
      .status(201)
      .json(
        new ApiResponse(201, order, "Order created successfully after payment"),
      );
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
      const existingOrder = await orderModel.findOne({
        idempotencyKey: sessionId,
      });
      if (existingOrder) {
        return res
          .status(200)
          .json(new ApiResponse(200, existingOrder, "Order already created"));
      }
    }
    throw error;
  }
});
