/* eslint-disable no-unreachable */

import { Response, Request } from "express";
import Conversation from "../../models/Conversation";
import Message from "../../models/Message";
import verifyMongoIds from "../../middlewares/helpers";

interface MessageInterface {
  conversationId: string;
  senderId: string;
  text: string;
}

interface userIdInterface extends Request {
  user: {
    id: string;
  };
}

const add_message = async (req: userIdInterface, res: Response) => {
  const validIds = verifyMongoIds([
    req.user.id,
    req.body.senderId,
    req.body.conversationId,
  ]);
  if (!validIds) return res.status(400).json("Invalid values");

  if (req.user.id !== req.body.senderId)
    return res.status(401).json("Unauthorized");
  try {
    const conv = await Conversation.findOne({
      _id: req.body.conversationId,
      members: { $in: [req.user.id] },
    });
    if (!conv) {
      return res.status(400).json("Cannot get that conversation");
    }
    const message = new Message<MessageInterface>({
      conversationId: req.body.conversationId,
      senderId: req.body.senderId,
      text: req.body.text,
    });
    const savedMessage = await message.save();
    return res.json(savedMessage.id);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  add_message,
};
