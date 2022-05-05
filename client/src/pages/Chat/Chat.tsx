import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { motion } from "framer-motion";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faUserPlus,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Socket } from "socket.io-client";

import {
  axiosInstance,
  getConversationsCall,
  getFriendCall,
  getFriendsCall,
  getMessagesCall,
  getUsersCall,
  postNewConversationCall,
  postNewMessageCall,
  putAddFriendCall,
} from "../../api";
import FriendsBar from "../../components/FriendsBar";
import { AuthContext } from "../../context/AuthContext";
import Conversation from "./Conversation";
import { Message } from "./Message";

import "./Chat.css";

interface ISearchedPerson {
  _id: string;
  username: string;
  picture: string;
}
interface arrivingMessage {
  senderId: string;
  receiverId: string;
  messageId: string;
  text: string;
}

export const Chat = ({ socket }: { socket: Socket | null }) => {
  const { state, dispatch } = useContext(AuthContext);
  const messageRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchResultRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchedPeople, setSearchedPeople] = useState<ISearchedPerson[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [currentConversations, setCurrentConversations] = useState<
    IConversation[]
  >([]);
  const [isCurrentConversations, setIsCurrentConverations] = useState(false);
  const [currentConversation, setCurrentConversation] =
    useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentChatPartner, setCurrentChatPartner] = useState<IFriend | null>(
    null
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [userFilter, setUserFilter] = useState("");
  const [friends, setFriends] = useState<IFriend[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<IFriend[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ISocketUser[]>([]);
  const [arrivingMessage, setArrivingMessage] =
    useState<arrivingMessage | null>(null);

  const logOut = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      dispatch({ type: "LOGOUT_SUCCESS" });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (onlineUsers.length === 0) {
      return;
    }
    console.log(friends);

    let onlineFriends: IFriend[] = friends.map((friend) => {
      if (onlineUsers.find((user: any) => user.userId === friend._id)) {
        return { ...friend, online: true };
      }
      return friend;
    });

    setOnlineFriends(onlineFriends);
  }, [onlineUsers, friends]);

  useEffect(() => {
    if (!socket || !state.user) {
      return;
    }
    let onlineStatusTimeout: any;

    socket.emit("newUser", state.user);
    socket.on("getUsers", (socketUsers) => {
      clearTimeout(onlineStatusTimeout);

      onlineStatusTimeout = setTimeout(() => {
        setOnlineUsers(socketUsers);
      }, 2000);
    });

    socket.on("getMessage", (msg) => setArrivingMessage(msg));

    socket.on("getFriends", getFriends);
  }, [state.user, socket]);

  useEffect(() => {
    if (!arrivingMessage) {
      return;
    }
    if (currentConversation?.members.includes(arrivingMessage.senderId)) {
      setMessages((prev) => [
        ...prev,
        {
          _id: arrivingMessage.messageId,
          senderId: arrivingMessage.senderId,
          text: arrivingMessage.text,
          createdAt: Date.now(),
        },
      ]);
    }
  }, [arrivingMessage, currentConversation]);

  const getFriends = async () => {
    try {
      const friendsResp = await getFriendsCall();

      setFriends(friendsResp);
      setOnlineFriends(friendsResp);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFriends();
    const intervalId = setInterval(() => getMessages(), 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSendNewMessage = useCallback(async () => {
    if (!currentConversation || newMessage.length === 0) return;
    try {
      const postedMessage = await postNewMessageCall(
        currentConversation._id!,
        newMessage
      );
      const receiverId = currentConversation.members.find(
        (member) => member !== state.user
      );

      socket?.emit("sendMessage", {
        senderId: state.user,
        receiverId,
        messageId: postedMessage._id,
        text: newMessage,
      });

      setMessages((prev) => [...prev, postedMessage]);
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  }, [currentConversation, newMessage, socket, state.user]);

  const getConversations = useCallback(async () => {
    if (state.user) {
      try {
        const conversations = await getConversationsCall();
        setConversations(conversations);
      } catch (error) {
        console.log(error);
      }
    }
  }, [state.user]);

  const getMessages = useCallback(async () => {
    if (!currentConversation) return;

    try {
      const messages = await getMessagesCall(currentConversation._id);
      setMessages(messages);
      setNewMessage("");
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
    if (currentConversation) {
      if (
        currentConversations.some(
          (currConv) => currConv._id === currentConversation._id
        )
      ) {
        return;
      }
      setCurrentConversations((prev) => [...prev, currentConversation]);
    }
  }, [currentConversation, currentConversations]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (userFilter.length === 0) {
      setSearchedPeople([]);
      return;
    }
    //debouncing input to not make requests until user stops typing
    let filterTimeout = setTimeout(async () => {
      try {
        const users = await getUsersCall(userFilter);
        setSearchedPeople(users);
      } catch (error) {
        console.log(error);
      }
    }, 500);

    return () => {
      clearTimeout(filterTimeout);
    };
  }, [userFilter]);

  const handleSearchClicked = () => {
    searchResultRef.current?.classList.add("visible");
    searchContainerRef.current?.classList.add("active");
  };
  const addFriend = async (id: string) => {
    if (id === state.user) {
      return;
    }
    try {
      await putAddFriendCall(id);
      getFriends();
      socket!.emit("addFriend", id);
    } catch (error) {
      console.log(error);
    }
  };

  const hideDropDown = (e: MouseEvent) => {
    if (!searchRef.current?.contains(e.target as Node)) {
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
      let conversationExists = conversations.find((conversation) =>
        conversation.members.includes(userId)
      );
      if (!conversationExists) {
        await postNewConversationCall(state.user, userId);
        await getConversations();
      }
      let friend = await getFriendCall(userId);
      setCurrentChatPartner(friend);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("currentconv");

    if (currentChatPartner) {
      let conversation = conversations.find((conversation) =>
        conversation.members.includes(currentChatPartner._id)
      );
      if (conversation) {
        if (
          currentConversation === null ||
          currentConversation._id !== conversation._id
        ) {
          setCurrentConversation(conversation);
        }
      }
    }
  }, [conversations, currentChatPartner]);

  const handleEnterButton = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendNewMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: -100 }}
      transition={{ duration: 0.5 }}
      className="container"
    >
      <div className="people-list-container" id="people-list">
        <div className="search" ref={searchRef}>
          <div className="search-container" ref={searchContainerRef}>
            <input
              type="text"
              placeholder="search"
              className="search-input"
              onFocus={() => handleSearchClicked()}
              ref={searchInputRef}
              onChange={(e) => setUserFilter(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSearch}
              onClick={() => {
                searchInputRef.current?.setSelectionRange(0, 0);
                searchInputRef.current?.focus();
              }}
            />
          </div>
          <ul className="search-result-container" ref={searchResultRef}>
            {searchedPeople.map((person) => {
              return (
                <li key={person._id} className="search-result">
                  <div className="username">{person.username}</div>
                  <FontAwesomeIcon
                    onClick={() => addFriend(person._id)}
                    icon={faUserPlus}
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <div className="people-list-header">Chats</div>
        <div className="people-list-switcher">
          <div
            onClick={() => setIsCurrentConverations(!isCurrentConversations)}
            className={isCurrentConversations ? "all-chat" : "all-chat active"}
          >
            All
          </div>
          <div
            onClick={() => setIsCurrentConverations(!isCurrentConversations)}
            className={
              !isCurrentConversations ? "current-chat" : "current-chat active"
            }
          >
            Current
          </div>
        </div>
        <ul className="people-list">
          {conversations && conversations.length > 0 ? (
            <Conversation
              onlineFriends={onlineFriends}
              conversations={
                isCurrentConversations ? currentConversations : conversations
              }
              userId={state.user}
              currentConversation={currentConversation}
              setCurrentConversation={setCurrentConversation}
              setCurrentChatPartner={setCurrentChatPartner}
            />
          ) : (
            "no conversations"
          )}
        </ul>
      </div>
      {currentConversation ? (
        <div className="chat-container">
          <div className="chat-header ">
            <div className="profile-picture">
              {currentChatPartner?.picture ? (
                <img src={currentChatPartner?.picture} alt="" />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
            </div>

            <div className="chat-about">
              <div className="chat-with">
                Chat with <span> {currentChatPartner?.username}</span>
              </div>
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
                      time={moment(msg.createdAt).fromNow()}
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
              onKeyDown={handleEnterButton}
              name="message-to-send"
              placeholder="Type your message..."
              rows={3}
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
            ></textarea>

            <button onClick={handleSendNewMessage}>Send</button>
          </div>
        </div>
      ) : (
        <div className="default-message">
          Open a conversation to start chatting!
        </div>
      )}

      <FriendsBar
        friends={onlineFriends}
        logOut={logOut}
        openChat={handleOpenChat}
      />
    </motion.div>
  );
};
