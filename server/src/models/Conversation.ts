import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);
