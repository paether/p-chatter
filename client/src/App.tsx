import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const register = async () => {
    try {
      const resp = await axios({
        method: "post",
        data: {
          username,
          password,
          email,
        },
        withCredentials: true,
        url: "http://localhost:8800/api/auth/register",
      });
      console.log(resp);
    } catch (error) {
      console.log(error);
    }
  };
  const login = async () => {
    try {
      const resp = await axios({
        method: "post",
        data: {
          username,
          password,
        },
        withCredentials: true,
        url: "http://localhost:8800/api/auth/login",
      });
      console.log(resp);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="register">
        <input
          placeholder="username"
          type="text"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="email"
          type="text"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="password"
          type="text"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={register}>submit</button>
      </div>
      <div className="login">
        <input
          placeholder="username"
          type="text"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="email"
          type="text"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="password"
          type="text"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>submit</button>
      </div>
      <div>
        <h1>get user</h1>
        <button>submit</button>
      </div>
    </>
  );
}

export default App;
