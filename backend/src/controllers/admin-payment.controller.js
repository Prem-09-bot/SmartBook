
import pool from "../config/database.js";

// GET /api/admin/payments
export const getAdminPayments = async (req, res) => {
    try {
        const {
            search = "",
            paymentStatus,
            paymentMethod,
            page = 1,
            limit = 10
        } = req.query;

        if (typeof search !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid search parameter."
            });
        }

        const allowedStatuses = ["pending", "paid", "failed", "refunded"];
        const allowedMethods = ["COD", "UPI", "CARD", "NETBANKING"];

        if (paymentStatus && !allowedStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status."
            });
        }

        if (paymentMethod && !allowedMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method."
            });
        }

        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));
        const offset = (pageNumber - 1) * limitNumber;

        const conditions = [];
        const values = [];

        if (search.trim()) {
            conditions.push(`(
                o.order_number LIKE ?
                OR u.name LIKE ?
                OR u.email LIKE ?
            )`);

            const term = `%${search.trim()}%`;
            values.push(term, term, term);
        }

        if (paymentStatus) {
            conditions.push("o.payment_status = ?");
            values.push(paymentStatus);
        }

        if (paymentMethod) {
            conditions.push("o.payment_method = ?");
            values.push(paymentMethod);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const [countRows] = await pool.query(
            `SELECT COUNT(*) AS total
             FROM orders o
             JOIN users u ON u.id = o.user_id
             ${whereClause}`,
            values
        );

        const [payments] = await pool.query(
            `SELECT
                p.id AS paymentId,
                o.id AS orderId,
                o.order_number AS orderNumber,
                u.name AS customerName,
                u.email AS customerEmail,
                o.total_amount AS amount,
                o.payment_method AS paymentMethod,
                o.payment_status AS paymentStatus,
                p.status AS transactionStatus,
                p.payment_gateway AS paymentGateway,
                p.transaction_id AS transactionId,
                p.paid_at AS paidAt,
                o.order_status AS orderStatus,
                o.created_at AS orderDate
             FROM orders o
             JOIN users u ON u.id = o.user_id
             LEFT JOIN payments p ON p.order_id = o.id
             ${whereClause}
             ORDER BY o.created_at DESC, o.id DESC
             LIMIT ? OFFSET ?`,
            [...values, limitNumber, offset]
        );

        const total = Number(countRows[0].total);

        return res.status(200).json({
            success: true,
            message: "Admin payments retrieved successfully.",
            data: {
                payments,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(total / limitNumber)
                }
            }
        });
    } catch (error) {
        console.error("Get admin payments error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve payments."
        });
    }
};


// PATCH /api/admin/payments/orders/:orderId/collect-cod
export const collectCodPayment = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const orderId = Number(req.params.orderId);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        await connection.beginTransaction();

        const [orders] = await connection.query(
            `SELECT id, order_number, payment_method,
                    payment_status, order_status, total_amount
             FROM orders
             WHERE id = ?
             FOR UPDATE`,
            [orderId]
        );

        if (orders.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const order = orders[0];

        if (order.payment_method !== "COD") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "COD collection is only available for COD orders."
            });
        }

        if (order.order_status !== "delivered") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "COD payment can only be collected for delivered orders."
            });
        }

        if (order.payment_status === "paid") {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Payment has already been collected."
            });
        }

        if (order.payment_status !== "pending") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: `Cannot collect payment with status ${order.payment_status}.`
            });
        }

        const [payments] = await connection.query(
            `SELECT id, status
             FROM payments
             WHERE order_id = ?
             ORDER BY id DESC
             LIMIT 1
             FOR UPDATE`,
            [orderId]
        );

        if (payments.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Payment record not found."
            });
        }

        if (payments[0].status !== "pending") {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Payment record is not pending. Collection rejected."
            });
        }

        await connection.query(
            `UPDATE payments
             SET status = 'success',
                 paid_at = NOW()
             WHERE id = ?`,
            [payments[0].id]
        );

        await connection.query(
            `UPDATE orders
             SET payment_status = 'paid'
             WHERE id = ?`,
            [orderId]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "COD payment collected successfully.",
            data: {
                orderId: order.id,
                orderNumber: order.order_number,
                paymentMethod: order.payment_method,
                paymentStatus: "paid",
                paymentRecordStatus: "success",
                amountCollected: order.total_amount
            }
        });
    } catch (error) {
        await connection.rollback();

        console.error("COD collection error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to record COD payment collection."
        });
    } finally {
        connection.release();
    }
};

