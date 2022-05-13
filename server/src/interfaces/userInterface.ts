import { Request } from "express";
export default interface IReqUser extends Request {
  user: {
    id: string;
  };
  body: any;
  protocol: any;
  get: any;
  file: any;
  params: any;
}
