import { useContext, useEffect, useState, useCallback } from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { axiosInstance } from "./api";
import { AuthContext } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Chat } from "./pages/Chat";
import { Loading } from "./components/Loading";

import "./App.css";

function App() {
  const { state, dispatch } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (state.user) {
      const newSocket: Socket = io("http://localhost:8800", {
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
        dispatch({ type: "LOGIN_SUCCESS", payload: resp.data.id });
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

  if (state.isFetching || isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      {/* header */}
      <Routes>
        <Route
          path="*"
          element={state.user ? <Chat socket={socket} /> : <Login />}
        />
        {/* <Route path="/login" element={<Login />} />
        <Route
          path="/chat"
          element={state.user ? <Chat socket={socket} /> : <Login />}
        /> */}
      </Routes>
    </Router>
  );
}

export default App;
