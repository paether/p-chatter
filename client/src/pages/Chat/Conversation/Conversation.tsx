import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { axiosInstance } from "../../../api";

import Friend from "../Friend";

interface IConversation {
  members: string[];
  _id: string;
}

export interface IFriend {
  _id: string;
  username: string;
  picture?: string;
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
        const resp = await axiosInstance.get("/users/" + friendId);
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
    <Friend
      onFriendClick={handleClick}
      avatarSrc="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg"
      name={friend ? friend?.username : "anonym"}
    />
  );
};

export default Conversation;
