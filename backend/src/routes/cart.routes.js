import express from "express";

import {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from "../controllers/cart.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticateUser);

// GET: View customer cart
router.get("/", getCart);

// POST: Add book to cart
router.post("/items", addToCart);

// PUT: Update cart item quantity
router.put("/items/:itemId", updateCartItem);

// DELETE: Remove one cart item
router.delete("/items/:itemId", removeCartItem);

// DELETE: Clear entire cart
router.delete("/clear", clearCart);

export default router;
