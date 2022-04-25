import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faMessage } from "@fortawesome/free-solid-svg-icons";
import { Socket } from "socket.io-client";

import FriendsBar from "../../components/FriendsBar";
import { AuthContext } from "../../context/AuthContext";
import Conversation from "./Conversation";
import { IFriend } from "./Conversation";
import { axiosInstance } from "../../api";
import { Message } from "./Message";

import "./Chat.css";

interface IConversation {
  members: string[];
  _id: string;
}

interface IMessage {
  _id: string;
  conversationId?: string;
  senderId: string;
  text: string;
  createdAt: any;
}
interface ISearchedPerson {
  _id: string;
  username: string;
  picture: string;
}

interface IOnlineFriend extends IFriend {
  online?: boolean;
}

type IOnlineFriends = IOnlineFriend[];

export const Chat = ({ socket }: { socket: Socket | null }) => {
  const { state } = useContext(AuthContext);
  const messageRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchResultRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchedPeople, setSearchedPeople] = useState<ISearchedPerson[]>([]);
  const [conversations, setConversations] = useState<IConversation[] | []>([]);
  const [currentConversation, setCurrentConversation] =
    useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[] | []>([]);
  const [currentChatPartner, setCurrentChatPartner] = useState<IFriend | null>(
    null
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [userFilter, setUserFilter] = useState("");
  const [friends, setFriends] = useState<IOnlineFriends | []>([]);

  useEffect(() => {
    if (!socket || !state.user) {
      return;
    }
    socket.emit("newUser", state.user);
    socket.on("getUsers", (socketUsers) => {
      console.log("friends", friends);

      const onlineFriends = friends.map((friend) => {
        if (socketUsers.find((user: any) => user.userId === friend._id)) {
          return { ...friend, online: true };
        }
        return friend;
      });

      setFriends(onlineFriends);
    });
    socket.on("getMessage", (message) => {
      if (currentConversation?.members.includes(message.senderId)) {
        setMessages((prev) => [
          ...prev,
          {
            _id: message.messageId,
            senderId: message.senderId,
            text: message.text,
            createdAt: Date.now(),
          },
        ]);
      }
    });
  }, [state.user, socket]);

  useEffect(() => {
    const getFriends = async () => {
      try {
        const resp = await axiosInstance.get("/users/friends");
        setFriends(resp.data);
      } catch (error) {
        console.log(error);
      }
    };
    getFriends();
  }, []);

  useEffect(() => {}, [currentConversation]);

  const handleSendNewMessage = useCallback(async () => {
    if (!currentConversation) return;
    try {
      const resp = await axiosInstance.post(
        `chat/${currentConversation._id!}/messages`,
        {
          text: newMessage,
        }
      );

      const receiverId = currentConversation.members.find(
        (member) => member !== state.user
      );

      socket?.emit("sendMessage", {
        senderId: state.user,
        receiverId,
        messageId: resp.data._id,
        text: newMessage,
      });
      setMessages((prev) => [...prev, resp.data]);
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  }, [currentConversation, newMessage, socket, state.user]);

  const getConversations = useCallback(async () => {
    if (state.user) {
      try {
        const resp = await axiosInstance.get("/chat");

        setConversations(resp.data);
      } catch (error) {
        console.log(error);
      }
    }
  }, [state.user]);

  const getMessages = useCallback(async () => {
    if (!currentConversation) return;

    try {
      const resp = await axiosInstance.get(
        `/chat/${currentConversation._id}/messages`
      );

      setMessages(resp.data);
    } catch (error) {
      console.log(error);
    }
  }, [currentConversation]);

  useEffect(() => {
    getConversations();
  }, [getConversations]);

  useEffect(() => {
    getMessages();
  }, [currentConversation, getMessages]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (userFilter.length === 0) {
      if (searchedPeople.length > 0) {
        setSearchedPeople([]);
      }
      return;
    }

    let filterTimeout = setTimeout(async () => {
      try {
        const resp = await axiosInstance.get("/users", {
          params: {
            username: userFilter,
          },
        });
        setSearchedPeople(resp.data);
      } catch (error) {
        console.log(error);
      }
    }, 500);

    return () => {
      clearTimeout(filterTimeout);
    };
  }, [searchedPeople.length, userFilter]);

  const handleSearchClicked = (e: any, clicked: boolean) => {
    if (clicked) {
      searchResultRef.current?.classList.add("visible");
      searchContainerRef.current?.classList.add("active");
      return;
    }
  };
  const addFriend = async (id: string) => {
    if (id === state.user) {
      alert("cannot add yourself as friend!");
      return;
    }
    try {
      const resp = await axiosInstance.put(`/users/${id}/addfriend`);
    } catch (error) {
      console.log(error);
    }
  };

  const hideDropDown = (e: any) => {
    const target = e.target as HTMLElement;
    if (!searchRef.current?.contains(target)) {
      searchResultRef.current?.classList.remove("visible");
      searchContainerRef.current?.classList.remove("active");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", hideDropDown);

    return () => {
      document.removeEventListener("mousedown", hideDropDown);
    };
  }, []);

  const handleOpenChat = async (userId: string) => {
    try {
      await axiosInstance.post("/chat", {
        senderId: state.user,
        receiverId: userId,
      });
      getConversations();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <div className="people-list-container" id="people-list">
        <div className="search" ref={searchRef}>
          <div className="search-container" ref={searchContainerRef}>
            <input
              type="text"
              placeholder="search"
              className="search-input"
              onFocus={(e) => handleSearchClicked(e, true)}
              onChange={(e) => setUserFilter(e.target.value)}
            />
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <ul className="search-result-container" ref={searchResultRef}>
            {searchedPeople.map((person) => {
              return (
                <li key={person._id} className="search-result">
                  <div
                    onClick={() => addFriend(person._id)}
                    className="username"
                  >
                    {person.username}
                  </div>
                  <div
                    className="chat"
                    onClick={() => handleOpenChat(person._id)}
                  >
                    <FontAwesomeIcon icon={faMessage} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <ul className="people-list">
          {conversations && conversations.length > 0
            ? conversations.map((conversation) => {
                return (
                  <Conversation
                    conversation={conversation}
                    key={conversation._id}
                    userId={state.user}
                    setCurrentConversation={setCurrentConversation}
                    setCurrentChatPartner={setCurrentChatPartner}
                  />
                );
              })
            : "no conversations"}
        </ul>
      </div>
      {currentConversation ? (
        <div className="chat-container">
          <div className="chat-header ">
            <img
              src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg"
              alt="avatar"
            />

            <div className="chat-about">
              <div className="chat-with">
                Chat with {currentChatPartner?.username}
              </div>
              <div className="chat-num-messages">already 1 902 messages</div>
            </div>
          </div>

          <div className="chat-history" ref={messagesRef}>
            {currentConversation ? (
              messages.map((msg) => {
                return (
                  <div
                    key={msg._id}
                    className={
                      msg.senderId === state.user
                        ? "message-container align-right"
                        : "message-container"
                    }
                    ref={messageRef}
                  >
                    <Message
                      isRight={msg.senderId === state.user}
                      message={msg.text}
                      name={
                        msg.senderId === state.user
                          ? "me"
                          : currentChatPartner!.username
                      }
                      time={msg.createdAt}
                    />
                  </div>
                );
              })
            ) : (
              <div className="default-message">
                Open a conversation to start chatting!
              </div>
            )}
          </div>

          <div className="chat-message ">
            <textarea
              name="message-to-send"
              id="message-to-send"
              placeholder="Type your message"
              rows={3}
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
            ></textarea>

            <i className="fa fa-file-o"></i>
            <i className="fa fa-file-image-o"></i>

            <button onClick={handleSendNewMessage}>Send</button>
          </div>
        </div>
      ) : (
        <div className="default-message">
          Open a conversation to start chatting!
        </div>
      )}
      <FriendsBar friends={friends} />
    </div>
  );
};
