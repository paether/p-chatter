import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
const router = express.Router();

import UserInterface from "src/interfaces/userInterface";
import User from "../models/User";
const authController = require("../controllers/authController");

router.post("/register", async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  console.log(req.body);
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    !validator.isEmail(email)
  ) {
    return res.send("invalid values");
  }
  try {
    User.findOne({ username }, async (err: Error, doc: UserInterface) => {
      if (err) throw err;
      if (doc) return res.send("Already existing user");
      User.findOne({ email }, async (err: Error, doc: UserInterface) => {
        if (err) throw err;
        if (doc) return res.send("Already existing email");
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new User({
          username,
          email,
          password: hashedPass,
        });
        await newUser.save();
        return res.send("user created");
      });
      return;
    });
  } catch (error) {
    return console.log(error);
  }
});

router.post("/login", authController.post_login);

export default router;
