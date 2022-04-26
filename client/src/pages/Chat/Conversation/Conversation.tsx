import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

import { axiosInstance } from "../../../api";

interface IConversation {
  members: string[];
  _id: string;
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
  conversation: IConversation;
  userId: string;
  setCurrentConversation: Dispatch<SetStateAction<IConversation | null>>;
  setCurrentChatPartner: Dispatch<SetStateAction<IFriend | null>>;
  onlineUsers: ISocketUser[];
}> = ({
  conversation,
  userId,
  setCurrentConversation,
  setCurrentChatPartner,
  onlineUsers,
}) => {
  const [friend, setFriend] = useState<IFriend | null>(null);

  useEffect(() => {
    const friendId = conversation.members.find(
      (memberId) => memberId !== userId
    );

    const getFriend = async () => {
      try {
        const resp = await axiosInstance.get("/users/" + friendId);
        let friend = resp.data;

        if (onlineUsers) {
          const isOnline = onlineUsers.some((user) => {
            return user.userId === resp.data._id;
          });
          if (isOnline) {
            friend = { ...resp.data, online: true };
          }
        }
        setFriend(friend);
      } catch (error) {
        console.log(error);
      }
    };
    getFriend();
  }, [conversation, userId, onlineUsers]);

  const handleClick = () => {
    setCurrentConversation(conversation);
    setCurrentChatPartner(friend);
  };

  return (
    <li className="person" onClick={handleClick}>
      <img
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg"
        alt="avatar"
      />
      <div className="about">
        <div className="name">{friend ? friend?.username : "anonym"}</div>
        <div className="status">
          <FontAwesomeIcon
            className={friend?.online ? "online" : "offline"}
            icon={faCircle}
          />
        </div>
      </div>
    </li>
  );
};

export default Conversation;
