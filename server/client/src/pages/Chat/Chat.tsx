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
  faUsers,
  faComments,
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
  const friendTypingRef = useRef<HTMLDivElement>(null);

  const [searchedPeople, setSearchedPeople] = useState<
    ISearchedPerson[] | string
  >([]);
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
  const [arrivingTyper, setArrivingTyper] = useState<IArrivingTpyer>({
    id: "",
  });

  const logOut = useCallback(async () => {
    try {
      await axiosInstance.post("/auth/logout");
      dispatch({ type: "LOGOUT_SUCCESS" });
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

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
    if (!socket || !state.user) {
      return;
    }
    // load unread messages from server when logged in
    let unreads: { [id: string]: number } = {};
    if (state.user?.unread) {
      Object.keys(state.user?.unread).forEach((key: string) => {
        unreads[key] = state.user?.unread[key]!;
      });
    }
    //store unread messages locally after logging in to speed things up
    setUnreadMsgs((prevState) => ({
      ...prevState,
      ...unreads,
    }));
    let onlineStatusTimeout: ReturnType<typeof setTimeout>;

    socket.emit("newUser", state.user._id);
    //debounce users logging in/out in case someone just refreshes his/her page
    socket.on("getUsers", (socketUsers) => {
      clearTimeout(onlineStatusTimeout);

      onlineStatusTimeout = setTimeout(() => {
        setOnlineUsers(socketUsers);
      }, 2000);
    });

    socket.on("getMessage", (msg) => setArrivingMessage(msg));
    socket.on("typing", (sender) => {
      setArrivingTyper(sender);
    });
    socket.on("getFriends", getFriends);
  }, [state.user, socket]);

  useEffect(() => {
    async function handleArrivingMessage() {
      //update UI based on message arriving from socket.io depending on which conversation is currently active
      if (!arrivingMessage) {
        const unreadFriend = currentConversation?.members.find(
          (member) => member !== state.user?._id
        );

        if (
          //if there are unread messages when selecting that conversation, empty them both locally and on server side
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
      //if new message arrives from socketio and the message arriving from is the same as the currently opened conversation then display messages live
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
        if (friendTypingRef.current) {
          friendTypingRef.current.style.visibility = "hidden";
        }

        setArrivingMessage(null);
        return;
      }
      //if no conversation is switched and the current conversation is not the same as the originating message, then it will be an unread message
      //then it will be sent to the server as well as to the client

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
    //handle click outside of dropdown
    document.addEventListener("mousedown", hideDropDown);
    //refersh date on messages while the conversation is open (sent X minutes/hours etc. ago)
    const intervalId = setInterval(() => getMessages(), 60000);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("mousedown", hideDropDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendNewMessage = useCallback(async () => {
    if (!currentConversation || newMessage.length === 0 || !currentChatPartner)
      return;
    try {
      const postedMessage = await postNewMessageCall(
        currentConversation._id!,
        newMessage
      );

      socket?.emit("sendMessage", {
        senderId: state.user?._id,
        receiverId: currentChatPartner._id,
        messageId: postedMessage._id,
        text: newMessage,
      });

      setMessages((prev) => [...prev, postedMessage]);
      setNewMessage("");
      //if the receiver is not online then the unread message will be sent to the server only
      //so when she/he logs in the unread messages will be displayed to them
      if (
        !onlineUsers.some((user) => {
          return user.userId === currentChatPartner._id;
        })
      ) {
        await putUpdateUnread(
          currentChatPartner._id!,
          state.user!._id,
          "increment"
        );
      }
    } catch (error) {
      console.log(error);
    }
  }, [
    currentConversation,
    newMessage,
    socket,
    state.user,
    onlineUsers,
    currentChatPartner,
  ]);

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
    //group recently used conversations together
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
    //auto scroll to last message when new one arrives
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (userFilter.length === 0) {
      setSearchedPeople([]);
      return;
    }
    //debouncing input to not make requests until user stops typing to reduce server overhead
    let filterTimeout = setTimeout(async () => {
      try {
        const users = await getUsersCall(userFilter);

        if (users.length === 0) {
          setSearchedPeople("No search result");
          return;
        }
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
    //update current conversation when user opens chat from the friend list bar
    if (currentChatPartner) {
      //reset typing
      // if (arrivingTyper.id !== "") {
      //   setArrivingTyper({ id: "" });
      // }
      if (friendTypingRef.current) {
        friendTypingRef.current.style.visibility = "hidden";
      }

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
    //chat opening from friends list bar
    try {
      let conversationExists = conversations.find((conversation) =>
        conversation.members.includes(userId)
      );
      //if there is no previous conversation with that friend a new one will be created
      if (!conversationExists) {
        await postNewConversationCall(state.user!._id, userId);
        await getConversations();
      }
      let friend = await getFriendCall(userId);

      //empty out unread messages
      await putUpdateUnread(state.user!._id, userId, 0);
      setUnreadMsgs((prevState) => ({
        ...prevState,
        [userId]: 0,
      }));
      //set chat partner which will trigger the current conversation changing useEffect
      setCurrentChatPartner(friend);
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentConversation) return;

    if (currentChatPartner) {
      socket?.emit("typing", {
        senderId: state.user?._id,
        receiverId: currentChatPartner._id,
      });
    }

    setNewMessage(e.target.value);
  };
  useEffect(() => {
    if (!friendTypingRef.current) {
      return;
    }
    let typingTimeout: ReturnType<typeof setTimeout>;

    if (arrivingTyper.id === currentChatPartner?._id) {
      friendTypingRef.current.style.visibility = "visible";
      typingTimeout = setTimeout(() => {
        friendTypingRef.current!.style.visibility = "hidden";
      }, 2000);
    }

    return () => clearTimeout(typingTimeout);
  }, [arrivingTyper]);
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
            {Array.isArray(searchedPeople) ? (
              searchedPeople.map((person) => {
                return (
                  <li key={person._id} className="search-result">
                    <div className="username">{person.username}</div>
                    <FontAwesomeIcon
                      onClick={() => addFriend(person._id)}
                      icon={faUserPlus}
                    />
                  </li>
                );
              })
            ) : (
              <li className="search-result">{searchedPeople + "."}</li>
            )}
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
              <div ref={friendTypingRef} className="friendTyping">
                {currentChatPartner!.username + " is typing"}
                <div className="dot-typing">
                  <div className="dot1"></div>
                  <div className="dot2"></div>
                  <div className="dot3"></div>
                </div>
              </div>
            </div>
            <div className="mobile-profile-picture">
              <Profile logOut={logOut} />
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
              onChange={(e) => handleTyping(e)}
              value={newMessage}
            ></textarea>
            <div className="chat-message-bottom">
              <FontAwesomeIcon icon={faUsers} />
              <FontAwesomeIcon icon={faComments} />
              <div className="people-list-backdrop"></div>
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
                    {Array.isArray(searchedPeople) ? (
                      searchedPeople.map((person) => {
                        return (
                          <li key={person._id} className="search-result">
                            <div className="username">{person.username}</div>
                            <FontAwesomeIcon
                              onClick={() => addFriend(person._id)}
                              icon={faUserPlus}
                            />
                          </li>
                        );
                      })
                    ) : (
                      <li className="search-result">{searchedPeople + "."}</li>
                    )}
                  </ul>
                </div>
                <div className="people-list-header">Chats</div>
                <div className="people-list-switcher">
                  <div
                    onClick={() =>
                      setIsCurrentConverations(!isCurrentConversations)
                    }
                    className={
                      isCurrentConversations ? "all-chat" : "all-chat active"
                    }
                  >
                    All
                  </div>
                  <div
                    onClick={() =>
                      setIsCurrentConverations(!isCurrentConversations)
                    }
                    className={
                      !isCurrentConversations
                        ? "current-chat"
                        : "current-chat active"
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
                        isCurrentConversations
                          ? currentConversations
                          : conversations
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
              <button onClick={handleSendNewMessage}>Send</button>
            </div>
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
