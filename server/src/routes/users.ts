import express from "express";

const usersController = require("../controllers/usersController");
import { multerUpload } from "../config/multer";
import { checkAuthentication } from "../middlewares/passport";

const router = express.Router();

router.put(
  "/:id/updatepassword",
  checkAuthentication,
  usersController.put_id_password
);

router.put(
  "/:id/updateunread",
  checkAuthentication,
  usersController.put_update_unread
);

router.get("/:id/unread", checkAuthentication, usersController.get_unread);

router.put(
  "/:id/addpicture",
  checkAuthentication,
  multerUpload.single("profileImage"),
  usersController.put_add_profilePicture
);

router.put(
  "/:id/addfriend",
  checkAuthentication,
  usersController.put_add_friend
);

router.delete(
  "/:id/removefriend",
  checkAuthentication,
  usersController.delete_remove_friend
);
router.get("/friends", checkAuthentication, usersController.get_friends);

router.get("/:id", checkAuthentication, usersController.get_specific_user);

router.get("/", checkAuthentication, usersController.get_users);

export default router;
