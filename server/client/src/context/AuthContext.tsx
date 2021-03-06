import React, { createContext, useReducer } from "react";
import { AuthReducer, actionType } from "./AuthReducer";

const initialState = {
  user: null,
  isFetching: false,
  error: null,
};

export interface AuthState {
  user: null | IUser;
  isFetching: boolean;
  error: null;
}

interface Props {
  children: JSX.Element;
}

export const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<actionType>;
}>({
  state: initialState,
  dispatch: () => {},
});

export const AuthContextProvider: React.FC<Props> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
