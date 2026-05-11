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
  let availableStock = productData.totalStock;

  if (variant) {
    const variantData = productData.variants.id(variant);
    if (!variantData) {
      throw new ApiError(404, "Product variant not found");
    }
    availableStock = variantData.stock;
    if (variantData.price) {
      originalPrice = variantData.price;
    }
  }

  if (maxUnits > availableStock) {
    throw new ApiError(
      400,
      `Flash sale max units (${maxUnits}) cannot exceed available stock (${availableStock})`,
    );
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

export const getFlashSales = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { isDeleted: false };

  const now = new Date();

  await flashSaleModel.updateMany(
    {
      status: "SCHEDULED",
      startTime: { $lte: now },
      isDeleted: false,
    },
    { $set: { status: "ACTIVE" } },
  );

  await flashSaleModel.updateMany(
    {
      status: "ACTIVE",
      endTime: { $lte: now },
      isDeleted: false,
    },
    { $set: { status: "ENDED" } },
  );

  if (status) {
    filter.status = status.toUpperCase();
  }

  const flashSales = await flashSaleModel
    .find(filter)
    .populate("product", "name basePrice images variants")
    .sort({ startTime: -1 });

  const flashSalesWithVariantDetails = flashSales.map((sale) => {
    const saleObj = sale.toObject();
    if (saleObj.product && saleObj.variant) {
      const variantDetail = saleObj.product.variants?.find(
        (v) => v._id.toString() === saleObj.variant.toString(),
      );
      if (variantDetail) {
        saleObj.variantDetail = {
          ...variantDetail,
          // Adding type and value as convenience fields for frontend
          type: variantDetail.color ? "Color" : variantDetail.size ? "Size" : "Variant",
          value: variantDetail.color || variantDetail.size || "Selected",
        };
      } else {
        saleObj.variantDetail = null;
      }
    } else {
      saleObj.variantDetail = null;
    }
    return saleObj;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        flashSalesWithVariantDetails,
        "Flash sales retrieved successfully",
      ),
    );
});

export const joinQueue = asyncHandler(async (req, res) => {
  const { saleId } = req.params;
  const userId = req.user._id;

  const sale = await flashSaleModel.findById(saleId);
  if (!sale) {
    throw new ApiError(404, "Flash sale not found");
  }

  if (sale.status !== "ACTIVE") {
    throw new ApiError(400, "Flash sale is not active");
  }

  const alreadyJoined = sale.participants.some(
    (p) => p.user.toString() === userId.toString()
  );
  if (alreadyJoined) {
    throw new ApiError(400, "You are already in the waiting list");
  }

  if (sale.participants.length >= sale.waitingRoomCapacity) {
    throw new ApiError(400, "waitingRoomCapacity is full you can't join the flash sales");
  }

  const queuePosition = sale.participants.length + 1;

  sale.participants.push({ user: userId, queuePosition });
  await sale.save();

  return res
    .status(200)
    .json(new ApiResponse(200, sale, "Joined waiting list successfully"));
});

export const getFlashSaleParticipants = asyncHandler(async (req, res) => {
  const { saleId } = req.params;

  const sale = await flashSaleModel.findById(saleId).populate("participants.user", "name email");
  if (!sale) {
    throw new ApiError(404, "Flash sale not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, sale.participants, "Participants retrieved successfully"));
});
