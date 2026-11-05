
import pool from "../config/database.js";

const normalizeCoupon = (row) => ({
    id: row.id,
    code: row.code,
    type: row.discount_type === "percentage" ? "Percentage" : "Fixed",
    value: Number(row.discount_value),
    minOrder: Number(row.min_order),
    maxDiscount: row.max_discount === null ? 0 : Number(row.max_discount),
    usageLimit: Number(row.usage_limit || 0),
    usedCount: Number(row.used_count || 0),
    expiryDate: row.expiry_date
        ? new Date(row.expiry_date).toISOString().slice(0, 10)
        : "",
    active: Boolean(row.is_active),
});

const validateCoupon = (body) => {
    const code = String(body.code || "").trim().toUpperCase();
    const type = String(body.type || "").toLowerCase();
    const value = Number(body.value);
    const minOrder = Number(body.minOrder ?? 0);
    const maxDiscount = Number(body.maxDiscount ?? 0);
    const usageLimit = Number(body.usageLimit ?? 0);
    const expiryDate = String(body.expiryDate || "");

    if (!/^[A-Z0-9_-]{3,50}$/.test(code)) {
        return { error: "Coupon code must contain 3–50 letters, numbers, underscores or hyphens." };
    }

    if (!["percentage", "fixed"].includes(type)) {
        return { error: "Discount type must be Percentage or Fixed." };
    }

    if (!Number.isFinite(value) || value <= 0) {
        return { error: "Discount value must be greater than zero." };
    }

    if (type === "percentage" && value > 100) {
        return { error: "Percentage discount cannot exceed 100%." };
    }

    if (!Number.isFinite(minOrder) || minOrder < 0) {
        return { error: "Minimum order cannot be negative." };
    }

    if (!Number.isFinite(maxDiscount) || maxDiscount < 0) {
        return { error: "Maximum discount cannot be negative." };
    }

    if (!Number.isInteger(usageLimit) || usageLimit < 0) {
        return { error: "Usage limit must be a non-negative whole number." };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
        return { error: "A valid expiry date is required." };
    }

    const parsedDate = new Date(`${expiryDate}T00:00:00Z`);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== expiryDate
    ) {
        return { error: "Invalid expiry date." };
    }

    return {
        data: {
            code,
            discountType: type,
            value,
            minOrder,
            maxDiscount: maxDiscount || null,
            usageLimit,
            expiryDate: `${expiryDate} 23:59:59`,
            active: body.active !== false,
        },
    };
};

export const getAdminCoupons = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const status = String(req.query.status || "all").toLowerCase();

        const conditions = [];
        const params = [];

        if (search) {
            conditions.push("code LIKE ?");
            params.push(`%${search}%`);
        }

        if (status === "active") {
            conditions.push("is_active = TRUE");
        } else if (status === "inactive") {
            conditions.push("is_active = FALSE");
        }

        const where = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const [[rows], [statsRows]] = await Promise.all([
            pool.execute(
                `SELECT * FROM coupons ${where} ORDER BY created_at DESC, id DESC`,
                params
            ),
            pool.execute(`
                SELECT
                    COUNT(*) AS totalCoupons,
                    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS activeCoupons,
                    SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS inactiveCoupons,
                    COALESCE(SUM(used_count), 0) AS totalRedemptions
                FROM coupons
            `),
        ]);

        const stats = statsRows[0];

        return res.status(200).json({
            success: true,
            message: "Coupons retrieved successfully.",
            data: {
                statistics: {
                    totalCoupons: Number(stats.totalCoupons || 0),
                    activeCoupons: Number(stats.activeCoupons || 0),
                    inactiveCoupons: Number(stats.inactiveCoupons || 0),
                    totalRedemptions: Number(stats.totalRedemptions || 0),
                },
                coupons: rows.map(normalizeCoupon),
            },
        });
    } catch (error) {
        console.error("Get Admin Coupons Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve coupons.",
        });
    }
};

export const createAdminCoupon = async (req, res) => {
    try {
        const validation = validateCoupon(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error,
            });
        }

        const coupon = validation.data;

        const [result] = await pool.execute(
            `INSERT INTO coupons
                (code, discount_type, discount_value, min_order,
                 max_discount, usage_limit, expiry_date, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                coupon.code,
                coupon.discountType,
                coupon.value,
                coupon.minOrder,
                coupon.maxDiscount,
                coupon.usageLimit,
                coupon.expiryDate,
                coupon.active,
            ]
        );

        const [rows] = await pool.execute(
            "SELECT * FROM coupons WHERE id = ?",
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully.",
            data: { coupon: normalizeCoupon(rows[0]) },
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This coupon code already exists.",
            });
        }

        console.error("Create Admin Coupon Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create coupon.",
        });
    }
};

export const updateAdminCoupon = async (req, res) => {
    try {
        const couponId = Number(req.params.couponId);

        if (!Number.isInteger(couponId) || couponId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID.",
            });
        }

        const validation = validateCoupon(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error,
            });
        }

        const coupon = validation.data;

        const [result] = await pool.execute(
            `UPDATE coupons
             SET code = ?,
                 discount_type = ?,
                 discount_value = ?,
                 min_order = ?,
                 max_discount = ?,
                 usage_limit = ?,
                 expiry_date = ?,
                 is_active = ?
             WHERE id = ?`,
            [
                coupon.code,
                coupon.discountType,
                coupon.value,
                coupon.minOrder,
                coupon.maxDiscount,
                coupon.usageLimit,
                coupon.expiryDate,
                coupon.active,
                couponId,
            ]
        );

        if (result.affectedRows === 0) {
            const [existing] = await pool.execute(
                "SELECT id FROM coupons WHERE id = ?",
                [couponId]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Coupon not found.",
                });
            }
        }

        const [rows] = await pool.execute(
            "SELECT * FROM coupons WHERE id = ?",
            [couponId]
        );

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully.",
            data: { coupon: normalizeCoupon(rows[0]) },
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This coupon code already exists.",
            });
        }

        console.error("Update Admin Coupon Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update coupon.",
        });
    }
};

export const updateAdminCouponStatus = async (req, res) => {
    try {
        const couponId = Number(req.params.couponId);
        const active = req.body.active;

        if (!Number.isInteger(couponId) || couponId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID.",
            });
        }

        if (typeof active !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Active must be true or false.",
            });
        }

        const [result] = await pool.execute(
            "UPDATE coupons SET is_active = ? WHERE id = ?",
            [active, couponId]
        );

        if (result.affectedRows === 0) {
            const [existing] = await pool.execute(
                "SELECT id FROM coupons WHERE id = ?",
                [couponId]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Coupon not found.",
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Coupon ${active ? "activated" : "deactivated"} successfully.`,
            data: { id: couponId, active },
        });
    } catch (error) {
        console.error("Update Coupon Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update coupon status.",
        });
    }
};

export const deleteAdminCoupon = async (req, res) => {
    try {
        const couponId = Number(req.params.couponId);

        if (!Number.isInteger(couponId) || couponId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID.",
            });
        }

        const [result] = await pool.execute(
            "DELETE FROM coupons WHERE id = ?",
            [couponId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully.",
        });
    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED") {
            return res.status(409).json({
                success: false,
                message: "This coupon is linked to order history and cannot be deleted. Deactivate it instead.",
            });
        }

        console.error("Delete Admin Coupon Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete coupon.",
        });
    }
};
