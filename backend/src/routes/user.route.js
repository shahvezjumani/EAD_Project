import { Router } from "express";
import {
  registerUser,
  updateUser,
  getCurrentUser,
  getUserBySlug,
  removeUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
} from "../controllers/user.controller.js";
import verifyJWTl, { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public Routes
router.post("/register", registerUser); // User Registration
router.post("/login", loginUser); // User Login
router.post("/refresh-token", refreshAccessToken); // Refresh access token
router.get("/u/:slug", getUserBySlug); // Get user by slug


// Protected Routes (require authentication)
router.get("/me", verifyJWT, getCurrentUser); // Get current user
router.put(
  "/update",
  verifyJWT,
  upload.fields([
    { name: "logoUrlFile", maxCount: 1 },
    { name: "bannerUrlFile", maxCount: 1 },
    { name: "availabilityIconUrlFile", maxCount: 1 },
    { name: "aboutMeIconUrlFile", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateUser
); // Update profile

router.delete("/remove", verifyJWT, removeUser); // Delete user account
router.post("/logout", verifyJWT, logoutUser); // Logout user
router.post("/send-verify-otp", sendVerifyOtp);
router.post("/verify-account", verifyEmail);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

export default router;
