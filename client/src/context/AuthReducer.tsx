export type actionType =
  | { type: "REGISTER_START" }
  | { type: "REGISTER_SUCCESS"; payload: string }
  | { type: "REGISTER_ERROR"; payload: any }
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: string }
  | { type: "LOGIN_ERROR"; payload: any };

interface initialStateInterface {
  user: {} | null;
  isFetching: boolean;
  error: any;
}

export const AuthReducer = (
  state: initialStateInterface,
  action: actionType
) => {
  switch (action.type) {
    case "REGISTER_START":
      return {
        user: null,
        isFetching: true,
        error: false,
      };
    case "REGISTER_SUCCESS":
      return {
        user: action.payload,
        isFetching: false,
        error: false,
      };
    case "REGISTER_ERROR":
      return {
        user: null,
        isFetching: false,
        error: action.payload,
      };
    case "LOGIN_START":
      return {
        user: null,
        isFetching: true,
        error: false,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        isFetching: false,
        error: false,
      };
    case "LOGIN_ERROR":
      return {
        user: null,
        isFetching: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
