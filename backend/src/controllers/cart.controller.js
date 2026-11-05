import pool from "../config/database.js";

// Get or create the customer's cart
const getOrCreateCart = async (userId, connection) => {
    const [existingCart] = await connection.execute(
        "SELECT id FROM carts WHERE user_id = ?",
        [userId]
    );

    if (existingCart.length > 0) {
        return existingCart[0].id;
    }

    const [result] = await connection.execute(
        "INSERT INTO carts (user_id) VALUES (?)",
        [userId]
    );

    return result.insertId;
};

// POST: Add a book to cart
export const addToCart = async (req, res) => {
    try {
        const { bookId, quantity = 1 } = req.body;

        if (
            !Number.isInteger(bookId) ||
            bookId < 1 ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid book ID and quantity are required."
            });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [books] = await connection.execute(
                `SELECT id, title, price, stock_quantity
                 FROM books
                 WHERE id = ? AND is_active = 1
                 FOR UPDATE`,
                [bookId]
            );

            if (books.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: "Book not found or unavailable."
                });
            }

            const book = books[0];

            const cartId = await getOrCreateCart(
                req.user.id,
                connection
            );

            const [existingItems] = await connection.execute(
                `SELECT id, quantity
                 FROM cart_items
                 WHERE cart_id = ? AND book_id = ?
                 FOR UPDATE`,
                [cartId, bookId]
            );

            const newQuantity =
                (existingItems[0]?.quantity || 0) + quantity;

            if (newQuantity > book.stock_quantity) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: `Only ${book.stock_quantity} units are available.`,
                    data: {
                        availableStock: book.stock_quantity,
                        requestedQuantity: newQuantity
                    }
                });
            }

            if (existingItems.length > 0) {
                await connection.execute(
                    `UPDATE cart_items
                     SET quantity = ?
                     WHERE id = ?`,
                    [newQuantity, existingItems[0].id]
                );
            } else {
                await connection.execute(
                    `INSERT INTO cart_items
                     (cart_id, book_id, quantity)
                     VALUES (?, ?, ?)`,
                    [cartId, bookId, quantity]
                );
            }

            await connection.commit();

            return res.status(200).json({
                success: true,
                message: "Book added to cart successfully.",
                data: {
                    cartId,
                    bookId,
                    title: book.title,
                    quantity: newQuantity,
                    unitPrice: book.price
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Add To Cart Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to add book to cart."
        });
    }
};

// GET: Retrieve the customer's cart
export const getCart = async (req, res) => {
    try {
        const [carts] = await pool.execute(
            "SELECT id FROM carts WHERE user_id = ?",
            [req.user.id]
        );

        if (carts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Your cart is empty.",
                data: {
                    cartId: null,
                    items: [],
                    totalItems: 0,
                    subtotal: 0
                }
            });
        }

        const cartId = carts[0].id;

        const [items] = await pool.execute(
            `SELECT
                ci.id AS cartItemId,
                b.id AS bookId,
                b.slug,
                b.title,
                b.author,
                b.price,
                b.cover_image_url AS coverImageUrl,
                ci.quantity,
                b.stock_quantity AS availableStock,
                (b.price * ci.quantity) AS itemSubtotal
             FROM cart_items ci
             INNER JOIN books b ON b.id = ci.book_id
             WHERE ci.cart_id = ?
               AND b.is_active = 1
             ORDER BY ci.created_at DESC`,
            [cartId]
        );

        const totalItems = items.reduce(
            (total, item) => total + item.quantity,
            0
        );

        const subtotal = items.reduce(
            (total, item) => total + Number(item.itemSubtotal),
            0
        );

        return res.status(200).json({
            success: true,
            message: items.length ? "Cart retrieved successfully." : "Your cart is empty.",
            data: {
                cartId,
                items,
                totalItems,
                subtotal: Number(subtotal.toFixed(2))
            }
        });

    } catch (error) {
        console.error("Get Cart Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve your cart."
        });
    }
};

// PUT: Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!/^\d+$/.test(itemId) || Number(itemId) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item ID."
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer."
            });
        }

        const [items] = await pool.execute(
            `SELECT ci.id, b.id AS bookId, b.stock_quantity
             FROM cart_items ci
             INNER JOIN carts c ON c.id = ci.cart_id
             INNER JOIN books b ON b.id = ci.book_id
             WHERE ci.id = ? AND c.user_id = ? AND b.is_active = 1`,
            [itemId, req.user.id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found."
            });
        }

        const item = items[0];

        if (quantity > item.stock_quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${item.stock_quantity} units are available.`,
                data: {
                    availableStock: item.stock_quantity,
                    requestedQuantity: quantity
                }
            });
        }

        await pool.execute(
            "UPDATE cart_items SET quantity = ? WHERE id = ?",
            [quantity, itemId]
        );

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully.",
            data: {
                cartItemId: Number(itemId),
                bookId: item.bookId,
                quantity
            }
        });

    } catch (error) {
        console.error("Update Cart Item Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update cart quantity."
        });
    }
};


// DELETE: Remove an item from the customer's cart
export const removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        if (!/^\d+$/.test(itemId) || Number(itemId) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item ID."
            });
        }

        const [result] = await pool.execute(
            `DELETE ci
             FROM cart_items ci
             INNER JOIN carts c ON c.id = ci.cart_id
             WHERE ci.id = ? AND c.user_id = ?`,
            [itemId, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item removed from cart successfully."
        });

    } catch (error) {
        console.error("Remove Cart Item Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to remove cart item."
        });
    }
};


// DELETE: Clear the customer's entire cart
export const clearCart = async (req, res) => {
    try {
        const [carts] = await pool.execute(
            "SELECT id FROM carts WHERE user_id = ?",
            [req.user.id]
        );

        if (carts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Cart is already empty."
            });
        }

        await pool.execute(
            "DELETE FROM cart_items WHERE cart_id = ?",
            [carts[0].id]
        );

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully."
        });

    } catch (error) {
        console.error("Clear Cart Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to clear cart."
        });
    }
};
