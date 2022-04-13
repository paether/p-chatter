import express from "express";
const router = express.Router();
import { Request, Response } from "express";

router.get("/", (req: Request, res: Response) => {
  res.send("test");
});

router.get("/user", (req, res) => {
  res.send(req.user);
});

export default router;
