import { AuthState } from "./AuthContext";

export type actionType =
  | { type: "REGISTER_START" }
  | { type: "REGISTER_SUCCESS"; payload: string }
  | { type: "REGISTER_ERROR"; payload: any }
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: string }
  | { type: "LOGIN_ERROR"; payload: any }
  | { type: "LOGOUT_SUCCESS" }
  | { type: "LOGOUT_ERROR"; payload: any };

export const AuthReducer = (
  state: AuthState,
  action: actionType
): AuthState => {
  switch (action.type) {
    case "REGISTER_START":
      return {
        ...state,
        user: "",
        isFetching: true,
        error: null,
      };
    case "REGISTER_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isFetching: false,
        error: null,
      };
    case "REGISTER_ERROR":
      return {
        ...state,
        user: "",
        isFetching: false,
        error: action.payload,
      };
    case "LOGIN_START":
      return {
        ...state,
        user: "",
        isFetching: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isFetching: false,
        error: null,
      };
    case "LOGIN_ERROR":
      return {
        ...state,
        user: "",
        isFetching: false,
        error: action.payload,
      };
    case "LOGOUT_SUCCESS":
      return {
        ...state,
        user: "",
        isFetching: false,
        error: null,
      };
    case "LOGOUT_ERROR":
      return {
        ...state,
        user: state.user,
        isFetching: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
