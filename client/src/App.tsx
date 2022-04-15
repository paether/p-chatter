import React, { useContext, useState } from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";

import axios from "axios";

import { LoginPage } from "./components/LoginPage/";
import "./App.css";

function App() {
  // const register = async () => {
  //   try {
  //     const resp = await axios({
  //       method: "post",
  //       data: {
  //         username,
  //         password,
  //         email,
  //       },
  //       withCredentials: true,
  //       url: "http://localhost:8800/api/auth/register",
  //     });
  //     setUser(resp.data);
  //     console.log(resp.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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

  return (
    <Router>
      {/* header */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
