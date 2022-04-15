export const LoginStart = (userCred: string) => ({ type: "LOGIN_START" });
export const LoginSuccess = (user: string) => ({
  type: "LOGIN_SUCCESS",
  payload: user,
});
export const LoginError = (error: any) => ({
  type: "LOGIN_ERROR",
  payload: error,
});
