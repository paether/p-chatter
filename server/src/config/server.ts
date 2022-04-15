import session from "express-session";
import cookieParser from "cookie-parser";
import express from "express";
import passport from "passport";
import helmet from "helmet";
import cors from "cors";

const server = express();

server.use(helmet());
server.use(cors({ origin: "http://localhost:3000", credentials: true }));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(
  session({
    secret: "r8q,+&1LM3)CD*zAGpx1xm{NeQ",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 10000 },
  })
);
server.use(cookieParser("r8q,+&1LM3)CD*zAGpx1xm{NeQ"));
server.use(passport.initialize());
server.use(passport.session());

export default server;
