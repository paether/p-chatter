import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  username: string;
  password: string;
  picture: string;
  friends: Array<string>;
}

const UserSchema: mongoose.Schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      default: "",
    },
    friends: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const User: mongoose.Model<IUser> = mongoose.model("User", UserSchema);

export default User;
