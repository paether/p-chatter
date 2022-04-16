import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCircle } from "@fortawesome/free-solid-svg-icons";
import { Message } from "./Message";
import "./Chat.css";

export const Chat = () => {
  const navigate = useNavigate();

  // dinamikusan profile kep es adatok toltese, map hasznalataval?
  const Person: React.FC<{ name: string; status: string }> = ({
    name,
    status,
  }) => {
    return (
      <li className="person">
        <img
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg"
          alt="avatar"
        />
        <div className="about">
          <div className="name">{name}</div>
          <div className="status">
            <FontAwesomeIcon className={status} icon={faCircle} />
            {status}
          </div>
        </div>
      </li>
    );
  };

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
          <Person {...{ name: "test name", status: "online" }} />
          <Person {...{ name: "test nadsdsdsme", status: "online" }} />
          <Person {...{ name: "test name", status: "online" }} />
          <Person
            {...{ name: "test naaasdsdsdsdsaaaaame", status: "online" }}
          />
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
