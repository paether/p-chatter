import { Response } from "express";
import bcrypt from "bcrypt";

import IReqUser from "../interfaces/userInterface";
import User from "../models/User";
import { IUser } from "../models/User";
import Conversation from "../models/Conversation";
import { verifyMongoIds } from "../utils/helpers";

interface ISpecUserId extends IReqUser {
  query: {
    specUserId: string;
  };
}
interface IRegexUser extends IReqUser {
  query: {
    username: string;
  };
}

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
  const validIds = verifyMongoIds([req.user.id, req.params.id]);
  if (!validIds) return res.status(400).json("Invalid values");

  if (req.user.id === req.params.id) {
    return res.status(403).json("Cannot add same user as friend");
  } else {
    try {
      const addFriend = await User.findById({ _id: req.params.id });
      if (!addFriend) {
        return res.status(400);
      }
      const user = await User.findById({ _id: req.user.id });
      if (!user) {
        return res.status(400);
      }
      if (!user.friends.includes(req.params.id)) {
        await User.updateOne(
          { _id: req.user.id },
          { $push: { friends: req.params.id } }
        );
        await User.updateOne(
          { _id: req.params.id },
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
  try {
    const user = await User.findById({ _id: req.user.id });
    if (!user) {
      return res.status(400);
    }
    const friends: (IUser | null)[] = await Promise.all(
      user.friends.map((friendId: string) => User.findById(friendId))
    );

    let friendsFiltered: Array<{ _id: string; username: string }> = [];
    friends.map((friend) => {
      const { _id, username } = friend!;
      friendsFiltered.push({ _id, username });
    });
    return res.json(friendsFiltered);
  } catch (error) {
    console.log(error);

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

const get_specific_user = async (req: ISpecUserId, res: Response) => {
  const validIds = verifyMongoIds([req.user.id, req.params.id]);
  if (!validIds) return res.status(400).json("Invalid values");
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400);
    }
    const { _id, username, picture } = user;
    return res.json({ _id, username, picture });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const get_users = async (req: IRegexUser, res: Response) => {
  const validIds = verifyMongoIds([req.user.id]);
  if (!validIds) return res.status(400).json("Invalid values");
  try {
    const users = await User.find({
      username: { $regex: req.query.username, $options: "i" },
    });
    if (!users) {
      return res.status(400);
    }
    if (users.length === 0) {
      return res.json([]);
    }

    const destructedUsers = users.map(({ _id, username, picture }) => {
      return { _id, username, picture };
    });
    return res.json(destructedUsers);
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
  get_users,
};
