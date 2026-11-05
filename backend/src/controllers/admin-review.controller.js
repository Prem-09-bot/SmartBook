
import pool from "../config/database.js";

export const getAdminReviews = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const rating = Number(req.query.rating) || null;
        const requestedStatus = String(req.query.status || "").toLowerCase();

        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const offset = (page - 1) * limit;

        const conditions = [];
        const params = [];

        if (search) {
            conditions.push(`(
                u.name LIKE ? OR
                u.email LIKE ? OR
                b.title LIKE ? OR
                r.title LIKE ? OR
                r.comment LIKE ? OR
                CAST(r.id AS CHAR) LIKE ?
            )`);

            const term = `%${search}%`;
            params.push(term, term, term, term, term, term);
        }

        if (rating && rating >= 1 && rating <= 5) {
            conditions.push("r.rating = ?");
            params.push(rating);
        }

        if (["pending", "approved", "rejected"].includes(requestedStatus)) {
            conditions.push("r.status = ?");
            params.push(requestedStatus);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const [
            [reviews],
            [countRows],
            [statsRows]
        ] = await Promise.all([
            pool.execute(
                `
                SELECT
                    r.id,
                    r.user_id AS userId,
                    r.book_id AS bookId,
                    r.order_id AS orderId,
                    r.rating,
                    r.title,
                    r.comment,
                    r.status,
                    r.created_at AS createdAt,
                    u.name AS customer,
                    u.email,
                    b.title AS book,
                    b.author
                FROM reviews r
                INNER JOIN users u ON u.id = r.user_id
                INNER JOIN books b ON b.id = r.book_id
                ${whereClause}
                ORDER BY r.created_at DESC, r.id DESC
                LIMIT ? OFFSET ?
                `,
                [...params, limit, offset]
            ),

            pool.execute(
                `
                SELECT COUNT(*) AS total
                FROM reviews r
                INNER JOIN users u ON u.id = r.user_id
                INNER JOIN books b ON b.id = r.book_id
                ${whereClause}
                `,
                params
            ),

            pool.execute(`
                SELECT
                    COUNT(*) AS totalReviews,
                    COALESCE(AVG(rating), 0) AS averageRating,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approvedReviews,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingReviews,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejectedReviews
                FROM reviews
            `)
        ]);

        const stats = statsRows[0];

        return res.status(200).json({
            success: true,
            message: "Reviews retrieved successfully.",
            data: {
                statistics: {
                    totalReviews: Number(stats.totalReviews || 0),
                    averageRating: Number(Number(stats.averageRating || 0).toFixed(1)),
                    approvedReviews: Number(stats.approvedReviews || 0),
                    pendingReviews: Number(stats.pendingReviews || 0),
                    rejectedReviews: Number(stats.rejectedReviews || 0)
                },
                reviews: reviews.map(review => ({
                    id: review.id,
                    userId: review.userId,
                    bookId: review.bookId,
                    orderId: review.orderId,
                    customer: review.customer,
                    email: review.email,
                    book: review.book,
                    author: review.author,
                    rating: Number(review.rating),
                    title: review.title,
                    review: review.comment,
                    date: review.createdAt,
                    status: review.status
                })),
                pagination: {
                    page,
                    limit,
                    total: Number(countRows[0].total || 0),
                    totalPages: Math.ceil(Number(countRows[0].total || 0) / limit)
                }
            }
        });

    } catch (error) {
        console.error("Admin Reviews Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve reviews."
        });
    }
};

export const updateAdminReviewStatus = async (req, res) => {
    try {
        const reviewId = Number(req.params.reviewId);
        const status = String(req.body.status || "").toLowerCase();

        if (!Number.isInteger(reviewId) || reviewId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID."
            });
        }

        if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be pending, approved, or rejected."
            });
        }

        const [result] = await pool.execute(
            "UPDATE reviews SET status = ? WHERE id = ?",
            [status, reviewId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review status updated successfully.",
            data: { id: reviewId, status }
        });

    } catch (error) {
        console.error("Update Admin Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update review status."
        });
    }
};

export const deleteAdminReview = async (req, res) => {
    try {
        const reviewId = Number(req.params.reviewId);

        if (!Number.isInteger(reviewId) || reviewId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID."
            });
        }

        const [result] = await pool.execute(
            "DELETE FROM reviews WHERE id = ?",
            [reviewId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully."
        });

    } catch (error) {
        console.error("Delete Admin Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete review."
        });
    }
};
