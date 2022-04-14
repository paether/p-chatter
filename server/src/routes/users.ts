import express from "express";
const usersController = require("../controllers/usersController");

const router = express.Router();

router.put("/:id", usersController.put_id_password);

// router.get("/", (req: Request, res: Response) => {
//   res.send("test");
// });

// router.get("/user", (req, res) => {
//   res.send(req.user);
// });

export default router;
