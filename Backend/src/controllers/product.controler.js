import productModel from "../models/product.mode.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    subCategory,
    brand,
    basePrice,
    variants,
    tags,
  } = req.body;

  // Transform req.files from array to object if it's an array (from upload.any())
  if (req.files && Array.isArray(req.files)) {
    const filesObject = {};
    req.files.forEach((file) => {
      const fieldname = file.fieldname.trim();
      if (!filesObject[fieldname]) {
        filesObject[fieldname] = [];
      }
      filesObject[fieldname].push(file);
    });
    req.files = filesObject;
  }

  if (
    [name, description, category, basePrice].some(
      (field) =>
        field === undefined ||
        (typeof field === "string" && field.trim() === ""),
    )
  ) {
    throw new ApiError(
      400,
      "All required fields (name, description, category, basePrice) must be provided",
    );
  }

  const existedProduct = await productModel.findOne({ name });
  if (existedProduct) {
    throw new ApiError(409, "Product with this name already exists");
  }

  let imageLocalPaths = [];
  if (req.files && Array.isArray(req.files.images)) {
    imageLocalPaths = req.files.images.map((file) => file.path);
  } else if (req.files && req.files.image) {
    imageLocalPaths = [req.files.image[0].path];
  }

  const imageUrls = [];
  for (const localPath of imageLocalPaths) {
    const uploadedImage = await uploadOnCloudinary(localPath);
    if (uploadedImage) {
      imageUrls.push(uploadedImage.secure_url || uploadedImage.url);
    }
  }

  let parsedVariants = variants;
  if (typeof variants === "string") {
    try {
      parsedVariants = JSON.parse(variants);
    } catch (error) {
      throw new ApiError(
        400,
        "Invalid format for variants. Expected a JSON array.",
      );
    }
  }

  if (
    !parsedVariants ||
    !Array.isArray(parsedVariants) ||
    parsedVariants.length === 0
  ) {
    throw new ApiError(400, "At least one variant is required");
  }

  const variantProcessingPromises = parsedVariants.map(async (variant, i) => {
    const variantImageKey = `variant_${i}_images`;

    if (req.files && req.files[variantImageKey]) {
      const files = req.files[variantImageKey];

      const uploadPromises = files.map((file) => uploadOnCloudinary(file.path));
      const uploadResults = await Promise.all(uploadPromises);

      const urls = uploadResults
        .filter((result) => result !== null)
        .map((result) => result.secure_url || result.url);

      return { ...variant, images: urls };
    } else {
      return variant;
    }
  });

  parsedVariants = await Promise.all(variantProcessingPromises);

  let parsedTags = tags;
  if (typeof tags === "string") {
    try {
      parsedTags = JSON.parse(tags);
    } catch (error) {
      parsedTags = tags.split(",").map((tag) => tag.trim());
    }
  }

  const product = await productModel.create({
    name,
    description,
    category,
    subCategory,
    brand,
    basePrice: Number(basePrice),
    variants: parsedVariants,
    tags: parsedTags || [],
    images: imageUrls,
    createdBy: req.user?._id,
  });

  if (!product) {
    throw new ApiError(500, "Something went wrong while creating the product");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});
