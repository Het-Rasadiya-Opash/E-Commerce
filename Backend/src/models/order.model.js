import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    snapshot: {
      productName: { type: String, required: true },
      sku: {
        type: String,
        required: true,
      },
      size: {
        type: String,
      },
      color: {
        type: String,
      },
      image: {
        type: String,
      },
      originalPrice: {
        type: Number,
        required: true,
      },
      paidPrice: {
        type: Number,
        required: true,
      },
      isFlashSale: {
        type: Boolean,
        default: false,
      },
      flashSaleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FlashSale",
        default: null,
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

const statusEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "PLACED",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "OUT FOR DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zip: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },
  },
  { _id: false },
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["COD", "CARD"],
      default: "COD",
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "An order must have at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    payment: {
      type: paymentSchema,
      default: () => ({}),
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "PLACED",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "OUT FOR DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "PLACED",
      index: true,
    },
    statusTimeline: [statusEventSchema],
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    flashSale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlashSale",
      default: null,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    cancellationReason: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${date}-${String(count + 1).padStart(5, "0")}`;
  }
});

orderSchema.methods.advanceStatus = function (newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusTimeline.push({ status: newStatus, note, updatedBy });
  if (newStatus === "PAID" && this.payment) {
    this.payment.status = "PAID";
    this.payment.paidAt = new Date();
  }
  if (newStatus === "CANCELLED") {
    this.cancellationReason = note;
  }
};

orderSchema.virtual("isCancellable").get(function () {
  return ["PLACED", "PAID"].includes(this.status);
});

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
