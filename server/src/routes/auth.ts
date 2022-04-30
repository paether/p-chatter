import express from "express";

const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.post_register);

router.post("/login", authController.post_login);

router.post("/logout", authController.post_logout);

router.get("/isloggedin", authController.get_isloggedin);

export default router;
