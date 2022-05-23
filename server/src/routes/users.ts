import express from "express";

const usersController = require("../controllers/usersController");
import { multerUpload } from "../config/multer";
import { checkAuthentication } from "../middlewares/passport";

const router = express.Router();

//update user password
router.put(
  "/:id/updatepassword",
  checkAuthentication,
  usersController.put_id_password
);

//update unread count
router.put(
  "/:id/updateunread",
  checkAuthentication,
  usersController.put_update_unread
);

//get unread count
router.get("/:id/unread", checkAuthentication, usersController.get_unread);

//update profile picture
router.put(
  "/:id/addpicture",
  checkAuthentication,
  multerUpload.single("profileImage"),
  usersController.put_add_profilePicture
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
