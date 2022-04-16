import express from "express";
const conversationController = require("../controllers/chat/conversationController");
const messageController = require("../controllers/chat/messageController");

import { checkAuthentication } from "../middlewares/passport";

const router = express.Router();

//    ----Conversations-----

//new conversation
router.post(
  "/",
  checkAuthentication,
  conversationController.post_new_conversation
);
//get all conversation for user
router.get(
  "/user/:id",
  checkAuthentication,
  conversationController.get_all_conversation
);
//get specific conversation
router.get(
  "/:id",
  checkAuthentication,
  conversationController.get_conversation
);

//    ----Messages-----

//add new message
router.post("/:id", checkAuthentication, messageController.add_message);
export default router;
