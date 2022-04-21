/* eslint-disable no-unreachable */

import { Response } from "express";
import Conversation from "../../models/Conversation";
import Message from "../../models/Message";
import { verifyMongoIds } from "../../utils/helpers";
import IReqUser from "../../interfaces/userInterface";

const post_add_message = async (req: IReqUser, res: Response) => {
  const validIds = verifyMongoIds([req.user!.id, req.params.id]);
  if (!validIds) return res.status(400).json("Invalid values");

  try {
    const conv = await Conversation.findOne({
      _id: req.params.id,
      members: { $in: [req.user.id] },
    });
    if (!conv) {
      return res.status(400).json("Cannot get that conversation");
    }
    const message = new Message({
      conversationId: req.params.id,
      senderId: req.user.id,
      text: req.body.text,
    });
    const savedMessage = await message.save();
    return res.json(savedMessage);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const get_messages = async (req: IReqUser, res: Response) => {
  const validIds = verifyMongoIds([req.user.id, req.params.id]);
  if (!validIds) return res.status(400).json("Invalid values");

  try {
    const messages = await Message.find({
      conversationId: req.params.id,
    });

    return res.json(messages);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  post_add_message,
  get_messages,
};
