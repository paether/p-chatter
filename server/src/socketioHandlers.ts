import { Server } from "socket.io";

import { ISocketUser } from "chatter-interfaces";
import {
  addSocketUser,
  getSocketUser,
  removeSocketUser,
} from "./utils/helpers";

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

  const handleAddFriend = function (
    friendId: string,
    socketUsers: ISocketUser[]
  ) {
    const onlineFriend = getSocketUser(friendId, socketUsers);

    if (!onlineFriend) return;
    io.to(onlineFriend.socketId).emit("getFriends");
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
    handleAddFriend,
  };
};
