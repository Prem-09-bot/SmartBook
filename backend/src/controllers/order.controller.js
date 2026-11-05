
import pool from "../config/database.js";

// GET: Customer order history
export const getMyOrders = async (req, res) => {
    try {
        const [orders] = await pool.execute(
            `SELECT
                o.id,
                o.order_number AS orderNumber,
                o.subtotal,
                o.discount,
                o.shipping_charge AS shippingCharge,
                o.total_amount AS totalAmount,
                o.payment_method AS paymentMethod,
                o.payment_status AS paymentStatus,
                o.order_status AS orderStatus,
                o.created_at AS createdAt,
                COUNT(oi.id) AS itemCount
             FROM orders o
             LEFT JOIN order_items oi ON oi.order_id = o.id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.created_at DESC, o.id DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            success: true,
            message: "Order history retrieved successfully.",
            data: { orders }
        });

    } catch (error) {
        console.error("Get Orders Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve order history."
        });
    }
};


// GET: Details of a specific customer order
export const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!/^\d+$/.test(orderId) || Number(orderId) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const [orders] = await pool.execute(
            `SELECT
                id,
                order_number AS orderNumber,
                subtotal,
                discount,
                shipping_charge AS shippingCharge,
                total_amount AS totalAmount,
                payment_method AS paymentMethod,
                payment_status AS paymentStatus,
                order_status AS orderStatus,
                shipping_name AS shippingName,
                shipping_phone AS shippingPhone,
                shipping_address AS shippingAddress,
                shipping_city AS shippingCity,
                shipping_state AS shippingState,
                shipping_postal_code AS shippingPostalCode,
                notes,
                created_at AS createdAt,
                updated_at AS updatedAt
             FROM orders
             WHERE id = ? AND user_id = ?`,
            [Number(orderId), req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const [items] = await pool.execute(
            `SELECT
                id,
                book_id AS bookId,
                book_title AS bookTitle,
                book_author AS bookAuthor,
                book_slug AS bookSlug,
                quantity,
                unit_price AS unitPrice,
                subtotal
             FROM order_items
             WHERE order_id = ?
             ORDER BY id ASC`,
            [Number(orderId)]
        );

        const [payments] = await pool.execute(
            `SELECT
                id,
                payment_gateway AS paymentGateway,
                transaction_id AS transactionId,
                amount,
                payment_method AS paymentMethod,
                status,
                paid_at AS paidAt,
                created_at AS createdAt
             FROM payments
             WHERE order_id = ?
             ORDER BY id DESC`,
            [Number(orderId)]
        );

        return res.status(200).json({
            success: true,
            message: "Order details retrieved successfully.",
            data: {
                order: orders[0],
                items,
                payments
            }
        });

    } catch (error) {
        console.error("Get Order Details Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve order details."
        });
    }
};


// PATCH: Cancel a customer's eligible order
export const cancelOrder = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const { orderId } = req.params;

        if (!/^\d+$/.test(orderId) || Number(orderId) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        // Lock the order and verify ownership
        const [orders] = await connection.execute(
            `SELECT id, order_status AS orderStatus,
                    payment_status AS paymentStatus
             FROM orders
             WHERE id = ? AND user_id = ?
             FOR UPDATE`,
            [Number(orderId), req.user.id]
        );

        if (orders.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const order = orders[0];

        if (order.orderStatus === "cancelled") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(409).json({
                success: false,
                message: "This order has already been cancelled."
            });
        }

        if (!["pending", "processing"].includes(order.orderStatus)) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "This order can no longer be cancelled."
            });
        }

        // Paid orders require a separate refund workflow
        if (order.paymentStatus === "paid") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "This order requires payment refund processing before cancellation."
            });
        }

        // Lock order items
        const [items] = await connection.execute(
            `SELECT book_id AS bookId, quantity
             FROM order_items
             WHERE order_id = ?
             FOR UPDATE`,
            [Number(orderId)]
        );

        // Restore stock only for books that still exist
        for (const item of items) {
            if (item.bookId !== null) {
                await connection.execute(
                    `UPDATE books
                     SET stock_quantity = stock_quantity + ?
                     WHERE id = ?`,
                    [item.quantity, item.bookId]
                );
            }
        }

        // Change order status inside the same transaction
await connection.execute(
    `UPDATE orders
     SET order_status = 'cancelled',
         payment_status = 'failed'
     WHERE id = ? AND user_id = ?
       AND order_status IN ('pending', 'processing')`,
    [Number(orderId), req.user.id]
);

        // Update pending COD payment record
        await connection.execute(
            `UPDATE payments
             SET status = 'failed'
             WHERE order_id = ?
               AND status = 'pending'`,
            [Number(orderId)]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully. Stock has been restored.",
            data: {
                orderId: Number(orderId),
                orderStatus: "cancelled",
                restoredItems: items.length
            }
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Cancel Order Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel order."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};
