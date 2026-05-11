import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const ipLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: {
    message: "Too many requests from this IP, please try again after a minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const userLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    return req.user ? String(req.user._id) : ipKeyGenerator(req);
  },
  message: {
    message:
      "Too many requests from this user, please try again after a minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
