
import pool from "../config/database.js";

export const getAdminCustomers = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
        );
        const offset = (page - 1) * limit;

        const searchCondition = search
            ? "AND (u.name LIKE ? OR u.email LIKE ? OR CAST(u.id AS CHAR) LIKE ?)"
            : "";

        const searchParams = search
            ? [`%${search}%`, `%${search}%`, `%${search}%`]
            : [];

        const [
            [customers],
            [countRows],
            [summaryRows]
        ] = await Promise.all([

            pool.execute(
                `
                SELECT
                    u.id,
                    u.name,
                    u.email,
                    u.created_at AS joined,
                    (
                        SELECT COUNT(*)
                        FROM orders o
                        WHERE o.user_id = u.id
                    ) AS totalOrders,
                    (
                        SELECT COALESCE(SUM(o.total_amount), 0)
                        FROM orders o
                        WHERE o.user_id = u.id
                          AND o.payment_status = 'paid'
                    ) AS totalSpent,
                    (
                        SELECT a.phone
                        FROM addresses a
                        WHERE a.user_id = u.id
                        ORDER BY a.is_default DESC, a.id DESC
                        LIMIT 1
                    ) AS phone,
                    (
                        SELECT CONCAT_WS(
                            ', ',
                            NULLIF(a.address_line1, ''),
                            NULLIF(a.city, ''),
                            NULLIF(a.state, ''),
                            NULLIF(a.postal_code, '')
                        )
                        FROM addresses a
                        WHERE a.user_id = u.id
                        ORDER BY a.is_default DESC, a.id DESC
                        LIMIT 1
                    ) AS location
                FROM users u
                WHERE u.role = 'customer'
                ${searchCondition}
                ORDER BY u.created_at DESC
                LIMIT ? OFFSET ?
                `,
                [...searchParams, limit, offset]
            ),

            pool.execute(
                `
                SELECT COUNT(*) AS total
                FROM users u
                WHERE u.role = 'customer'
                ${searchCondition}
                `,
                searchParams
            ),

            pool.execute(`
                SELECT
                    COUNT(*) AS totalCustomers,
                    COUNT(DISTINCT CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM orders o
                            WHERE o.user_id = u.id
                        )
                        THEN u.id
                    END) AS orderingCustomers,
                    COALESCE((
                        SELECT COUNT(*)
                        FROM orders
                        WHERE user_id IN (
                            SELECT id FROM users WHERE role = 'customer'
                        )
                    ), 0) AS totalOrders,
                    COALESCE((
                        SELECT SUM(total_amount)
                        FROM orders
                        WHERE payment_status = 'paid'
                          AND user_id IN (
                              SELECT id FROM users WHERE role = 'customer'
                          )
                    ), 0) AS totalSpent
                FROM users u
                WHERE u.role = 'customer'
            `)
        ]);

        const summary = summaryRows[0];

        return res.status(200).json({
            success: true,
            message: "Customers retrieved successfully.",
            data: {
                statistics: {
                    totalCustomers: Number(summary.totalCustomers || 0),
                    orderingCustomers: Number(summary.orderingCustomers || 0),
                    totalOrders: Number(summary.totalOrders || 0),
                    totalSpent: Number(summary.totalSpent || 0)
                },
                customers: customers.map(customer => ({
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    joined: customer.joined,
                    phone: customer.phone || null,
                    location: customer.location || null,
                    orders: Number(customer.totalOrders || 0),
                    spent: Number(customer.totalSpent || 0)
                })),
                pagination: {
                    page,
                    limit,
                    total: Number(countRows[0].total || 0),
                    totalPages: Math.ceil(
                        Number(countRows[0].total || 0) / limit
                    )
                }
            }
        });

    } catch (error) {
        console.error("Admin Customers Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve customers."
        });
    }
};

