
import pool from "../config/database.js";

export const getAdminAnalytics = async (req, res) => {
    try {
        const [
            [monthlyRows],
            [customerRows],
            [topSellingBooks],
            [paymentRows],
            [summaryRows]
        ] = await Promise.all([

            // Monthly orders and paid revenue for the last 12 months
            pool.execute(`
                SELECT
                    DATE_FORMAT(created_at, '%Y-%m') AS month,
                    COUNT(*) AS totalOrders,
                    SUM(
                        CASE
                            WHEN payment_status = 'paid'
                            THEN total_amount
                            ELSE 0
                        END
                    ) AS revenue
                FROM orders
                WHERE created_at >= DATE_FORMAT(
                    DATE_SUB(CURDATE(), INTERVAL 11 MONTH),
                    '%Y-%m-01'
                )
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC
            `),

            // New customer registrations by month
            pool.execute(`
                SELECT
                    DATE_FORMAT(created_at, '%Y-%m') AS month,
                    COUNT(*) AS totalCustomers
                FROM users
                WHERE role = 'customer'
                  AND created_at >= DATE_FORMAT(
                      DATE_SUB(CURDATE(), INTERVAL 11 MONTH),
                      '%Y-%m-01'
                  )
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC
            `),

            // Top five books based on paid, non-cancelled orders
            pool.execute(`
                SELECT
                    oi.book_id AS bookId,
                    oi.book_title AS title,
                    oi.book_author AS author,
                    SUM(oi.quantity) AS unitsSold,
                    SUM(oi.subtotal) AS revenue
                FROM order_items oi
                INNER JOIN orders o ON o.id = oi.order_id
                WHERE o.payment_status = 'paid'
                  AND o.order_status != 'cancelled'
                GROUP BY
                    oi.book_id,
                    oi.book_title,
                    oi.book_author
                ORDER BY unitsSold DESC, revenue DESC
                LIMIT 5
            `),

            // Payment method breakdown
            pool.execute(`
                SELECT
                    payment_method AS paymentMethod,
                    COUNT(*) AS totalOrders,
                    SUM(
                        CASE
                            WHEN payment_status = 'paid'
                            THEN total_amount
                            ELSE 0
                        END
                    ) AS revenue
                FROM orders
                GROUP BY payment_method
                ORDER BY totalOrders DESC
            `),

            // Overall analytics summary
            pool.execute(`
                SELECT
                    COUNT(*) AS totalOrders,
                    SUM(
                        CASE
                            WHEN payment_status = 'paid'
                            THEN total_amount
                            ELSE 0
                        END
                    ) AS totalRevenue,
                    COUNT(DISTINCT user_id) AS orderingCustomers,
                    SUM(
                        CASE WHEN order_status = 'cancelled'
                        THEN 1 ELSE 0 END
                    ) AS cancelledOrders,
                    SUM(
                        CASE WHEN payment_status = 'paid'
                        THEN 1 ELSE 0 END
                    ) AS paidOrders
                FROM orders
            `)
        ]);

        // Create all 12 month labels, including months with zero activity
        const monthlyData = [];

        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );

            const year = date.getFullYear();
            const monthNumber = String(
                date.getMonth() + 1
            ).padStart(2, "0");

            const monthKey = `${year}-${monthNumber}`;

            const orderData = monthlyRows.find(
                row => row.month === monthKey
            );

            const customerData = customerRows.find(
                row => row.month === monthKey
            );

            monthlyData.push({
                month: monthKey,
                label: date.toLocaleString("en-IN", {
                    month: "short"
                }),
                totalOrders: Number(orderData?.totalOrders || 0),
                revenue: Number(orderData?.revenue || 0),
                newCustomers: Number(
                    customerData?.totalCustomers || 0
                )
            });
        }

        const summary = summaryRows[0] || {};

        return res.status(200).json({
            success: true,
            message: "Admin analytics retrieved successfully.",
            data: {
                summary: {
                    totalOrders: Number(summary.totalOrders || 0),
                    totalRevenue: Number(summary.totalRevenue || 0),
                    orderingCustomers: Number(
                        summary.orderingCustomers || 0
                    ),
                    cancelledOrders: Number(
                        summary.cancelledOrders || 0
                    ),
                    paidOrders: Number(summary.paidOrders || 0)
                },
                monthlyData,
                topSellingBooks: topSellingBooks.map(book => ({
                    bookId: book.bookId,
                    title: book.title,
                    author: book.author,
                    unitsSold: Number(book.unitsSold || 0),
                    revenue: Number(book.revenue || 0)
                })),
                paymentMethods: paymentRows.map(payment => ({
                    paymentMethod: payment.paymentMethod,
                    totalOrders: Number(payment.totalOrders || 0),
                    revenue: Number(payment.revenue || 0)
                }))
            }
        });

    } catch (error) {
        console.error("Admin Analytics Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve analytics data."
        });
    }
};
