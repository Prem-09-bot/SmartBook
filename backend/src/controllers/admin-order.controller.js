
import pool from "../config/database.js";

// GET: Retrieve all customer orders with search and filters
export const getAdminOrders = async (req, res) => {
    try {
        const {
            search = "",
            orderStatus = "",
            paymentStatus = "",
            page = "1",
            limit = "10"
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) || pageNumber < 1 ||
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 || limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination parameters."
            });
        }

        const allowedOrderStatuses = [
            "pending", "processing", "shipped",
            "delivered", "cancelled"
        ];

        const allowedPaymentStatuses = [
            "pending", "paid", "failed", "refunded"
        ];

        if (
            orderStatus &&
            !allowedOrderStatuses.includes(orderStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status filter."
            });
        }

        if (
            paymentStatus &&
            !allowedPaymentStatuses.includes(paymentStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status filter."
            });
        }

        const conditions = [];
        const values = [];

        if (search.trim()) {
            const term = `%${search.trim()}%`;

            conditions.push(`(
                o.order_number LIKE ?
                OR o.shipping_name LIKE ?
                OR o.shipping_phone LIKE ?
                OR u.email LIKE ?
            )`);

            values.push(term, term, term, term);
        }

        if (orderStatus) {
            conditions.push("o.order_status = ?");
            values.push(orderStatus);
        }

        if (paymentStatus) {
            conditions.push("o.payment_status = ?");
            values.push(paymentStatus);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const [countResult] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM orders o
             INNER JOIN users u ON u.id = o.user_id
             ${whereClause}`,
            values
        );

        const total = Number(countResult[0].total);
        const offset = (pageNumber - 1) * limitNumber;

        const [orders] = await pool.execute(
            `SELECT
                o.id,
                o.order_number AS orderNumber,
                o.user_id AS userId,
                u.name AS customerName,
                u.email AS customerEmail,
                o.total_amount AS totalAmount,
                o.payment_method AS paymentMethod,
                o.payment_status AS paymentStatus,
                o.order_status AS orderStatus,
                o.created_at AS createdAt,
                COUNT(oi.id) AS itemCount
             FROM orders o
             INNER JOIN users u ON u.id = o.user_id
             LEFT JOIN order_items oi ON oi.order_id = o.id
             ${whereClause}
             GROUP BY o.id
             ORDER BY o.created_at DESC, o.id DESC
             LIMIT ? OFFSET ?`,
            [...values, limitNumber, offset]
        );

        return res.status(200).json({
            success: true,
            message: "Admin orders retrieved successfully.",
            data: {
                orders,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(total / limitNumber)
                }
            }
        });

    } catch (error) {
        console.error("Admin Get Orders Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve orders."
        });
    }
};


// GET: Retrieve complete details of an order
export const getAdminOrderDetails = async (req, res) => {
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
                o.*,
                u.name AS customerName,
                u.email AS customerEmail
             FROM orders o
             INNER JOIN users u ON u.id = o.user_id
             WHERE o.id = ?`,
            [Number(orderId)]
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
                gateway_order_id AS gatewayOrderId,
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
            message: "Admin order details retrieved successfully.",
            data: {
                order: orders[0],
                items,
                payments
            }
        });

    } catch (error) {
        console.error("Admin Order Details Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve order details."
        });
    }
};


// PATCH: Update order status
export const updateAdminOrderStatus = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        if (!/^\d+$/.test(orderId) || Number(orderId) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const allowedTransitions = {
            pending: ["processing"],
            processing: ["shipped"],
            shipped: ["delivered"],
            delivered: [],
            cancelled: []
        };

        if (
            typeof orderStatus !== "string" ||
            !Object.hasOwn(allowedTransitions, orderStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status."
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        const [orders] = await connection.execute(
            `SELECT id, order_status AS orderStatus,
                    payment_status AS paymentStatus
             FROM orders
             WHERE id = ?
             FOR UPDATE`,
            [Number(orderId)]
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

        if (
            !allowedTransitions[order.orderStatus].includes(orderStatus)
        ) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}.`
            });
        }

        if (
            orderStatus === "processing" &&
            order.paymentStatus !== "paid" &&
            order.paymentStatus !== "pending"
        ) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "This order cannot be processed with its current payment status."
            });
        }

        await connection.execute(
            `UPDATE orders
             SET order_status = ?
             WHERE id = ?`,
            [orderStatus, Number(orderId)]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            data: {
                orderId: Number(orderId),
                previousStatus: order.orderStatus,
                orderStatus
            }
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Admin Update Order Status Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update order status."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};
