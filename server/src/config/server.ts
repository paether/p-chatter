/* eslint-disable no-unused-vars */
import session, { Session } from "express-session";
import cookieParser from "cookie-parser";
import express, { NextFunction, Express } from "express";
import passport from "passport";
import helmet from "helmet";
import { createServer, IncomingMessage } from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";

declare module "http" {
  interface IncomingMessage {
    session: Session;
  }
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});
const sessionMiddleware = session({
  secret: process.env.COOKIE_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 10000, httpOnly: true },
});

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
    },
  })
);
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(passport.initialize());
app.use(passport.session());

const wrap = (middleware) => (socket: Socket, next: NextFunction) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket: any, next: NextFunction) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
});

export { server, app, io, sessionMiddleware };
