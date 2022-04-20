import session from "express-session";
import cookieParser from "cookie-parser";
import express from "express";
import passport from "passport";
import helmet from "helmet";
import http from "http";
import cors from "cors";

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "r8q,+&1LM3)CD*zAGpx1xm{NeQ",
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 10000 },
  })
);
app.use(cookieParser("r8q,+&1LM3)CD*zAGpx1xm{NeQ"));
app.use(passport.initialize());
app.use(passport.session());

export { server, app };
