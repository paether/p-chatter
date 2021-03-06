/* eslint-disable no-unused-vars */

import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { Dropbox, Error, files } from "dropbox";
import fs from "fs";
import axios from "axios";
import qs from "qs";
import path from "path";

import User from "../models/User";
import { IUser } from "../models/User";
import Conversation from "../models/Conversation";
import { verifyMongoIds } from "../utils/helpers";

declare global {
  namespace Express {
    interface User {
      id: string;
      _id: string;
      username: string;
      picture: string;
      unread?: string;
      query: {
        specUserId: string;
        username: string;
      };
      params: {
        id: string;
      };
    }
  }
}

const put_id_password = async (req: Request, res: Response) => {
  if (req.body.password) {
    try {
      const hashedPass = await bcrypt.hash(req.body.password, 10);
      await User.findByIdAndUpdate(
        { _id: req.user!.id },
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

const put_add_profilePicture = async (req: Request, res: Response) => {
  try {
    let url = "";
    const nodeFileData = fs.readFileSync(
      path.join(global.appRoot, "/" + req.file?.path)
    );
    const data = qs.stringify({
      grant_type: "refresh_token",
      refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
    });
    const resp = await axios({
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      url: "https://api.dropboxapi.com/oauth2/token",
      method: "POST",
      auth: {
        username: process.env.DROPBOX_USERNAME!,
        password: process.env.DROPBOX_PASSWORD!,
      },
      data,
    });

    const dbx = new Dropbox({ accessToken: resp.data.access_token });
    const dbxFileUploadData = await dbx.filesUpload({
      path: "/" + req.file!.filename,
      contents: nodeFileData,
    });

    const dbxSharingLinkData = await dbx.sharingCreateSharedLinkWithSettings({
      path: dbxFileUploadData.result.id,
      settings: { allow_download: true },
    });

    url = dbxSharingLinkData.result.url.replace("dl=0", "raw=1");
    await User.findByIdAndUpdate(
      { _id: req.user!.id },
      {
        picture: url,
      }
    );
    res.json({ picture: url });
  } catch (error) {
    console.log(error);
  }
};

const put_add_friend = async (req: Request, res: Response) => {
  const validIds = verifyMongoIds([req.user!.id, req.params.id]);
  if (!validIds) return res.status(400).json("Invalid values");

  if (req.user!.id === req.params.id) {
    return res.status(403).json("Cannot add same user as friend");
  } else {
    try {
      const addFriend = await User.findById({ _id: req.params.id });
      if (!addFriend) {
        return res.status(400);
      }
      const user = await User.findById({ _id: req.user!.id });
      if (!user) {
        return res.status(400);
      }
      if (!user.friends.includes(req.params.id)) {
        await User.updateOne(
          { _id: req.user!.id },
          { $push: { friends: req.params.id } }
        );
        await User.updateOne(
          { _id: req.params.id },
          { $push: { friends: req.user!.id } }
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
const put_update_unread = async (req: Request, res: Response) => {
  const validIds = verifyMongoIds([req.body.friendId, req.body.userId]);
  if (!validIds) return res.status(400).json("Invalid values");

  if (!Number.isInteger(req.body.count) && req.body.count !== "increment") {
    return res.status(403).json("Invalid counter");
  }
  try {
    const user = await User.findById({ _id: req.body.userId });
    if (user) {
      let data;
      if (req.body.count !== "increment") {
        data = { ...user.unread, [req.body.friendId]: req.body.count };
      } else {
        if (
          user.unread[req.body.friendId] &&
          Number.isInteger(user.unread[req.body.friendId])
        ) {
          data = {
            ...user.unread,
            [req.body.friendId]: user.unread[req.body.friendId] + 1,
          };
        } else {
          data = {
            ...user.unread,
            [req.body.friendId]: 1,
          };
        }
      }

      await User.updateOne(
        { _id: req.body.userId },
        {
          $set: {
            unread: data,
          },
        }
      );
    }
    return res.json("updated");
  } catch (error) {
    console.log(error);

    return res.status(500).json(error);
  }
};

const get_unread = async (req: Request, res: Response) => {
  const validIds = verifyMongoIds([req.user!.id]);
  if (!validIds) return res.status(400).json("Invalid values");
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400);
    }
    const { unread } = user;
    return res.json({ unread });
  } catch (error) {
    return res.status(500).json(error);
  }
};
const delete_remove_friend = async (req: Request, res: Response) => {
  if (req.user!.id !== req.body.id) {
    try {
      const removeFriend = await User.findById({ _id: req.body.id });
      if (!removeFriend) {
        return res.status(404).json("The to-be-removed friend does not exist");
      }
      const user = await User.findById({ _id: req.user!.id });
      if (user!.friends.includes(req.body.id)) {
        await User.updateOne(
          { _id: req.user!.id },
          { $pull: { friends: req.body.id } }
        );
        await User.updateOne(
          { _id: req.body.id },
          { $pull: { friends: req.user!.id } }
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

const get_friends = async (req: Request, res: Response) => {
  try {
    const user = await User.findById({ _id: req.user!.id });
    if (!user) {
      return res.status(400);
    }
    const friends: (IUser | null)[] = await Promise.all(
      user.friends.map((friendId: string) => User.findById(friendId))
    );

    let friendsFiltered: Array<{
      _id: string;
      username: string;
      picture: string;
    }> = [];
    friends.map((friend) => {
      const { _id, username, picture } = friend!;
      friendsFiltered.push({ _id, username, picture });
    });
    return res.json(friendsFiltered);
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
    return res.status(500).json(error);
  }
};

const get_specific_user = async (req: Request, res: Response) => {
  const validIds = verifyMongoIds([req.user!.id, req.params.id]);
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

const get_users = async (req: Request, res: Response) => {
  const validIds = verifyMongoIds([req.user!.id]);
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
  put_update_unread,
  get_unread,
  get_all_conversation,
  put_id_password,
  put_add_profilePicture,
  put_add_friend,
  delete_remove_friend,
  get_friends,
  get_specific_user,
  get_users,
};
