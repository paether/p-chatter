import { Response, Request } from "express";

import Conversation from "../../models/Conversation";
import User from "../../models/User";

import { verifyMongoIds } from "../../utils/helpers";

const post_new_conversation = async (req: Request, res: Response) => {
  const validIds = verifyMongoIds([
    req.user!.id,
    req.body.senderId,
    req.body.receiverId,
  ]);
  if (!validIds) return res.status(400).json("Invalid values");

  if (req.user!.id !== req.body.senderId)
    return res.status(401).json("Unauthorized");

  try {
    const sender = await User.findById({ _id: req.body.senderId });
    if (!sender) {
      return res.status(400).json("User does not exist");
    }
    const receiver = await User.findById({ _id: req.body.receiverId });
    if (!receiver) {
      return res.status(400).json("User does not exist");
    }
    //they both have to be in the array but the order does not matter
    const exists = await Conversation.findOne({
      members: { $all: [req.body.senderId, req.body.receiverId] },
    });
    if (exists) {
      return res.json("already exists");
    }
    const newConv = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });
    const createdConv = await newConv.save();

    return res.json(createdConv.id);
  } catch (error) {
    console.log(error);

    return res.status(500).json(error);
  }
};

const get_all_conversation = async (req: Request, res: Response) => {
  const validIds = verifyMongoIds([req.user!.id]);
  if (!validIds) return res.status(400).json("Invalid values");
  try {
    const conv = await Conversation.find({
      members: { $in: [req.user!.id] },
    });
    return res.json(conv);
  } catch (error) {
    console.log(error);

    return res.status(500).json(error);
  }
};

const get_conversation = async (req: Request, res: Response) => {
  const validIds = verifyMongoIds([req.user!.id, req.body.conversationId]);
  if (!validIds) return res.status(400).json("Invalid values");

  try {
    const conv = await Conversation.findOne({
      _id: req.body.conversationId,
      members: { $in: [req.user!.id] },
    });
    if (!conv) {
      return res.status(400).json("Cannot get that conversation");
    }
    return res.json(conv);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  post_new_conversation,
  get_all_conversation,
  get_conversation,
};
