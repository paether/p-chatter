import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./LoginPage.css";
import { loginCall, registerCall } from "../../api";
import { actionType } from "../../context/AuthReducer";

export const LoginPage: React.FC = () => {
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
      if (isLogin) {
        dispatch({ type: "LOGIN_START" });
        const resp = await loginCall(username, password);
        dispatch({ type: "LOGIN_SUCCESS", payload: resp! });
      } else {
        dispatch({ type: "REGISTER_START" });
        const resp = await registerCall(username, password);
        dispatch({ type: "REGISTER_SUCCESS", payload: resp! });
      }
    } catch (error: any) {
      if (isLogin) {
        dispatch({ type: "LOGIN_ERROR", payload: error });
        if (error.statusText === "Unauthorized") {
          alert("Invalid username and/or password");
        } else {
          alert("Unknown error occured");
        }
      } else {
        dispatch({ type: "REGISTER_ERROR", payload: error });
        console.log(error);
        if (error.statusText === "Already existing user") {
          alert("This username is already taken!");
        } else {
          alert("Unknown error occured");
        }
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
    <form
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
    </form>
  );
};
