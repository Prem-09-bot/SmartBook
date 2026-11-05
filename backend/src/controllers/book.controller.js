
import pool from "../config/database.js";

// GET /api/books
// Supports search, category, sorting and pagination.

export const getAllBooks = async (req, res) => {
    try {
        const {
            search = "",
            category = "",
            sort = "newest",
            page = "1",
            limit = "12"
        } = req.query;

        const currentPage = Number(page);
        const pageLimit = Number(limit);

        if (
            !Number.isInteger(currentPage) ||
            currentPage < 1 ||
            !Number.isInteger(pageLimit) ||
            pageLimit < 1 ||
            pageLimit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination parameters."
            });
        }

        const offset = (currentPage - 1) * pageLimit;

        const conditions = ["b.is_active = TRUE"];
        const values = [];

        if (search.trim()) {
            conditions.push(
                "(b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)"
            );

            const keyword = `%${search.trim()}%`;
            values.push(keyword, keyword, keyword);
        }

        if (category.trim()) {
            conditions.push("c.slug = ?");
            values.push(category.trim());
        }

        const whereClause = conditions.join(" AND ");

        const sortOptions = {
            newest: "b.created_at DESC",
            price_low: "b.price ASC",
            price_high: "b.price DESC",
            rating: "b.rating DESC",
            title: "b.title ASC"
        };

        const orderBy = sortOptions[sort] || sortOptions.newest;

        const [countResult] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM books b
             LEFT JOIN categories c ON b.category_id = c.id
             WHERE ${whereClause}`,
            values
        );

        const [books] = await pool.execute(
            `SELECT
                b.id,
                b.slug,
                b.title,
                b.author,
                b.price,
                b.original_price AS originalPrice,
                b.rating,
                b.review_count AS reviewCount,
                b.badge,
                b.cover_color AS coverColor,
                b.cover_accent AS coverAccent,
                b.cover_text AS coverText,
                b.cover_image_url AS coverImageUrl,
                b.description,
                b.pages,
                b.language,
                b.stock_quantity AS stockQuantity,
                c.name AS category,
                c.slug AS categorySlug
             FROM books b
             LEFT JOIN categories c ON b.category_id = c.id
             WHERE ${whereClause}
             ORDER BY ${orderBy}
             LIMIT ? OFFSET ?`,
            [...values, pageLimit, offset]
        );

        const total = Number(countResult[0].total);

        return res.status(200).json({
            success: true,
            message: "Books retrieved successfully.",
            data: {
                books,
                pagination: {
                    total,
                    page: currentPage,
                    limit: pageLimit,
                    totalPages: Math.ceil(total / pageLimit)
                }
            }
        });

    } catch (error) {
        console.error("Get books error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve books."
        });
    }
};


// GET /api/books/:slug
// Retrieve one book using its existing frontend slug.

export const getBookBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const [books] = await pool.execute(
            `SELECT
                b.id,
                b.slug,
                b.title,
                b.author,
                b.price,
                b.original_price AS originalPrice,
                b.rating,
                b.review_count AS reviewCount,
                b.badge,
                b.cover_color AS coverColor,
                b.cover_accent AS coverAccent,
                b.cover_text AS coverText,
                b.cover_image_url AS coverImageUrl,
                b.description,
                b.pages,
                b.language,
                b.stock_quantity AS stockQuantity,
                c.name AS category,
                c.slug AS categorySlug
             FROM books b
             LEFT JOIN categories c ON b.category_id = c.id
             WHERE b.slug = ? AND b.is_active = TRUE
             LIMIT 1`,
            [slug]
        );

        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Book retrieved successfully.",
            data: books[0]
        });

    } catch (error) {
        console.error("Get book details error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve book details."
        });
    }
};


// GET /api/categories

export const getAllCategories = async (req, res) => {
    try {
        const [categories] = await pool.execute(
            `SELECT
                id,
                name,
                slug,
                description
             FROM categories
             WHERE is_active = TRUE
             ORDER BY name ASC`
        );

        return res.status(200).json({
            success: true,
            message: "Categories retrieved successfully.",
            data: categories
        });

    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve categories."
        });
    }
};
