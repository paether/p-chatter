import { NextFunction, Request, Response } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { io } from "../config/server";

import { IUser } from "../models/User";
import User from "../models/User";

const post_login = (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate("local", (err: any, user: IUser) => {
      if (err) throw err;
      if (!user) return res.status(401).json("Unauthorized");
      req.logIn(user, (err) => {
        if (err) throw err;
        const { _id, username, picture } = user;
        return res.json({ _id, username, picture });
      });
      return;
    })(req, res, next);
  } catch (error) {
    console.log(error);
  }
};

const post_logout = (req: Request, res: Response) => {
  try {
    const sessionId = req.session.id;
    req.session.destroy(function (err) {
      if (err) return res.json(err);
      io.to(sessionId).disconnectSockets();
      return res.json("Logged out");
    });
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
    User.findOne({ username }, async (err: Error, doc: IUser) => {
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

interface IsLoggedInRequest extends Request {
  user: IUser;
}

const get_isloggedin = (req: IsLoggedInRequest, res: Response) => {
  if (req.isAuthenticated()) {
    const { _id, username, picture } = req.user;
    return res.json({ _id, username, picture });
  } else {
    return res.json(false);
  }
};

module.exports = { post_login, post_register, get_isloggedin, post_logout };
