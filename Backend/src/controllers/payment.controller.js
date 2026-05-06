import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);   

export const createPayment = asyncHandler(async (req, res) => {});
