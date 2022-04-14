import { Response } from "express";
import bcrypt from "bcrypt";

import UserInterfaceRequest from "../interfaces/userInterface";
import User from "../models/User";

const put_id_password = async (req: UserInterfaceRequest, res: Response) => {
  if (req.user.id === req.params.id) {
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
        console.log(error);
        res.status(500).send(error);
      }
    }
  } else {
    console.log(req.user.id === req.params.id);
  }
};

module.exports = { put_id_password };

// $2b$10$ / avs6TbOTpEKC0YoEdhhXe / zZiENNVSHmHNfVqqBbEQxiw0UEfNdO;
