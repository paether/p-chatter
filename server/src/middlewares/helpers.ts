const verifyMongoIds = (ids: Array<string>) => {
  const mongoRegEx = new RegExp("^[0-9a-fA-F]{24}$");
  return ids.every((id) => {
    return typeof id === "string" && mongoRegEx.test(id);
  });
};

export default verifyMongoIds;
