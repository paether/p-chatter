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
  putUpdateUnread,
} from "../../api";
import FriendsBar from "../../components/FriendsBar";
import Profile from "../../components/Profile";
import { AuthContext } from "../../context/AuthContext";
import Conversation from "./Conversation";
import { Message } from "./Message";
import "./Chat.css";

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
    useState<IArrivingMessage | null>(null);
  const [unreadMsgs, setUnreadMsgs] = useState<IUnreadMsg>({});

  const logOut = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      dispatch({ type: "LOGOUT_SUCCESS" });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // a seperate onlinefriends state had to be created to handle both new online users from socketio and new friends added live
    if (onlineUsers.length === 0) {
      return;
    }

    let onlineFriends: IFriend[] = friends.map((friend) => {
      if (onlineUsers.find((user: ISocketUser) => user.userId === friend._id)) {
        return { ...friend, online: true };
      }
      return friend;
    });

    setOnlineFriends(onlineFriends);
  }, [onlineUsers, friends]);

  useEffect(() => {
    //handle socket.io events
    if (!socket || !state.user) {
      return;
    }
    let unreads: { [id: string]: number } = {};
    if (state.user?.unread) {
      Object.keys(state.user?.unread).forEach((key: string) => {
        unreads[key] = state.user?.unread[key]!;
      });
    }

    setUnreadMsgs((prevState) => ({
      ...prevState,
      ...unreads,
    }));
    let onlineStatusTimeout: ReturnType<typeof setTimeout>;

    socket.emit("newUser", state.user._id);
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
    async function handleArrivingMessage() {
      //update UI based on message arriving from socket.io based on which conversation is currently active
      if (!arrivingMessage) {
        const unreadFriend = currentConversation?.members.find(
          (member) => member !== state.user?._id
        );
        if (
          unreadFriend &&
          unreadMsgs.hasOwnProperty(unreadFriend) &&
          unreadMsgs[unreadFriend] !== 0
        ) {
          await putUpdateUnread(state.user!._id, unreadFriend, 0);
          setUnreadMsgs((prevState) => ({
            ...prevState,
            [unreadFriend]: 0,
          }));
        }

        return;
      }
      if (currentConversation?.members.includes(arrivingMessage.senderId)) {
        setMessages((prev) => [
          ...prev,
          {
            _id: arrivingMessage.messageId,
            senderId: arrivingMessage.senderId,
            text: arrivingMessage.text,
            createdAt: arrivingMessage.createdAt,
          },
        ]);

        setArrivingMessage(null);
        return;
      }
      try {
        await putUpdateUnread(
          state.user!._id,
          arrivingMessage.senderId,
          unreadMsgs[arrivingMessage.senderId] + 1 || 1
        );
        setUnreadMsgs((prevState) => ({
          ...prevState,
          [arrivingMessage.senderId]:
            prevState[arrivingMessage.senderId] + 1 || 1,
        }));

        setArrivingMessage(null);
      } catch (error) {
        console.log(error);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
    handleArrivingMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    document.addEventListener("mousedown", hideDropDown);
    const intervalId = setInterval(() => getMessages(), 60000);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("mousedown", hideDropDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendNewMessage = useCallback(async () => {
    if (!currentConversation || newMessage.length === 0) return;
    try {
      const postedMessage = await postNewMessageCall(
        currentConversation._id!,
        newMessage
      );
      const receiverId = currentConversation.members.find(
        (member) => member !== state.user!._id
      );

      socket?.emit("sendMessage", {
        senderId: state.user?._id,
        receiverId,
        messageId: postedMessage._id,
        text: newMessage,
      });

      if (
        !onlineUsers.some((user) => {
          return user.userId === receiverId;
        })
      ) {
        await putUpdateUnread(receiverId!, state.user!._id, "increment");
      }

      setMessages((prev) => [...prev, postedMessage]);
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  }, [currentConversation, newMessage, socket, state.user, onlineUsers]);

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

  const addFriend = async (id: string) => {
    if (id === state.user?._id) {
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

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, currentChatPartner]);
  const handleSearchClicked = () => {
    searchResultRef.current?.classList.add("visible");
    searchContainerRef.current?.classList.add("active");
  };
  const hideDropDown = (e: MouseEvent) => {
    if (!searchRef.current?.contains(e.target as Node)) {
      searchResultRef.current?.classList.remove("visible");
      searchContainerRef.current?.classList.remove("active");
    }
  };
  const handleEnterButton = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendNewMessage();
    }
  };
  const handleOpenChat = async (userId: string) => {
    try {
      let conversationExists = conversations.find((conversation) =>
        conversation.members.includes(userId)
      );
      if (!conversationExists) {
        await postNewConversationCall(state.user!._id, userId);
        await getConversations();
      }
      let friend = await getFriendCall(userId);

      await putUpdateUnread(state.user!._id, userId, 0);

      setUnreadMsgs((prevState) => ({
        ...prevState,
        [userId]: 0,
      }));
      setCurrentChatPartner(friend);
    } catch (error: any) {
      console.log(error);
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
              userId={state.user!._id}
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
                      msg.senderId === state.user!._id
                        ? "message-container align-right"
                        : "message-container"
                    }
                    ref={messageRef}
                  >
                    <Message
                      isRight={msg.senderId === state.user!._id}
                      message={msg.text}
                      name={
                        msg.senderId === state.user!._id
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
      <div className="user-container">
        <Profile logOut={logOut} />
        <FriendsBar
          unreadMsgs={unreadMsgs}
          friends={onlineFriends}
          openChat={handleOpenChat}
        />
      </div>
    </motion.div>
  );
};
