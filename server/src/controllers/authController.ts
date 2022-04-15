import { NextFunction, Request, Response } from "express";
import passport from "passport";
import bcrypt from "bcrypt";

import UserInterface from "../interfaces/userInterface";
import User from "../models/User";

const post_login = (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate("local", (err: any, user: any) => {
      if (err) throw err;
      if (!user) return res.status(401).json("Unauthorized");
      req.logIn(user, (err) => {
        if (err) throw err;
        return res.json(user.id);
      });
      return;
    })(req, res, next);
  } catch (error) {
    console.log(error);
  }
};

const post_register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json("invalid values");
  }
  try {
    User.findOne({ username }, async (err: Error, doc: UserInterface) => {
      if (err) throw err;
      if (doc) return res.status(400).json("Already existing user");
      const hashedPass = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashedPass,
      });
      const user = await newUser.save();
      return res.json(user.id);
    });
  } catch (error) {
    return console.log(error);
  }
};
module.exports = { post_login, post_register };
