import session from "express-session";
import cookieParser from "cookie-parser";
import express from "express";
import passport from "passport";
import helmet from "helmet";
import { createServer } from "http";
// import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "https://p-chatter.herokuapp.com", credentials: true },
});
const sessionMiddleware = session({
  secret: "r8q,+&1LM3)CD*zAGpx1xm{NeQ",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 10000, httpOnly: true },
});

app.use(helmet());
// app.use(cors({ origin: "https://p-chatter.herokuapp.com", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(cookieParser("r8q,+&1LM3)CD*zAGpx1xm{NeQ"));
app.use(passport.initialize());
app.use(passport.session());

const wrap = (middleware: any) => (socket: any, next: any) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket: any, next: any) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
});

export { server, app, io, sessionMiddleware };
