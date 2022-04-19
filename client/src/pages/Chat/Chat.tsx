import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCircle } from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../../context/AuthContext";
import Conversation from "./Conversation/Conversation";
import { axiosInstance } from "../../api";
import { Message } from "./Message";
import "./Chat.css";

export const Chat = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  const { state, dispatch } = useContext(AuthContext);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const resp = await axiosInstance.get("/chat");
        setConversations(resp.data);
      } catch (error) {}
    };
    getConversations();
  }, [state.user]);

  // dinamikusan profile kep es adatok toltese, map hasznalataval?

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
          {conversations.map((conversation) => {
            return (
              <Conversation
                key={state.user}
                conversation={conversation}
                userId={state.user}
              />
            );
          })}
        </ul>
      </div>

      <div className="chat-container">
        <div className="chat-header ">
          <img
            src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg"
            alt="avatar"
          />

          <div className="chat-about">
            <div className="chat-with">Chat with Vincent Porter</div>
            <div className="chat-num-messages">already 1 902 messages</div>
          </div>
        </div>

        <div className="chat-history">
          <ul>
            <Message
              {...{
                isRight: false,
                message:
                  "Hi Peer, how are you? How is the project coming along?",
                name: "Peti",
                time: "11:11 AM, Today",
              }}
            />
            <Message
              {...{
                isRight: true,
                message:
                  "Hi Peer, how are you? How is the project coming along?",
                name: "Peti",
                time: "11:11 AM, Today",
              }}
            />

            <Message
              {...{
                isRight: false,
                message:
                  "Hi Peer, how are you? How is the project coming along?",
                name: "Peti",
                time: "11:11 AM, Today",
              }}
            />
            <Message
              {...{
                isRight: true,
                message:
                  "Hi Peer, how are you? How is the project coming along?",
                name: "Peti",
                time: "11:11 AM, Today",
              }}
            />

            <Message
              {...{
                isRight: false,
                message:
                  "Hi Peer, how are you? How is the project coming along?",
                name: "Peti",
                time: "11:11 AM, Today",
              }}
            />
            <Message
              {...{
                isRight: true,
                message:
                  "Hi Peer, how are you? How is the project coming along?",
                name: "Peti",
                time: "11:11 AM, Today",
              }}
            />
          </ul>
        </div>

        <div className="chat-message ">
          <textarea
            name="message-to-send"
            id="message-to-send"
            placeholder="Type your message"
            rows={3}
          ></textarea>

          <i className="fa fa-file-o"></i>
          <i className="fa fa-file-image-o"></i>

          <button>Send</button>
        </div>
      </div>
    </div>
  );
};
