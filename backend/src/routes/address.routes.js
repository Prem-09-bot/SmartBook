import express from "express";

import {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controllers/address.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// All address endpoints require customer authentication
router.use(authenticateUser);

// GET: Retrieve saved addresses
router.get("/", getAddresses);

// POST: Add a new address
router.post("/", addAddress);

// PUT: Update an address
router.put("/:addressId", updateAddress);

// DELETE: Delete an address
router.delete("/:addressId", deleteAddress);

// PATCH: Set default address
router.patch("/:addressId/default", setDefaultAddress);

export default router;
