import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    queuePosition: {
      type: Number,
    },
    hasOrdered: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const flashSaleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Flash sale title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      required: [true, "Discounted price is required"],
      min: [0, "Discounted price can't negative"],
      validate: {
        validator: function (v) {
          return v < this.originalPrice;
        },
        message: "Discounted price must be less than original price",
      },
    },
    discountPercent: {
      type: Number,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (v) {
          return v > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    maxUnits: {
      type: Number,
      required: [true, "Maximum units is required"],
      min: [1, "At least 1 unit must be available"],
    },
    unitsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    waitingRoomCapacity: {
      type: Number,
      default: 500,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "ACTIVE", "ENDED", "CANCELLED"],
      default: "SCHEDULED",
      index: true,
    },
    participants: [participantSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

flashSaleSchema.pre("save", async function () {
  if (this.originalPrice && this.discountedPrice != null) {
    this.discountPercent = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100,
    );
  }
});

flashSaleSchema.virtual("unitsRemaining").get(function () {
  return Math.max(0, this.maxUnits - this.unitsSold);
});

flashSaleSchema.virtual("isSoldOut").get(function () {
  return this.unitsSold >= this.maxUnits;
});

flashSaleSchema.virtual("isLive").get(function () {
  const now = Date.now();
  return (
    this.status === "ACTIVE" && now >= this.startTime && now < this.endTime
  );
});

flashSaleSchema.statics.decrementUnits = function (saleId, qty = 1) {
  return this.findOneAndUpdate(
    {
      _id: saleId,
      status: "active",
      unitsSold: { $lte: this.maxUnits - qty },
    },
    {
      $inc: { unitsSold: qty, "analytics.totalAttempts": 1 },
    },
    { new: true },
  );
};

const flashSaleModel = mongoose.model("FlashSale", flashSaleSchema);

export default flashSaleModel;
