import express from "express";
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from "../controllers/checkout.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/", createOrder);
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);

export default router;

