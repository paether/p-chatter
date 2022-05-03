import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Login } from "../../pages/Login";
import { Chat } from "../../pages/Chat";
import { Socket } from "socket.io-client";
import { AnimatePresence } from "framer-motion";

interface IState {
  user: string;
  isFetching: boolean;
  error: null;
}

const AnimatedRoutes = ({
  state,
  socket,
}: {
  state: IState;
  socket: Socket | null;
}) => {
  const location = useLocation();

  return (
    <AnimatePresence exitBeforeEnter>
      <Routes>
        <Route
          path="/chat"
          element={
            state.user ? <Chat socket={socket} /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/login"
          element={state.user ? <Navigate to="/chat" /> : <Login />}
        />
        <Route
          path="*"
          element={state.user ? <Navigate to="/chat" /> : <Login />}
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
