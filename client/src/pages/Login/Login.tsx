import { useState, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Login.css";
import { loginCall, registerCall } from "../../api";
import { motion } from "framer-motion";

export const Login: React.FC = () => {
  const { state, dispatch } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const buttonContainer = useRef<HTMLDivElement>(null);

  const handleButtonTypeHelper = (
    btnElement: HTMLElement,
    remove: string,
    add: string
  ) => {
    btnElement.classList.remove(remove);
    btnElement.classList.add(add);
  };

  const handleButtonType = () => {
    const btnContainer: HTMLElement = buttonContainer.current!;
    if (btnContainer.classList.contains("login")) {
      handleButtonTypeHelper(btnContainer, "login", "register");
      setIsLogin(false);
      return;
    }
    setIsLogin(true);
    handleButtonTypeHelper(btnContainer, "register", "login");
  };

  const handleLoginRegisterButton = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      if (!isLogin) {
        await registerCall(username, password);
      }
      dispatch({ type: "LOGIN_START" });
      const resp = await loginCall(username, password);
      dispatch({ type: "LOGIN_SUCCESS", payload: resp });
      localStorage.setItem("user", resp);
    } catch (error: any) {
      dispatch({ type: "LOGIN_ERROR", payload: error });
      if (error.statusText === "Unauthorized") {
        alert("Invalid username and/or password");
      } else if (error.statusText === "Already existing user") {
        alert("This username is already taken!");
      } else {
        alert("Unknown error occured");
      }
    }
  };

  const LoadingCircle = () => {
    return (
      <div className="loading-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={(e) => {
        handleLoginRegisterButton(e);
      }}
    >
      <label htmlFor="username">Username</label>
      <input
        onChange={(e) => setUsername(e.target.value)}
        required
        type="text"
        placeholder="Username"
        id="username"
      />

      <label htmlFor="password">Password</label>
      <input
        onChange={(e) => setPassword(e.target.value)}
        required
        type="password"
        placeholder="Password"
        id="password"
      />
      <div className="button-container login" ref={buttonContainer}>
        <button className="front">
          {state.isFetching ? <LoadingCircle /> : "Log In"}
        </button>
        <button className="back">
          {state.isFetching ? <LoadingCircle /> : "Register"}
        </button>
      </div>

      <div className="login-bottom">
        <div className="forgot">Forgot password</div>
        <div onClick={handleButtonType} className="register">
          {isLogin ? "Register" : "Login"}
        </div>
      </div>
    </motion.form>
  );
};
