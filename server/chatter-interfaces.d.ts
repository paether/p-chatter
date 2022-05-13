export interface ISocketUser {
  userId: string;
  socketId: string;
}

export interface ISendMessage {
  senderId: string;
  receiverId: string;
  messageId: string;
  text: string;
}
