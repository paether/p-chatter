import express from "express";

const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.post_register);

router.post("/login", authController.post_login);

export default router;
