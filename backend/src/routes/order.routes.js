import express from "express";

import {
    getMyOrders,
    getOrderDetails,
    cancelOrder
} from "../controllers/order.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);

// Customer order history
router.get("/", getMyOrders);

// Specific order details
router.get("/:orderId", getOrderDetails);

// Cancel an eligible order
router.patch("/:orderId/cancel", cancelOrder);

export default router;

