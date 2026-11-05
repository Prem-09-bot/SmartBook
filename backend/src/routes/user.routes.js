import express from "express";
import { getMyProfile } from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticateUser, getMyProfile);

export default router;

