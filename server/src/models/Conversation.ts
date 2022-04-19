import mongoose from "mongoose";

export interface IConversation extends mongoose.Document {
  members: {
    type: mongoose.Types.ObjectId[];
  };
}

const ConversationSchema: mongoose.Schema = new mongoose.Schema(
  {
    members: {
      type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true }
);

const Conversation: mongoose.Model<IConversation> = mongoose.model(
  "Conversation",
  ConversationSchema
);

export default Conversation;
