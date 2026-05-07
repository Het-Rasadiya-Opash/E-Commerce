import flashSaleModel from "../models/flashSale.model.js";
import productModel from "../models/product.mode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createFlashSale = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    product,
    variant,
    discountedPrice,
    startTime,
    endTime,
    maxUnits,
    waitingRoomCapacity,
  } = req.body;

  if (
    !title ||
    !product ||
    !discountedPrice ||
    !startTime ||
    !endTime ||
    !maxUnits
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const productData = await productModel.findById(product);
  if (!productData) {
    throw new ApiError(404, "Product not found");
  }

  let originalPrice = productData.basePrice;

  if (variant) {
    const variantData = productData.variants.id(variant);
    if (!variantData) {
      throw new ApiError(404, "Product variant not found");
    }
    if (variantData.price) {
      originalPrice = variantData.price;
    }
  }

  if (discountedPrice >= originalPrice) {
    throw new ApiError(
      400,
      `Discounted price (${discountedPrice}) must be less than original price (${originalPrice})`,
    );
  }

  const flashSale = await flashSaleModel.create({
    title,
    description,
    product,
    variant,
    originalPrice,
    discountedPrice,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    maxUnits,
    waitingRoomCapacity: waitingRoomCapacity || 100,
    createdBy: req.user?._id,
  });

  if (!flashSale) {
    throw new ApiError(
      500,
      "Something went wrong while creating the flash sale",
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, flashSale, "Flash sale created successfully"));
});
