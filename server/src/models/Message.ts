import mongoose from "mongoose";

export interface IMessage extends mongoose.Document {
  conversationId: string;
  senderId: string;
  text: string;
}

const MessageSchema: mongoose.Schema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message: mongoose.Model<IMessage> = mongoose.model(
  "Message",
  MessageSchema
);

export default Message;
