
import pool from "../config/database.js";

// GET /api/admin/dashboard
export const getAdminDashboard = async (req, res) => {
    try {
        const [
            [orderStats],
            [customerStats],
            [bookStats],
            [lowStockBooks],
            [recentOrders]
        ] = await Promise.all([

            // Order statistics and revenue
            pool.query(`
                SELECT
                    COUNT(*) AS totalOrders,
                    COALESCE(SUM(order_status = 'pending'), 0) AS pendingOrders,
                    COALESCE(SUM(order_status = 'processing'), 0) AS processingOrders,
                    COALESCE(SUM(order_status = 'shipped'), 0) AS shippedOrders,
                    COALESCE(SUM(order_status = 'delivered'), 0) AS deliveredOrders,
                    COALESCE(SUM(order_status = 'cancelled'), 0) AS cancelledOrders,
                    COALESCE(
                        SUM(
                            CASE
                                WHEN payment_status = 'paid'
                                THEN total_amount
                                ELSE 0
                            END
                        ), 0
                    ) AS totalRevenue
                FROM orders
            `),

            // Customer statistics
            pool.query(`
                SELECT COUNT(*) AS totalCustomers
                FROM users
                WHERE role = 'customer'
            `),

            // Book statistics
            pool.query(`
                SELECT
                    COUNT(*) AS totalActiveBooks,
                    COALESCE(
                        SUM(stock_quantity <= 5), 0
                    ) AS lowStockCount,
                    COALESCE(
                        SUM(stock_quantity = 0), 0
                    ) AS outOfStockCount
                FROM books
                WHERE is_active = 1
            `),

            // Low-stock book details
            pool.query(`
                SELECT
                    id,
                    title,
                    author,
                    stock_quantity AS stockQuantity,
                    price
                FROM books
                WHERE is_active = 1
                  AND stock_quantity <= 5
                ORDER BY stock_quantity ASC, title ASC
                LIMIT 10
            `),

            // Latest five orders
            pool.query(`
                SELECT
                    o.id AS orderId,
                    o.order_number AS orderNumber,
                    u.name AS customerName,
                    u.email AS customerEmail,
                    o.total_amount AS totalAmount,
                    o.payment_method AS paymentMethod,
                    o.payment_status AS paymentStatus,
                    o.order_status AS orderStatus,
                    o.created_at AS createdAt
                FROM orders o
                JOIN users u ON u.id = o.user_id
                ORDER BY o.created_at DESC, o.id DESC
                LIMIT 5
            `)
        ]);

        return res.status(200).json({
            success: true,
            message: "Admin dashboard retrieved successfully.",
            data: {
                statistics: {
                    totalOrders: Number(orderStats[0].totalOrders),
                    pendingOrders: Number(orderStats[0].pendingOrders),
                    processingOrders: Number(orderStats[0].processingOrders),
                    shippedOrders: Number(orderStats[0].shippedOrders),
                    deliveredOrders: Number(orderStats[0].deliveredOrders),
                    cancelledOrders: Number(orderStats[0].cancelledOrders),
                    totalRevenue: orderStats[0].totalRevenue,
                    totalCustomers: Number(customerStats[0].totalCustomers),
                    totalActiveBooks: Number(bookStats[0].totalActiveBooks),
                    lowStockCount: Number(bookStats[0].lowStockCount),
                    outOfStockCount: Number(bookStats[0].outOfStockCount)
                },
                lowStockBooks,
                recentOrders
            }
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve admin dashboard."
        });
    }
};
