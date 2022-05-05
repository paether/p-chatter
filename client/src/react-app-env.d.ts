/// <reference types="react-scripts" />
interface ISocketUser {
  userId: string;
  socketId: string;
}
interface IFriend {
  _id: string;
  username: string;
  picture: string;
  online: boolean;
}

interface IConversation {
  members: string[];
  _id: string;
}
interface IMessage {
  _id: string;
  conversationId?: string;
  senderId: string;
  text: string;
  createdAt: any;
}
