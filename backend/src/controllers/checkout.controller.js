
import pool from "../config/database.js";
import crypto from "crypto";
import Razorpay from "razorpay";

// POST: Create an order from the customer's cart
export const createOrder = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const { addressId, notes = null } = req.body;

        if (
            !Number.isInteger(Number(addressId)) ||
            Number(addressId) < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid delivery address ID is required."
            });
        }

        if (
            notes !== null &&
            (typeof notes !== "string" || notes.length > 1000)
        ) {
            return res.status(400).json({
                success: false,
                message: "Order notes must be a string of at most 1000 characters."
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        // Verify delivery address belongs to this customer
        const [addresses] = await connection.execute(
            `SELECT id, full_name, phone, address_line1,
                    address_line2, city, state, postal_code, country
             FROM addresses
             WHERE id = ? AND user_id = ?
             FOR UPDATE`,
            [Number(addressId), req.user.id]
        );

        if (addresses.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Delivery address not found."
            });
        }

        const address = addresses[0];

        // Lock the customer's cart
        const [carts] = await connection.execute(
            `SELECT id FROM carts
             WHERE user_id = ?
             FOR UPDATE`,
            [req.user.id]
        );

        if (carts.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });
        }

        const cartId = carts[0].id;

        // Fetch cart items and current book details
        const [items] = await connection.execute(
            `SELECT
                ci.id AS cartItemId,
                ci.book_id AS bookId,
                ci.quantity,
                b.title,
                b.author,
                b.slug,
                b.price,
                b.stock_quantity AS stockQuantity
             FROM cart_items ci
             INNER JOIN books b ON b.id = ci.book_id
             WHERE ci.cart_id = ?
               AND b.is_active = 1
             ORDER BY b.id
             FOR UPDATE`,
            [cartId]
        );

        if (items.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "Your cart has no available books."
            });
        }

        // Ensure every cart item references an active book
        const [cartCount] = await connection.execute(
            `SELECT COUNT(*) AS total
             FROM cart_items
             WHERE cart_id = ?`,
            [cartId]
        );

        if (Number(cartCount[0].total) !== items.length) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "Some books in your cart are no longer available. Please review your cart."
            });
        }

        // Validate stock and calculate subtotal using database prices
        let subtotalInPaise = 0;

        for (const item of items) {
            if (
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) < 1
            ) {
                throw new Error("Invalid cart quantity detected.");
            }

            if (Number(item.quantity) > Number(item.stockQuantity)) {
                await connection.rollback();
                transactionStarted = false;

                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${item.title}".`,
                    data: {
                        availableStock: Number(item.stockQuantity),
                        requestedQuantity: Number(item.quantity)
                    }
                });
            }

            const priceInPaise = Math.round(
                Number(item.price) * 100
            );

            subtotalInPaise +=
                priceInPaise * Number(item.quantity);
        }

        const shippingInPaise = 0;
        const discountInPaise = 0;
        const totalInPaise =
            subtotalInPaise + shippingInPaise - discountInPaise;

        const subtotal = (subtotalInPaise / 100).toFixed(2);
        const shippingCharge = (shippingInPaise / 100).toFixed(2);
        const discount = (discountInPaise / 100).toFixed(2);
        const totalAmount = (totalInPaise / 100).toFixed(2);

        // Generate a unique order number
        const orderNumber = `SB-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

        const shippingAddress = [
            address.address_line1,
            address.address_line2,
            address.city,
            address.state,
            address.postal_code,
            address.country
        ].filter(Boolean).join(", ");

        // Create order
        const [orderResult] = await connection.execute(
            `INSERT INTO orders (
                order_number,
                user_id,
                address_id,
                subtotal,
                discount,
                shipping_charge,
                total_amount,
                payment_method,
                payment_status,
                order_status,
                shipping_name,
                shipping_phone,
                shipping_address,
                shipping_city,
                shipping_state,
                shipping_postal_code,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'COD', 'pending',
                      'pending', ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber,
                req.user.id,
                address.id,
                subtotal,
                discount,
                shippingCharge,
                totalAmount,
                address.full_name,
                address.phone,
                shippingAddress,
                address.city,
                address.state,
                address.postal_code,
                notes?.trim() || null
            ]
        );

        const orderId = orderResult.insertId;

        // Save order item snapshots and reduce stock
        for (const item of items) {
            const itemSubtotalInPaise =
                Math.round(Number(item.price) * 100) *
                Number(item.quantity);

            await connection.execute(
                `INSERT INTO order_items (
                    order_id,
                    book_id,
                    book_title,
                    book_author,
                    book_slug,
                    quantity,
                    unit_price,
                    subtotal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderId,
                    item.bookId,
                    item.title,
                    item.author,
                    item.slug,
                    item.quantity,
                    Number(item.price).toFixed(2),
                    (itemSubtotalInPaise / 100).toFixed(2)
                ]
            );

            const [stockResult] = await connection.execute(
                `UPDATE books
                 SET stock_quantity = stock_quantity - ?
                 WHERE id = ?
                   AND is_active = 1
                   AND stock_quantity >= ?`,
                [item.quantity, item.bookId, item.quantity]
            );

            if (stockResult.affectedRows !== 1) {
                throw new Error(
                    `Stock update failed for book: ${item.title}`
                );
            }
        }

        // Create pending COD payment record
        await connection.execute(
            `INSERT INTO payments (
                order_id,
                amount,
                payment_method,
                status
            ) VALUES (?, ?, 'COD', 'pending')`,
            [orderId, totalAmount]
        );

        // Clear cart only after successful order creation
        await connection.execute(
            "DELETE FROM cart_items WHERE cart_id = ?",
            [cartId]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            data: {
                orderId,
                orderNumber,
                paymentMethod: "COD",
                paymentStatus: "pending",
                orderStatus: "pending",
                subtotal,
                shippingCharge,
                discount,
                totalAmount,
                itemCount: items.length
            }
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error("Create Order Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to place your order."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// Create a Razorpay test/live gateway order and a pending SmartBook order.
export const createRazorpayOrder = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const { addressId, notes = null } = req.body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured on the server."
            });
        }

        if (!Number.isInteger(Number(addressId)) || Number(addressId) < 1) {
            return res.status(400).json({
                success: false,
                message: "A valid delivery address ID is required."
            });
        }

        if (notes !== null && (typeof notes !== "string" || notes.length > 1000)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order notes."
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        connection = await pool.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        const [addresses] = await connection.execute(
            `SELECT id, full_name, phone, address_line1, address_line2,
                    city, state, postal_code, country
             FROM addresses WHERE id = ? AND user_id = ? FOR UPDATE`,
            [Number(addressId), req.user.id]
        );

        if (!addresses.length) {
            await connection.rollback();
            transactionStarted = false;
            return res.status(404).json({
                success: false,
                message: "Delivery address not found."
            });
        }

        const address = addresses[0];

        const [carts] = await connection.execute(
            "SELECT id FROM carts WHERE user_id = ? FOR UPDATE",
            [req.user.id]
        );

        if (!carts.length) {
            await connection.rollback();
            transactionStarted = false;
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });
        }

        const [items] = await connection.execute(
            `SELECT ci.book_id AS bookId, ci.quantity, b.title, b.author,
                    b.slug, b.price, b.stock_quantity AS stockQuantity
             FROM cart_items ci
             INNER JOIN books b ON b.id = ci.book_id
             WHERE ci.cart_id = ? AND b.is_active = 1
             ORDER BY b.id FOR UPDATE`,
            [carts[0].id]
        );

        const [cartCount] = await connection.execute(
            "SELECT COUNT(*) AS total FROM cart_items WHERE cart_id = ?",
            [carts[0].id]
        );

        if (!items.length || Number(cartCount[0].total) !== items.length) {
            await connection.rollback();
            transactionStarted = false;
            return res.status(400).json({
                success: false,
                message: "Your cart is empty or contains unavailable books."
            });
        }

        let totalPaise = 0;

        for (const item of items) {
            const quantity = Number(item.quantity);
            const stock = Number(item.stockQuantity);

            if (!Number.isInteger(quantity) || quantity < 1 || quantity > stock) {
                await connection.rollback();
                transactionStarted = false;
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock or invalid quantity for "${item.title}".`
                });
            }

            totalPaise += Math.round(Number(item.price) * 100) * quantity;
        }

        if (totalPaise < 100) {
            await connection.rollback();
            transactionStarted = false;
            return res.status(400).json({
                success: false,
                message: "The payment amount must be at least ₹1."
            });
        }

        const orderNumber = `SB-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        const amount = (totalPaise / 100).toFixed(2);

        // Create gateway order before committing the SmartBook order.
        const gatewayOrder = await razorpay.orders.create({
            amount: totalPaise,
            currency: "INR",
            receipt: orderNumber,
            notes: {
                smartbook_order: orderNumber,
                customer_id: String(req.user.id)
            }
        });

        const shippingAddress = [
            address.address_line1,
            address.address_line2,
            address.city,
            address.state,
            address.postal_code,
            address.country
        ].filter(Boolean).join(", ");

        const [orderResult] = await connection.execute(
            `INSERT INTO orders (
                order_number, user_id, address_id, subtotal, discount,
                shipping_charge, total_amount, payment_method, payment_status,
                order_status, shipping_name, shipping_phone, shipping_address,
                shipping_city, shipping_state, shipping_postal_code, notes
            ) VALUES (?, ?, ?, ?, 0, 0, ?, 'RAZORPAY', 'pending',
                      'pending', ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber, req.user.id, address.id, amount, amount,
                address.full_name, address.phone, shippingAddress,
                address.city, address.state, address.postal_code,
                notes?.trim() || null
            ]
        );

        const orderId = orderResult.insertId;

        for (const item of items) {
            const linePaise = Math.round(Number(item.price) * 100) * Number(item.quantity);

            await connection.execute(
                `INSERT INTO order_items (
                    order_id, book_id, book_title, book_author, book_slug,
                    quantity, unit_price, subtotal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderId, item.bookId, item.title, item.author, item.slug,
                    item.quantity, Number(item.price).toFixed(2),
                    (linePaise / 100).toFixed(2)
                ]
            );

            const [stockUpdate] = await connection.execute(
                `UPDATE books SET stock_quantity = stock_quantity - ?
                 WHERE id = ? AND is_active = 1 AND stock_quantity >= ?`,
                [item.quantity, item.bookId, item.quantity]
            );

            if (stockUpdate.affectedRows !== 1) {
                throw new Error(`Stock update failed for "${item.title}".`);
            }
        }

        await connection.execute(
            `INSERT INTO payments (
                order_id, payment_gateway, gateway_order_id,
                amount, payment_method, status
            ) VALUES (?, 'razorpay', ?, ?, 'RAZORPAY', 'pending')`,
            [orderId, gatewayOrder.id, amount]
        );

        await connection.execute(
            "DELETE FROM cart_items WHERE cart_id = ?",
            [carts[0].id]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            data: {
                orderId,
                orderNumber,
                keyId: process.env.RAZORPAY_KEY_ID,
                gatewayOrderId: gatewayOrder.id,
                amount: totalPaise,
                currency: "INR",
                customer: {
                    name: address.full_name,
                    phone: address.phone
                }
            }
        });
    } catch (error) {
        if (connection && transactionStarted) await connection.rollback();
        console.error("Create Razorpay Order Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to initialize online payment."
        });
    } finally {
        if (connection) connection.release();
    }
};


// Verify Razorpay signature and gateway payment before marking the order paid.
export const verifyRazorpayPayment = async (req, res) => {
    let connection;

    try {
        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !orderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details."
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const expected = Buffer.from(expectedSignature, "hex");
        const received = Buffer.from(razorpay_signature, "hex");

        if (
            expected.length !== received.length ||
            !crypto.timingSafeEqual(expected, received)
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed."
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const gatewayPayment = await razorpay.payments.fetch(razorpay_payment_id);

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT p.id AS paymentId, p.amount, p.gateway_order_id,
                    p.status AS paymentStatus, o.id AS orderId,
                    o.total_amount, o.payment_status
             FROM payments p
             INNER JOIN orders o ON o.id = p.order_id
             WHERE o.id = ? AND o.user_id = ?
               AND p.payment_gateway = 'razorpay'
             FOR UPDATE`,
            [Number(orderId), req.user.id]
        );

        if (!rows.length) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Payment order not found."
            });
        }

        const payment = rows[0];
        const expectedPaise = Math.round(Number(payment.total_amount) * 100);

        if (
            payment.gateway_order_id !== razorpay_order_id ||
            gatewayPayment.order_id !== razorpay_order_id ||
            Number(gatewayPayment.amount) !== expectedPaise ||
            Number(payment.amount) !== Number(payment.total_amount) ||
            gatewayPayment.currency !== "INR" ||
            gatewayPayment.status !== "captured"
        ) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "The gateway payment is not captured or does not match this order."
            });
        }

        if (payment.paymentStatus === "success") {
            await connection.commit();
            return res.status(200).json({
                success: true,
                message: "Payment was already verified.",
                data: { orderId: Number(orderId), paymentStatus: "paid" }
            });
        }

        await connection.execute(
            `UPDATE payments
             SET transaction_id = ?, status = 'success',
                 paid_at = NOW(), gateway_response = ?
             WHERE id = ? AND status = 'pending'`,
            [
                razorpay_payment_id,
                JSON.stringify(gatewayPayment),
                payment.paymentId
            ]
        );

        await connection.execute(
            `UPDATE orders SET payment_status = 'paid',
             order_status = 'processing' WHERE id = ?`,
            [Number(orderId)]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully.",
            data: { orderId: Number(orderId), paymentStatus: "paid" }
        });
    } catch (error) {
        if (connection) {
            try { await connection.rollback(); } catch {}
        }
        console.error("Verify Razorpay Payment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to verify payment."
        });
    } finally {
        if (connection) connection.release();
    }
};
