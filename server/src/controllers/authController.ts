import { NextFunction, Request, Response } from "express";
import passport from "passport";

const post_login = (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate("local", (err: any, user) => {
      if (err) throw err;
      if (!user) return res.send("Unauthorized!");
      req.logIn(user, (err) => {
        if (err) throw err;
        return res.send("Login successfull!");
      });
      return;
    })(req, res, next);
  } catch (error) {
    console.log(error);
  }
};
module.exports = { post_login };
