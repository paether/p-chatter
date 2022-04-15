if (process.env.NODE_ENV !== "production") require("dotenv").config();
import passport from "passport";

import getConfig from "./src/config/config";
import server from "./src/config/server";
import initDb from "./src/config/database";
import appLocalStrategy from "./src/middlewares/passport";
import usersRouter from "./src/routes/users";
import authRouter from "./src/routes/auth";

const PORT = getConfig().PORT;
server.use("/api/users", usersRouter);
server.use("/api/auth", authRouter);
appLocalStrategy(passport);

server
  .listen(PORT)
  .on("error", (err: Error) => {
    console.log("Application failed to start");
    console.error(err.message);
    process.exit(0);
  })
  .on("listening", () => {
    console.log("Application Started on port: " + PORT);
    initDb();
  });

module.exports = { server };
