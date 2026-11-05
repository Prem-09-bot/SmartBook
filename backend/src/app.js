
import express from "express";
import cors from "cors";

import bookRoutes, {
    categoryRouter
} from "./routes/book.routes.js";

import authRoutes from "./routes/auth.routes.js";

import userRoutes from "./routes/user.routes.js";

import adminRoutes from "./routes/admin.routes.js";

import cartRoutes from "./routes/cart.routes.js";

import addressRoutes from "./routes/address.routes.js";

import checkoutRoutes from "./routes/checkout.routes.js";

import orderRoutes from "./routes/order.routes.js";

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SmartBook API is running"
    });
});

// Book APIs
app.use("/api/books", bookRoutes);

// Category APIs
app.use("/api/categories", categoryRouter);

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to SmartBook Backend API");
});

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes);

// Cart APIs
app.use("/api/cart", cartRoutes);

app.use("/api/addresses", addressRoutes);

// Checkout APIs
app.use("/api/checkout", checkoutRoutes);

// Order Management APIs
app.use("/api/orders", orderRoutes);

// Handle unknown routes - MUST BE LAST
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});


export default app;

