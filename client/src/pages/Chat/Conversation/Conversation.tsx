import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { axiosInstance } from "../../../api";

interface IConversation {
  members: string[];
  _id: string;
}

export interface IFriend {
  _id: string;
  username: string;
  picture: string;
}

interface IMessage {
  conversationId: string;
  senderId: string;
  text: string;
}

const Conversation: React.FC<{
  conversation: IConversation;
  userId: string;
  setCurrentConversation: Dispatch<SetStateAction<IConversation | null>>;
  setCurrentChatPartner: Dispatch<SetStateAction<IFriend | null>>;
}> = ({
  conversation,
  userId,
  setCurrentConversation,
  setCurrentChatPartner,
}) => {
  const [friend, setFriend] = useState<IFriend | null>(null);

  useEffect(() => {
    const friendId = conversation.members.find(
      (memberId) => memberId !== userId
    );

    const getFriend = async () => {
      try {
        // const resp = await axiosInstance.get("/users", {
        //   params: {
        //     specUserId: friendId,
        //   },
        // });
        const resp = await axiosInstance.get("/users/" + friendId, {});
        setFriend(resp.data);
      } catch (error) {
        console.log(error);
      }
    };
    getFriend();
  }, [conversation, userId]);

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
        <div className="name">{friend?.username}</div>
        <div className="status">
          <FontAwesomeIcon className="online" icon={faCircle} />
          online
        </div>
      </div>
    </li>
  );
};

export default Conversation;
