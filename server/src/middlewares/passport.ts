import User from "../models/User";
import bcrypt from "bcrypt";
import passportLocal from "passport-local";
import UserInterface from "src/interfaces/userInterface";

const localStrategy = passportLocal.Strategy;

export default function appLocalStrategy(passport: any) {
  try {
    passport.use(
      new localStrategy((username: string, password: string, done: any) => {
        User.findOne({ username }, (err: any, user: UserInterface) => {
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
    User.findOne({ _id: id }, (err: any, user: UserInterface) => {
      const userInformation = {
        username: user.username,
        id: user.id,
      };
      done(err, userInformation);
    });
  });
}
