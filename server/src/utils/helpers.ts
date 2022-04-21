const verifyMongoIds = (ids: Array<string>) => {
  const mongoRegEx = new RegExp("^[0-9a-fA-F]{24}$");
  return ids.every((id) => {
    return typeof id === "string" && mongoRegEx.test(id);
  });
};

interface ISocketUser {
  userId: string;
  socketId: string;
}
const addSocketUser = (
  userId: string,
  socketId: string,
  socketUsers: ISocketUser[]
) => {
  if (socketUsers.some((user) => user.userId === userId)) return false;
  return socketUsers.push({ userId, socketId });
};

const removeSocketUser = (socketId: string, socketUsers: ISocketUser[]) => {
  return socketUsers.filter((user) => user.socketId !== socketId);
};

const getSocketUser = (userId: string, socketUsers: ISocketUser[]) => {
  return socketUsers.find((user) => user.userId === userId);
};

export { verifyMongoIds, removeSocketUser, addSocketUser, getSocketUser };
