import bcrypt from "bcrypt";
import passportLocal from "passport-local";
import { NextFunction, Request, Response } from "express";

import User from "../models/User";
import { IUser } from "../models/User";

const localStrategy = passportLocal.Strategy;

export function checkAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json("unauthorized");
  }
}

export default function appLocalStrategy(passport: any) {
  try {
    passport.use(
      new localStrategy((username: string, password: string, done: any) => {
        User.findOne({ username }, (err: any, user: IUser) => {
          if (err) throw err;
          if (!user) return done(null, false);

          bcrypt.compare(password, user.password, (err, result) => {
            if (err) throw err;
            if (result) {
              return done(null, user);
            }
            return done(null, false);
          });
        });
      })
    );
  } catch (error) {
    console.log(error);
  }
  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });
  passport.deserializeUser((id: string, done: any) => {
    User.findOne({ _id: id }, (err: any, user: IUser) => {
      done(err, user);
    });
  });
}
