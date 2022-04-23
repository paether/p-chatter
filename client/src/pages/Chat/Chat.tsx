import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Socket } from "socket.io-client";
import { AuthContext } from "../../context/AuthContext";
import Conversation from "./Conversation/Conversation";
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

export const Chat = ({ socket }: { socket: Socket | null }) => {
  const { state } = useContext(AuthContext);
  const messageRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<IConversation[] | null>(
    null
  );
  const [currentConversation, setCurrentConversation] =
    useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[] | []>([]);
  const [currentChatPartner, setCurrentChatPartner] = useState<IFriend | null>(
    null
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [userFilter, setUserFilter] = useState("");

  // const [sockt, setSocket] = useState<typeof io | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.emit("newUser", state.user);
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
  }, [currentConversation?.members, socket, state.user]);

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
      console.log("sent");

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
    try {
      const resp = await axiosInstance.get("/chat");
      setConversations(resp.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

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
    if (!messageRef.current) return;
    messageRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let filterTimeout = setTimeout(async () => {
      console.log("filtering");
      try {
        const resp = await axiosInstance.get("/users", {
          params: {
            username: userFilter,
          },
        });
        console.log(resp);
      } catch (error) {
        console.log(error);
      }
    }, 500);

    return () => {
      clearTimeout(filterTimeout);
    };
  }, [userFilter]);

  return (
    <div className="container">
      <div className="people-list-container" id="people-list">
        <div className="search">
          <div className="search-container">
            <input
              type="text"
              placeholder="search"
              onChange={(e) => setUserFilter(e.target.value)}
            />
            <FontAwesomeIcon icon={faSearch} />
          </div>
        </div>
        <ul className="people-list">
          {conversations
            ? conversations.map((conversation) => {
                return (
                  <Conversation
                    conversation={conversation}
                    key={state.user}
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

          <div className="chat-history">
            <ul>
              {currentConversation ? (
                messages.map((msg) => {
                  return (
                    <div
                      key={msg._id}
                      className="message-container"
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
            </ul>
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
    </div>
  );
};
