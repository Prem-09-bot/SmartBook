import express from "express";

import {
    authenticateUser,
    authorizeAdmin
} from "../middleware/auth.middleware.js";

import {
    getAdminBooks,
    createBook,
    updateBook,
    deleteBook,
    updateBookStock
} from "../controllers/admin-book.controller.js";

import {
    getAdminOrders,
    getAdminOrderDetails,
    updateAdminOrderStatus
} from "../controllers/admin-order.controller.js";

import {
    getAdminPayments,
    collectCodPayment
} from "../controllers/admin-payment.controller.js";

import {
    getAdminDashboard
} from "../controllers/admin-dashboard.controller.js";

import {
    getAdminAnalytics
} from "../controllers/admin-analytics.controller.js";

import {
    getAdminCustomers
} from "../controllers/admin-customer.controller.js";

import {
    getAdminReviews,
    updateAdminReviewStatus,
    deleteAdminReview
} from "../controllers/admin-review.controller.js";

import {
    getAdminCoupons,
    createAdminCoupon,
    updateAdminCoupon,
    updateAdminCouponStatus,
    deleteAdminCoupon
} from "../controllers/admin-coupon.controller.js";

const router = express.Router();

// All admin routes require authentication and admin authorization
router.use(authenticateUser, authorizeAdmin);

// Admin coupon management
router.get("/coupons", getAdminCoupons);
router.post("/coupons", createAdminCoupon);
router.put("/coupons/:couponId", updateAdminCoupon);
router.patch("/coupons/:couponId/status", updateAdminCouponStatus);
router.delete("/coupons/:couponId", deleteAdminCoupon);

// Admin review management
router.get("/reviews", getAdminReviews);
router.patch("/reviews/:reviewId/status", updateAdminReviewStatus);
router.delete("/reviews/:reviewId", deleteAdminReview);

// Admin book management
router.get("/books", getAdminBooks);
router.post("/books", createBook);
router.put("/books/:id", updateBook);
router.delete("/books/:id", deleteBook);
router.patch("/books/:id/stock", updateBookStock);

// Admin order management
router.get("/orders", getAdminOrders);
router.get("/orders/:orderId", getAdminOrderDetails);
router.patch("/orders/:orderId/status", updateAdminOrderStatus);

// Admin payment management
router.get("/payments", getAdminPayments);

router.patch(
    "/payments/orders/:orderId/collect-cod",
    collectCodPayment
);

// Admin dashboard
router.get("/dashboard", getAdminDashboard);

// Admin analytics
router.get("/analytics", getAdminAnalytics);

router.get("/customers", getAdminCustomers);


// Admin authorization test
router.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Admin authorization successful.",
        data: {
            userId: req.user.id,
            role: req.user.role
        }
    });
});

export default router;
