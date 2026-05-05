import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required for each variant"],
      trim: true,
      uppercase: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: null,
    },
    images: [{ type: String }],
  },
  { _id: true },
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    totalStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    variants: {
      type: [variantSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "A product must have at least one variant",
      },
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// slug generation and totalStock calculation
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  if (this.variants && this.variants.length) {
    this.totalStock = this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
});

// effective Price
productSchema.virtual("effectivePrice").get(function () {
  const variantPrices = this.variants
    .map((v) => v.price)
    .filter((p) => p !== null && p !== undefined);
  return variantPrices.length ? Math.min(...variantPrices) : this.basePrice;
});

// get variant by id
productSchema.methods.getVariant = function (variantId) {
  return this.variants.id(variantId);
};

// decrement stock for a variant
productSchema.statics.decrementStock = function (productId, variantId, qty) {
  return this.findOneAndUpdate(
    {
      _id: productId,
      "variants._id": variantId,
      "variants.stock": { $gte: qty },
    },
    {
      $inc: {
        "variants.$.stock": -qty,
        totalStock: -qty,
      },
    },
    { new: true },
  );
};

const productModel = mongoose.model("Product", productSchema);
export default productModel;
