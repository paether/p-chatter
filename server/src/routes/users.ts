import express from "express";
const usersController = require("../controllers/usersController");
import { checkAuthentication } from "../middlewares/passport";

const router = express.Router();

router.put(
  "/:id/updatepassword",
  checkAuthentication,
  usersController.put_id_password
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

export default router;
