import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8800/api",
  withCredentials: true,
});

interface errorDataInterface extends Error {
  data?: {
    statusText: string;
    status: string;
  };
}

const throwError = (errorType: string, error: any) => {
  const errorData: errorDataInterface = new Error(errorType);
  errorData.data = {
    statusText: error.data,
    status: error.status,
  };

  throw errorData.data;
};

export const loginCall = async (username: string, password: string) => {
  try {
    const resp = await axiosInstance.post("/auth/login", {
      username,
      password,
    });
    return resp.data;
  } catch (error: any) {
    throwError("Login error", error.response);
  }
};

export const registerCall = async (username: string, password: string) => {
  try {
    const resp = await axiosInstance.post("/auth/register", {
      username,
      password,
    });
    return resp.data;
  } catch (error: any) {
    throwError("Register error", error.response);
  }
};
