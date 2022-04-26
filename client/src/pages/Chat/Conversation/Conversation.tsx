import React, {
  useEffect,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

import { axiosInstance } from "../../../api";

interface IConversationExtended {
  members: string[];
  _id: string;
  friend: IFriend;
}

const Conversation: React.FC<{
  conversations: IConversation[];
  userId: string;
  setCurrentConversation: Dispatch<SetStateAction<IConversation | null>>;
  setCurrentChatPartner: Dispatch<SetStateAction<IFriend | null>>;
  onlineUsers: ISocketUser[];
}> = ({
  conversations,
  userId,
  setCurrentConversation,
  setCurrentChatPartner,
  onlineUsers,
}) => {
  const [conversationsExtended, setConversationsExtended] = useState<
    IConversationExtended[]
  >([]);

  const getFriend = useCallback(async (friendId: string) => {
    try {
      const resp = await axiosInstance.get("/users/" + friendId);
      return resp.data;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getExtendedConversations = useCallback(async () => {
    console.log("getting extended");

    const extendedConv: IConversationExtended[] = await Promise.all(
      conversations.map(async (conversation: IConversation) => {
        const friendId = conversation.members.find(
          (memberId: string) => memberId !== userId
        );
        let friend = await getFriend(friendId!);

        if (onlineUsers) {
          const isOnline = onlineUsers.some((user) => {
            return user.userId === friend._id;
          });
          if (isOnline) {
            friend = { ...friend, online: true };
          }
        }
        return { ...conversation, friend };
      })
    );
    setConversationsExtended(extendedConv);
  }, [conversations, getFriend, onlineUsers, userId]);

  useEffect(() => {
    getExtendedConversations();
  }, [conversations, getExtendedConversations, onlineUsers]);

  return (
    <>
      {conversationsExtended
        //put online friends ahead in list
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
                setCurrentChatPartner(conversation.friend!);
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
