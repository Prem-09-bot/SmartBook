import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check whether email already exists
        const [existingUsers] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create customer account
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, 'customer')`,
            [name.trim(), normalizedEmail, passwordHash]
        );

        return res.status(201).json({
            success: true,
            message: "Account registered successfully.",
            data: {
                user: {
                    id: result.insertId,
                    name: name.trim(),
                    email: normalizedEmail,
                    role: "customer"
                }
            }
        });

    } catch (error) {
        console.error("Registration Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during registration."
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user by email
        const [users] = await pool.execute(
            `SELECT id, name, email, password_hash, role
             FROM users
             WHERE email = ?`,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error("Login Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during login."
        });
    }
};
