import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) =>
    req.user?._id?.toString() || ipKeyGenerator(req),

  message: {
    success: false,
    message: "Post creation limit reached.",
  },
});

export default postLimiter;