import mongoose, { ConnectOptions } from "mongoose";

import getConfig from "./config";

const initDb = async () => {
  mongoose.connect(
    getConfig().MONGO_URL!,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions,
    (err: any) => {
      if (err) throw err;
      console.log("Connected to DB");
    }
  );
};

export default initDb;
