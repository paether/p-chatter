import { ISocketUser } from "chatter-interfaces";

const verifyMongoIds = (ids: Array<string>): boolean => {
  const mongoRegEx = new RegExp("^[0-9a-fA-F]{24}$");
  return ids.every((id) => {
    return typeof id === "string" && mongoRegEx.test(id);
  });
};

const addSocketUser = (
  userId: string,
  socketId: string,
  socketUsers: ISocketUser[]
): number | boolean => {
  if (socketUsers.some((user) => user.userId === userId)) return false;
  return socketUsers.push({ userId, socketId });
};

const removeSocketUser = (
  socketId: string,
  socketUsers: ISocketUser[]
): ISocketUser[] => {
  return socketUsers.filter((user) => user.socketId !== socketId);
};

const getSocketUser = (
  userId: string,
  socketUsers: ISocketUser[]
): ISocketUser | undefined => {
  return socketUsers.find((user) => user.userId === userId);
};

export { verifyMongoIds, removeSocketUser, addSocketUser, getSocketUser };
