import { NextFunction, Request, Response } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import validator from "validator";

import UserInterface from "../interfaces/userInterface";
import User from "../models/User";

const post_login = (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate("local", (err: any, user: any) => {
      if (err) throw err;
      if (!user) return res.send("Unauthorized!");
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
        const user = await newUser.save();
        return res.json(user.id);
      });
      return;
    });
  } catch (error) {
    return console.log(error);
  }
};
module.exports = { post_login, post_register };
