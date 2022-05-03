if (process.env.NODE_ENV !== "production") require("dotenv").config();
import passport from "passport";

import getConfig from "./src/config/config";
import { server, app, io } from "./src/config/server";

import initDb from "./src/config/database";
import appLocalStrategy from "./src/middlewares/passport";
import usersRouter from "./src/routes/users";
import authRouter from "./src/routes/auth";
import chatRouter from "./src/routes/chat";

const { handleNewUser, handleSendMessage, handleDisconnect } =
  require("./socketioHandlers")(io);

const PORT = getConfig().PORT;

appLocalStrategy(passport);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

interface ISocketUser {
  userId: string;
  socketId: string;
}

interface ISendMessage {
  senderId: string;
  receiverId: string;
  messageId: string;
  text: string;
}

let socketUsers: ISocketUser[] = [];

io.on("connect", (socket: any) => {
  socket.on("newUser", (userId: string) =>
    handleNewUser(userId, socket.id, socketUsers)
  );

  socket.on(
    "sendMessage",
    ({ senderId, receiverId, messageId, text }: ISendMessage) =>
      handleSendMessage(senderId, receiverId, messageId, text, socketUsers)
  );
  socket.on("disconnect", () => handleDisconnect(socket.id, socketUsers));
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
