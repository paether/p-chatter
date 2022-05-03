import { Server } from "socket.io";
import {
  addSocketUser,
  getSocketUser,
  removeSocketUser,
} from "./src/utils/helpers";

interface ISocketUser {
  userId: string;
  socketId: string;
}

module.exports = (io: Server) => {
  const handleNewUser = function (
    userId: string,
    socketId: string,
    socketUsers: ISocketUser[]
  ) {
    const addedSocketUsers = addSocketUser(userId, socketId, socketUsers);

    if (addedSocketUsers) {
      io.emit("getUsers", socketUsers);
    }
  };

  const handleSendMessage = function (
    senderId: string,
    receiverId: string,
    messageId: string,
    text: string,
    socketUsers: ISocketUser[]
  ) {
    const receiver = getSocketUser(receiverId, socketUsers);

    if (!receiver) return;

    io.to(receiver.socketId).emit("getMessage", {
      messageId,
      senderId,
      text,
    });
  };

  const handleDisconnect = function (
    socketId: string,
    socketUsers: ISocketUser[]
  ) {
    socketUsers = removeSocketUser(socketId, socketUsers);
    io.emit("getUsers", socketUsers);
    return socketUsers;
  };
  return {
    handleNewUser,
    handleSendMessage,
    handleDisconnect,
  };
};
