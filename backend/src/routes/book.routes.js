
import express from "express";

import {
    getAllBooks,
    getBookBySlug,
    getAllCategories
} from "../controllers/book.controller.js";

const router = express.Router();

// GET /api/books
router.get("/", getAllBooks);

// GET /api/books/:slug
router.get("/:slug", getBookBySlug);

// GET /api/categories
export const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategories);

export default router;
