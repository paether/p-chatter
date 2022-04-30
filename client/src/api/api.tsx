import axios from "axios";

export const axiosInstance = axios.create({
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

export const getFriendsCall = async () => {
  try {
    const resp = await axiosInstance.get("/users/friends");
    return resp.data;
  } catch (error: any) {
    throwError("Get friends error", error.response);
  }
};

export const postNewMessageCall = async (
  convId: string,
  newMessage: string
) => {
  try {
    const resp = await axiosInstance.post(`chat/${convId}/messages`, {
      text: newMessage,
    });
    return resp.data;
  } catch (error: any) {
    throwError("Post new message error", error.response);
  }
};

export const getConversationsCall = async () => {
  try {
    const resp = await axiosInstance.get("/chat");
    return resp.data;
  } catch (error: any) {
    throwError("Get conversations error", error.response);
  }
};

export const getMessagesCall = async (convId: string) => {
  try {
    const resp = await axiosInstance.get(`/chat/${convId}/messages`);
    return resp.data;
  } catch (error: any) {
    throwError("Get messages error", error.response);
  }
};

export const getUsersCall = async (userFilter: string) => {
  try {
    const resp = await axiosInstance.get("/users", {
      params: {
        username: userFilter,
      },
    });
    return resp.data;
  } catch (error: any) {
    throwError("Get users error", error.response);
  }
};

export const putAddFriendCall = async (userId: string) => {
  try {
    await axiosInstance.put(`/users/${userId}/addfriend`);
    return;
  } catch (error: any) {
    throwError("Get users error", error.response);
  }
};

export const postNewConversationCall = async (
  senderId: string,
  receiverId: string
) => {
  try {
    await axiosInstance.post("/chat", {
      senderId,
      receiverId,
    });
    return "ok";
  } catch (error: any) {
    throwError("Get users error", error.response);
  }
};

export const getFriendCall = async (friendId: string) => {
  try {
    const resp = await axiosInstance.get("/users/" + friendId);
    return resp.data;
  } catch (error: any) {
    throwError("Get friend error", error.response);
  }
};
