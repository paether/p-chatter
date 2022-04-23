import { useContext, useEffect, useState, useCallback } from "react";
import { axiosInstance } from "./api";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { AuthContext } from "./context/AuthContext";

import { Login } from "./pages/Login";
import { Chat } from "./pages/Chat";
import { Home } from "./pages/Home";
import { Loading } from "./components/Loading";
import "./App.css";

function App() {
  const { state, dispatch } = useContext(AuthContext);
  const [isLoading, setIsloading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

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
      setIsloading(true);
      const resp = await axiosInstance.get("/auth/isloggedin");
      if (resp) {
        setIsloading(false);
        dispatch({ type: "LOGIN_SUCCESS", payload: resp.data.id });
      }
    } catch (error) {
      setIsloading(false);
      console.log(error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!state.user) {
      checkAuth();
    }
  }, [checkAuth, state.user]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      {/* header */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/chat"
          element={state.user ? <Chat socket={socket} /> : <Login />}
        />
      </Routes>
    </Router>
  );
}

export default App;
