import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

import { axiosInstance } from "../../../api";

interface IConversationExtended {
  members: string[];
  _id: string;
  friend: {
    _id: string;
    username: string;
    picture: string;
    online?: string;
  };
}

export interface IFriend {
  _id: string;
  username: string;
  picture?: string;
  online?: boolean;
}
interface ISocketUser {
  userId: string;
  socketId: string;
}

const Conversation: React.FC<{
  conversations: IConversationExtended[];
  userId: string;
  setCurrentConversation: Dispatch<
    SetStateAction<IConversationExtended | null>
  >;
  setCurrentChatPartner: Dispatch<SetStateAction<IFriend | null>>;
  onlineUsers: ISocketUser[];
}> = ({
  conversations,
  userId,
  setCurrentConversation,
  setCurrentChatPartner,
  onlineUsers,
}) => {
  const [friend, setFriend] = useState<IFriend | null>(null);

  const handleClick = () => {
    setCurrentChatPartner(friend);
  };
  return (
    <>
      {conversations
        .reduce((acc, conversation) => {
          if (conversation.friend.online) {
            return [conversation, ...acc];
          }
          return [...acc, conversation];
        }, [] as IConversationExtended[])
        .map((conversation) => {
          return (
            <li
              key={conversation._id}
              className="person"
              onClick={() => {
                setCurrentConversation(conversation);
              }}
            >
              <img
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg"
                alt="avatar"
              />
              <div className="about">
                <div className="name">{conversation.friend!.username}</div>
                <div className="status">
                  <FontAwesomeIcon
                    className={
                      conversation.friend?.online ? "online" : "offline"
                    }
                    icon={faCircle}
                  />
                </div>
              </div>
            </li>
          );
        })}
    </>
  );
};

export default Conversation;
