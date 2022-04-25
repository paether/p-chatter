import express from "express";
const usersController = require("../controllers/usersController");
import { checkAuthentication } from "../middlewares/passport";

const router = express.Router();

//update user password
router.put(
  "/:id/updatepassword",
  checkAuthentication,
  usersController.put_id_password
);

//add friend
router.put(
  "/:id/addfriend",
  checkAuthentication,
  usersController.put_add_friend
);

//remove friend
router.delete(
  "/:id/removefriend",
  checkAuthentication,
  usersController.delete_remove_friend
);
//get friends
router.get("/friends", checkAuthentication, usersController.get_friends);

//get  user
router.get("/:id", checkAuthentication, usersController.get_specific_user);

// get users
router.get("/", checkAuthentication, usersController.get_users);

export default router;
