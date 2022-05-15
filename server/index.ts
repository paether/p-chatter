if (process.env.NODE_ENV !== "production") require("dotenv").config();
import passport from "passport";
import path from "path";
import express from "express";

import { ISocketUser, ISendMessage } from "chatter-interfaces";
import getConfig from "./src/config/config";
import { server, app, io } from "./src/config/server";

import initDb from "./src/config/database";
import appLocalStrategy from "./src/middlewares/passport";
import usersRouter from "./src/routes/users";
import authRouter from "./src/routes/auth";
import chatRouter from "./src/routes/chat";

const { handleNewUser, handleSendMessage, handleDisconnect, handleAddFriend } =
  require("./src/socketioHandlers")(io);

const PORT = getConfig().PORT;
let socketUsers: ISocketUser[] = [];
global.appRoot = path.resolve(__dirname);

appLocalStrategy(passport);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(express.static(path.join(__dirname, "/client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});

io.on("connection", (socket: any) => {
  const sessionId = socket.request.session.id;

  socket.join(sessionId);

  socket.on("newUser", (userId: string) => {
    handleNewUser(userId, socket.id, socketUsers);
  });

  socket.on("addFriend", (userId: string) =>
    handleAddFriend(userId, socketUsers)
  );

  socket.on(
    "sendMessage",
    ({ senderId, receiverId, messageId, text }: ISendMessage) =>
      handleSendMessage(senderId, receiverId, messageId, text, socketUsers)
  );

  socket.on(
    "disconnect",
    () => (socketUsers = handleDisconnect(socket.id, socketUsers))
  );
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
