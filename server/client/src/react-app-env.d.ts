/// <reference types="react-scripts" />
interface ISocketUser {
  userId: string;
  socketId: string;
}

interface IUnreadMsg {
  [id: string]: number;
}
interface IFriend {
  _id: string;
  username: string;
  picture: string;
  online: boolean;
  unread?: number;
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
interface IUser {
  _id: string;
  username: string;
  picture: string;
  updatedAt?: string;
  createdAt?: string;
}

interface ISearchedPerson {
  _id: string;
  username: string;
  picture: string;
}
interface arrivingMessage {
  senderId: string;
  receiverId: string;
  messageId: string;
  text: string;
}
