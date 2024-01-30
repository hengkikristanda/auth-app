// routes/authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const emailController = require("../controllers/emailController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/updatePassword", authController.updatePassword);
router.post("/resetPassword", authController.resetPassword);
router.post("/login", authController.login);
router.get("/user/:userId", userController.getUser);
router.put("/user/:userId", userController.updateUserInfo);
router.post("/sendEmail/:purpose?", emailController.send);

module.exports = router;
