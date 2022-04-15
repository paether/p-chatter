import React, { useContext, useEffect, useState, Suspense } from "react";
import { axiosInstance } from "./api";
import {
  Routes,
  Route,
  BrowserRouter as Router,
  useLocation,
  Navigate,
} from "react-router-dom";

import { AuthContext } from "./context/AuthContext";

import { Login } from "./pages/Login";
import { Chat } from "./pages/Chat";
import { Home } from "./pages/Home";
import { Loading } from "./components/Loading";
import "./App.css";

function App() {
  const { state, dispatch } = useContext(AuthContext);
  const [isLoading, setIsloading] = useState(true);

  const checkAuth = async () => {
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
  };

  useEffect(() => {
    if (!state.user) {
      checkAuth();
    }
  }, []);

  // const updatePass = async () => {
  //   try {
  //     const resp = await axios({
  //       method: "put",
  //       data: {
  //         password,
  //         id: user,
  //       },
  //       withCredentials: true,
  //       url: "http://localhost:8800/api/users/" + user + "/updatepassword",
  //     });
  //     console.log(resp);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      {/* header */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={state.user ? <Chat /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
