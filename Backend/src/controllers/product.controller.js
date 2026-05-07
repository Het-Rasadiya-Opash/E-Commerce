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

export const getProducts = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    subCategory,
    brand,
    tags,
    search,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (subCategory) {
    query.subCategory = subCategory;
  }

  if (brand) {
    query.brand = brand;
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(",");
    query.tags = { $in: tagArray };
  }

  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = Number(minPrice);
    if (maxPrice) query.basePrice.$lte = Number(maxPrice);
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};

  const actualSortBy = sortBy === "price" ? "basePrice" : sortBy;
  sortOptions[actualSortBy] = sortOrder === "desc" ? -1 : 1;

  const products = await productModel
    .find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const totalProducts = await productModel.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          totalProducts,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
      "Products fetched successfully",
    ),
  );
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productModel.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

export const getProductsByUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const products = await productModel.find({ createdBy: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productModel.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this product");
  }

  await productModel.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await productModel.distinct("category");

  if (!categories) {
    throw new ApiError(404, "Categories not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

export const editProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category,
    subCategory,
    brand,
    basePrice,
    variants,
    tags,
    existingImages,
  } = req.body;

  const product = await productModel.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.createdBy.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this product");
  }

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

  let imageUrls = [];

  if (existingImages) {
    try {
      imageUrls =
        typeof existingImages === "string"
          ? JSON.parse(existingImages)
          : existingImages;
    } catch (error) {
      imageUrls = Array.isArray(existingImages)
        ? existingImages
        : [existingImages];
    }
  } else {
    imageUrls = product.images || [];
  }

  let imageLocalPaths = [];
  if (req.files && Array.isArray(req.files.images)) {
    imageLocalPaths = req.files.images.map((file) => file.path);
  } else if (req.files && req.files.image) {
    imageLocalPaths = [req.files.image[0].path];
  }

  if (imageLocalPaths.length > 0) {
    for (const localPath of imageLocalPaths) {
      const uploadedImage = await uploadOnCloudinary(localPath);
      if (uploadedImage) {
        imageUrls.push(uploadedImage.secure_url || uploadedImage.url);
      }
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

  if (parsedVariants && Array.isArray(parsedVariants)) {
    const variantProcessingPromises = parsedVariants.map(async (variant, i) => {
      const variantImageKey = `variant_${i}_images`;

      if (req.files && req.files[variantImageKey]) {
        const files = req.files[variantImageKey];
        const uploadPromises = files.map((file) =>
          uploadOnCloudinary(file.path),
        );
        const uploadResults = await Promise.all(uploadPromises);

        const newUrls = uploadResults
          .filter((result) => result !== null)
          .map((result) => result.secure_url || result.url);

        const existingVariantImages = variant.images || [];
        return { ...variant, images: [...existingVariantImages, ...newUrls] };
      }
      return variant;
    });

    parsedVariants = await Promise.all(variantProcessingPromises);
  }

  let parsedTags = tags;
  if (typeof tags === "string") {
    try {
      parsedTags = JSON.parse(tags);
    } catch (error) {
      parsedTags = tags.split(",").map((tag) => tag.trim());
    }
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (subCategory !== undefined) product.subCategory = subCategory;
  if (brand !== undefined) product.brand = brand;
  if (basePrice) product.basePrice = Number(basePrice);
  if (parsedVariants) product.variants = parsedVariants;
  if (parsedTags) product.tags = parsedTags;
  product.images = imageUrls;

  const updatedProduct = await product.save();

  if (!updatedProduct) {
    throw new ApiError(500, "Something went wrong while updating the product");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});
