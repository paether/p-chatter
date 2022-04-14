import { Request } from "express";

export default interface UserInterfaceRequest extends Request {
  user: {
    username: string;
    password: string;
    email?: string;
    picture?: string;
    friends?: Array<string>;
    id?: string;
  };
}

export default interface UserInterface {
  username: string;
  password: string;
  email?: string;
  picture?: string;
  friends?: Array<string>;
  id?: string;
}
