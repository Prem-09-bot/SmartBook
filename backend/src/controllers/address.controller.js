import pool from "../config/database.js";

// POST: Add a new customer address
export const addAddress = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country = "India",
            isDefault = false
        } = req.body;

        if (
            !fullName?.trim() ||
            !phone?.trim() ||
            !addressLine1?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !postalCode?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required address fields."
            });
        }

        if (
            typeof isDefault !== "boolean" ||
            typeof country !== "string" ||
            !country.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid country or default-address value."
            });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [existingAddresses] = await connection.execute(
                "SELECT id FROM addresses WHERE user_id = ?",
                [req.user.id]
            );

            // First address automatically becomes default.
            const shouldBeDefault =
                isDefault || existingAddresses.length === 0;

            if (shouldBeDefault) {
                await connection.execute(
                    "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
                    [req.user.id]
                );
            }

            const [result] = await connection.execute(
                `INSERT INTO addresses (
                    user_id, full_name, phone,
                    address_line1, address_line2,
                    city, state, postal_code,
                    country, is_default
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.user.id,
                    fullName.trim(),
                    phone.trim(),
                    addressLine1.trim(),
                    addressLine2?.trim() || null,
                    city.trim(),
                    state.trim(),
                    postalCode.trim(),
                    country.trim(),
                    shouldBeDefault ? 1 : 0
                ]
            );

            await connection.commit();

            return res.status(201).json({
                success: true,
                message: "Address added successfully.",
                data: {
                    addressId: result.insertId,
                    isDefault: shouldBeDefault
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Add Address Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to add address."
        });
    }
};

// GET: Retrieve all addresses belonging to the customer
export const getAddresses = async (req, res) => {
    try {
        const [addresses] = await pool.execute(
            `SELECT
                id,
                full_name AS fullName,
                phone,
                address_line1 AS addressLine1,
                address_line2 AS addressLine2,
                city,
                state,
                postal_code AS postalCode,
                country,
                is_default AS isDefault,
                created_at AS createdAt,
                updated_at AS updatedAt
             FROM addresses
             WHERE user_id = ?
             ORDER BY is_default DESC, created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            success: true,
            message: addresses.length
                ? "Addresses retrieved successfully."
                : "No saved addresses found.",
            data: {
                addresses
            }
        });

    } catch (error) {
        console.error("Get Addresses Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve addresses."
        });
    }
};


// PUT: Update a customer's address
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        if (!/^\d+$/.test(addressId) || Number(addressId) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID."
            });
        }

        const allowedFields = {
            fullName: "full_name",
            phone: "phone",
            addressLine1: "address_line1",
            addressLine2: "address_line2",
            city: "city",
            state: "state",
            postalCode: "postal_code",
            country: "country"
        };

        const updates = [];
        const values = [];

        for (const [field, column] of Object.entries(allowedFields)) {
            if (Object.hasOwn(req.body, field)) {
                const value = req.body[field];

                if (
                    field !== "addressLine2" &&
                    (typeof value !== "string" || !value.trim())
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `${field} must be a non-empty string.`
                    });
                }

                if (field === "addressLine2" && value !== null && typeof value !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid address line 2."
                    });
                }

                updates.push(`${column} = ?`);
                values.push(
                    typeof value === "string" ? value.trim() || null : value
                );
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid address fields provided."
            });
        }

        const [result] = await pool.execute(
            `UPDATE addresses
             SET ${updates.join(", ")}
             WHERE id = ? AND user_id = ?`,
            [...values, addressId, req.user.id]
        );

        if (result.affectedRows === 0) {
            const [existing] = await pool.execute(
                "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
                [addressId, req.user.id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found."
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Address updated successfully.",
            data: {
                addressId: Number(addressId)
            }
        });

    } catch (error) {
        console.error("Update Address Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update address."
        });
    }
};


// DELETE: Remove a customer's address and reassign default if necessary
export const deleteAddress = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const { addressId } = req.params;

        if (!/^\d+$/.test(addressId) || Number(addressId) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID."
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        // Lock the address before deleting it
        const [addresses] = await connection.execute(
            `SELECT id, is_default AS isDefault
             FROM addresses
             WHERE id = ? AND user_id = ?
             FOR UPDATE`,
            [addressId, req.user.id]
        );

        if (addresses.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Address not found."
            });
        }

        const wasDefault = Boolean(addresses[0].isDefault);

        await connection.execute(
            `DELETE FROM addresses
             WHERE id = ? AND user_id = ?`,
            [addressId, req.user.id]
        );

        let newDefaultAddressId = null;

        if (wasDefault) {
            const [remainingAddresses] = await connection.execute(
                `SELECT id
                 FROM addresses
                 WHERE user_id = ?
                 ORDER BY created_at ASC, id ASC
                 LIMIT 1
                 FOR UPDATE`,
                [req.user.id]
            );

            if (remainingAddresses.length > 0) {
                newDefaultAddressId = remainingAddresses[0].id;

                await connection.execute(
                    `UPDATE addresses
                     SET is_default = 1
                     WHERE id = ? AND user_id = ?`,
                    [newDefaultAddressId, req.user.id]
                );
            }
        }

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully.",
            data: {
                deletedAddressId: Number(addressId),
                newDefaultAddressId
            }
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Delete Address Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to delete address."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// PATCH: Set a customer's default address
export const setDefaultAddress = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { addressId } = req.params;

        if (!/^\d+$/.test(addressId) || Number(addressId) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID."
            });
        }

        await connection.beginTransaction();

        const [addresses] = await connection.execute(
            `SELECT id FROM addresses
             WHERE id = ? AND user_id = ?
             FOR UPDATE`,
            [addressId, req.user.id]
        );

        if (addresses.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Address not found."
            });
        }

        await connection.execute(
            "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
            [req.user.id]
        );

        await connection.execute(
            `UPDATE addresses
             SET is_default = 1
             WHERE id = ? AND user_id = ?`,
            [addressId, req.user.id]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully.",
            data: {
                addressId: Number(addressId),
                isDefault: true
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("Set Default Address Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to set default address."
        });

    } finally {
        connection.release();
    }
};
