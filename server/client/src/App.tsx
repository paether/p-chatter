import { useContext, useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { axiosInstance } from "./api";
import { AuthContext } from "./context/AuthContext";
import AnimatedRoutes from "./components/AnimatedRoutes/AnimatedRoutes";
import { Loading } from "./components/Loading";
import "./App.css";

function App() {
  const { state, dispatch } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (state.user) {
      const newSocket: Socket = io("https://p-chatter.herokuapp.com", {
        withCredentials: true,
      });
      setSocket(newSocket);
    }
  }, [state.user]);

  const checkAuth = useCallback(async () => {
    try {
      dispatch({ type: "LOGIN_START" });
      const resp = await axiosInstance.get("/auth/isloggedin");
      if (resp) {
        dispatch({ type: "LOGIN_SUCCESS", payload: resp.data });
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      dispatch({ type: "LOGIN_ERROR", payload: error });
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!state.user) {
      checkAuth();
    }
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      <AnimatedRoutes state={state} socket={socket} />
    </Router>
  );
}

export default App;
