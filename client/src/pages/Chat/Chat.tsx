import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCircle } from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../../context/AuthContext";
import Conversation from "./Conversation/Conversation";
import { IFriend } from "./Conversation";
import { axiosInstance } from "../../api";
import { Message } from "./Message";
import "./Chat.css";

interface IConversation {
  members: [];
  _id: string;
}

interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export const Chat = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AuthContext);

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

  const handleSendNewMessage = async () => {
    if (!currentConversation) return;
    try {
      await axiosInstance.post(`chat/${currentConversation._id!}/messages`, {
        text: newMessage,
      });
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  };

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

      console.log("messages", resp.data);
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

  return (
    <div className="container">
      <div className="people-list-container" id="people-list">
        <div className="search">
          <div className="search-container">
            <input type="text" placeholder="search" />
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
                    <Message
                      isRight={msg.senderId === state.user}
                      message={msg.text}
                      name={currentChatPartner!.username}
                      time={msg.createdAt}
                      key={msg._id}
                    />
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
