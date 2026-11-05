import pool from "../config/database.js";

// GET: Admin - Retrieve all books
export const getAdminBooks = async (req, res) => {
    try {
        const [books] = await pool.execute(
            `SELECT
                b.id,
                b.slug,
                b.title,
                b.author,
                b.category_id AS categoryId,
                c.name AS category,
                b.price,
                b.original_price AS originalPrice,
                (
                    SELECT ROUND(AVG(r.rating), 1)
                    FROM reviews r
                    WHERE r.book_id = b.id
                      AND r.status = 'approved'
                ) AS rating,
                (
                    SELECT COUNT(*)
                    FROM reviews r
                    WHERE r.book_id = b.id
                      AND r.status = 'approved'
                ) AS reviewCount,
                b.badge,
                b.cover_color AS coverColor,
                b.cover_accent AS coverAccent,
                b.cover_text AS coverText,
                b.cover_image_url AS coverImageUrl,
                b.description,
                b.pages,
                b.language,
                b.isbn,
                b.stock_quantity AS stockQuantity,
                b.is_active AS isActive,
                b.created_at AS createdAt,
                b.updated_at AS updatedAt
             FROM books b
             LEFT JOIN categories c ON b.category_id = c.id
             ORDER BY b.created_at DESC`
        );

        return res.status(200).json({
            success: true,
            message: "Admin books retrieved successfully.",
            data: {
                books
            }
        });

    } catch (error) {
        console.error("Admin Books Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve books."
        });
    }
};


// POST: Admin - Create a new book
export const createBook = async (req, res) => {
    try {
        const {
            title,
            author,
            categoryId,
            price,
            originalPrice,
            badge,
            coverColor,
            coverAccent,
            coverText,
            coverImageUrl,
            description,
            pages,
            language,
            isbn,
            stockQuantity
        } = req.body;

        if (!title?.trim() || !author?.trim() || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Title, author, and price are required."
            });
        }

        const parsedPrice = Number(price);
        const parsedStock = Number(stockQuantity ?? 0);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number."
            });
        }

        if (!Number.isInteger(parsedStock) || parsedStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity must be a non-negative integer."
            });
        }

        if (categoryId !== undefined && categoryId !== null) {
            const [categories] = await pool.execute(
                "SELECT id FROM categories WHERE id = ? AND is_active = 1",
                [categoryId]
            );

            if (categories.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Selected category does not exist."
                });
            }
        }

        const baseSlug = title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 160);

        if (!baseSlug) {
            return res.status(400).json({
                success: false,
                message: "Unable to generate a valid book slug."
            });
        }

        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const [existing] = await pool.execute(
                "SELECT id FROM books WHERE slug = ? LIMIT 1",
                [slug]
            );

            if (existing.length === 0) break;

            slug = `${baseSlug}-${counter++}`;
        }

        const [result] = await pool.execute(
            `INSERT INTO books (
                slug, title, author, category_id, price,
                original_price, badge, cover_color, cover_accent,
                cover_text, cover_image_url, description, pages,
                language, isbn, stock_quantity, rating, review_count,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)`,
            [
                slug,
                title.trim(),
                author.trim(),
                categoryId || null,
                parsedPrice,
                originalPrice ?? null,
                badge || null,
                coverColor || null,
                coverAccent || null,
                coverText || null,
                coverImageUrl || null,
                description || null,
                pages ?? null,
                language || "English",
                isbn || null,
                parsedStock
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Book created successfully.",
            data: {
                id: result.insertId,
                slug
            }
        });

    } catch (error) {
        console.error("Create Book Error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "A book with this ISBN already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create book."
        });
    }
};


// PUT: Admin - Update book details
export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id) || Number(id) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID."
            });
        }

        const allowedFields = {
            title: "title",
            author: "author",
            categoryId: "category_id",
            price: "price",
            originalPrice: "original_price",
            badge: "badge",
            coverColor: "cover_color",
            coverAccent: "cover_accent",
            coverText: "cover_text",
            coverImageUrl: "cover_image_url",
            description: "description",
            pages: "pages",
            language: "language",
            isbn: "isbn",
            stockQuantity: "stock_quantity"
        };

        const updates = [];
        const values = [];

        for (const [field, column] of Object.entries(allowedFields)) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                let value = req.body[field];

                if (["title", "author"].includes(field)) {
                    if (typeof value !== "string" || !value.trim()) {
                        return res.status(400).json({
                            success: false,
                            message: `${field} must be a non-empty string.`
                        });
                    }
                    value = value.trim();
                }

                if (["price", "originalPrice"].includes(field) && value !== null) {
                    value = Number(value);

                    if (!Number.isFinite(value) || value < 0) {
                        return res.status(400).json({
                            success: false,
                            message: `${field} must be a non-negative number.`
                        });
                    }
                }

                if (["pages", "stockQuantity"].includes(field) && value !== null) {
                    value = Number(value);

                    if (!Number.isInteger(value) || value < 0) {
                        return res.status(400).json({
                            success: false,
                            message: `${field} must be a non-negative integer.`
                        });
                    }
                }

                if (field === "categoryId" && value !== null) {
                    value = Number(value);

                    if (!Number.isInteger(value) || value < 1) {
                        return res.status(400).json({
                            success: false,
                            message: "Invalid category ID."
                        });
                    }

                    const [categories] = await pool.execute(
                        "SELECT id FROM categories WHERE id = ? AND is_active = 1",
                        [value]
                    );

                    if (categories.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: "Selected category does not exist."
                        });
                    }
                }

                updates.push(`${column} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update."
            });
        }

        const [existingBooks] = await pool.execute(
            "SELECT id FROM books WHERE id = ?",
            [id]
        );

        if (existingBooks.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found."
            });
        }

        values.push(id);

        const [result] = await pool.execute(
            `UPDATE books SET ${updates.join(", ")} WHERE id = ?`,
            values
        );

        return res.status(200).json({
            success: true,
            message: "Book updated successfully.",
            data: {
                id: Number(id),
                affectedRows: result.affectedRows
            }
        });

    } catch (error) {
        console.error("Update Book Error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This ISBN is already assigned to another book."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update book."
        });
    }
};


// DELETE: Admin - Soft-delete a book
export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id) || Number(id) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID."
            });
        }

        const [result] = await pool.execute(
            `UPDATE books
             SET is_active = 0
             WHERE id = ? AND is_active = 1`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found or already inactive."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Book successfully deactivated.",
            data: {
                id: Number(id),
                isActive: false
            }
        });

    } catch (error) {
        console.error("Delete Book Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to deactivate book."
        });
    }
};


// PATCH: Admin - Update book inventory
export const updateBookStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stockQuantity } = req.body;

        if (!/^\d+$/.test(id) || Number(id) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID."
            });
        }

        if (
            stockQuantity === undefined ||
            !Number.isInteger(stockQuantity) ||
            stockQuantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity must be a non-negative integer."
            });
        }

        const [result] = await pool.execute(
            `UPDATE books
             SET stock_quantity = ?
             WHERE id = ? AND is_active = 1`,
            [stockQuantity, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Active book not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Book inventory updated successfully.",
            data: {
                id: Number(id),
                stockQuantity
            }
        });

    } catch (error) {
        console.error("Update Book Stock Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update book inventory."
        });
    }
};
