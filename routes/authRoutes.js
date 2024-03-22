// routes/authRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const emailController = require("../controllers/emailController");

const router = express.Router();

// require middleware to validate the request
router.post("/users", userController.create);
router.get("/users/:userId?", userController.fetchAll);
router.put("/users/:userId", userController.updateUserInfo);
router.post("/users/resetPassword/:userId", userController.resetPassword);
router.post("/users/updatePassword", userController.updatePassword);
router.post("/users/login", userController.login);

router.get("/test-send-email/:emailAddress", emailController.testSendEmail);

module.exports = router;
