import pool from "../config/database.js";

export const getMyProfile = async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT id, name, email, role, created_at
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile retrieved successfully.",
            data: {
                user: users[0]
            }
        });

    } catch (error) {
        console.error("Profile Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve profile."
        });
    }
};
