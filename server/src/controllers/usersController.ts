import { Response } from "express";
import bcrypt from "bcrypt";

import IReqUser from "../interfaces/userInterface";
import User from "../models/User";
import Conversation from "../models/Conversation";
import verifyMongoIds from "../middlewares/helpers";

const put_id_password = async (req: IReqUser, res: Response) => {
  if (req.body.password) {
    try {
      const hashedPass = await bcrypt.hash(req.body.password, 10);
      await User.findByIdAndUpdate(
        { _id: req.user.id },
        {
          password: hashedPass,
        }
      );
      res.json("Account updated!");
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

const put_add_friend = async (req: IReqUser, res: Response) => {
  if (req.user.id === req.body.id) {
    return res.status(403).json("Cannot add same user as friend");
  } else {
    try {
      const addFriend = await User.findById({ _id: req.body.id });
      if (!addFriend) {
        return res.status(404).json("The to-be-added friend does not exist");
      }
      const user = await User.findById({ _id: req.user.id });
      if (!user!.friends.includes(req.body.id)) {
        await User.updateOne(
          { _id: req.user.id },
          { $push: { friends: req.body.id } }
        );
        await User.updateOne(
          { _id: req.body.id },
          { $push: { friends: req.user.id } }
        );
        return res.json("User added as friend!");
      } else {
        return res.status(403).json("Already a friend");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }
};
const delete_remove_friend = async (req: IReqUser, res: Response) => {
  if (req.user.id !== req.body.id) {
    try {
      const removeFriend = await User.findById({ _id: req.body.id });
      if (!removeFriend) {
        return res.status(404).json("The to-be-removed friend does not exist");
      }
      const user = await User.findById({ _id: req.user.id });
      if (user!.friends.includes(req.body.id)) {
        await User.updateOne(
          { _id: req.user.id },
          { $pull: { friends: req.body.id } }
        );
        await User.updateOne(
          { _id: req.body.id },
          { $pull: { friends: req.user.id } }
        );
        return res.json("User removed as friend!");
      } else {
        return res.status(400).json("Cannot remove non-existent friend");
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  } else {
    return res.status(400).json("Cannot remove the user itself as friend");
  }
};

const get_friends = async (req: IReqUser, res: Response) => {
  if (req.user.id !== req.params.id) {
    return res
      .status(401)
      .json("Logged in user and requested user does not match");
  }

  try {
    const user = await User.findById({ _id: req.user.id });
    const friends = await Promise.all(
      user!.friends.map((friendId: string) => User.findById(friendId))
    );
    let friendsFiltered: Array<{ _id: string; username: string }> = [];
    friends.map((friend: any) => {
      const { _id, username } = friend;
      friendsFiltered.push({ _id, username });
    });
    return res.json(friendsFiltered);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const get_all_conversation = async (req: IReqUser, res: Response) => {
  const validIds = verifyMongoIds([req.user.id]);
  if (!validIds) return res.status(400).json("Invalid values");
  try {
    const conv = await Conversation.find({
      members: { $in: [req.user.id] },
    });
    return res.json(conv);
  } catch (error) {
    return res.status(500).json(error);
  }
};

interface ISpecUserId extends IReqUser {
  query: {
    specUserId: string;
  };
}

const get_specific_user = async (req: ISpecUserId, res: Response) => {
  console.log(req.query.specUserId);

  const validIds = verifyMongoIds([req.user.id, req.query.specUserId]);
  if (!validIds) return res.status(400).json("Invalid values");
  try {
    const user = await User.findById(req.query.specUserId);
    // eslint-disable-next-line no-unused-vars

    // const { password, ...info }: IUser | null = user.data;
    return res.json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports = {
  get_all_conversation,
  put_id_password,
  put_add_friend,
  delete_remove_friend,
  get_friends,
  get_specific_user,
};
