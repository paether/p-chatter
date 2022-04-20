if (process.env.NODE_ENV !== "production") require("dotenv").config();
import passport from "passport";

import getConfig from "./src/config/config";
import { server, app, io, sessionMiddleware } from "./src/config/server";
import initDb from "./src/config/database";
import appLocalStrategy from "./src/middlewares/passport";
import usersRouter from "./src/routes/users";
import authRouter from "./src/routes/auth";
import chatRouter from "./src/routes/chat";

const PORT = getConfig().PORT;

appLocalStrategy(passport);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

interface ISocketUser {
  userId: string;
  socketId: string;
}

let socketUsers: ISocketUser[] = [];

const addSocketUser = (userId: string, socketId: string) => {
  if (socketUsers.some((user) => user.userId === userId)) return;
  socketUsers.push({ userId, socketId });
};

const removeSocketUser = (userId: string) => {
  socketUsers = socketUsers.filter((user) => user.userId !== userId);
};

const wrap = (middleware: any) => (socket: any, next: any) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket: any, next) => {
  console.log(socket.request.user);
  console.log(socket.request.isAuthenticated());
  if (socket.request.user) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("new user", (userId) => {
    addSocketUser(userId, socket.id);
    io.emit("get users", socketUsers);
  });

  socket.on("disconnect", () => {
    removeSocketUser(socket.id);
    io.emit("get users", socketUsers);
  });
});

server
  .listen(PORT)
  .on("error", (err: Error) => {
    console.log("Application failed to start");
    console.error(err.message);
    process.exit(0);
  })
  .on("listening", () => {
    console.log("Application Started on port: " + PORT);
    initDb();
  });

module.exports = server;
