import React, {
  useEffect,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faUser } from "@fortawesome/free-solid-svg-icons";

import { axiosInstance, getFriendCall } from "../../../api";
import "./Conversation.css";

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

  const getExtendedConversations = useCallback(async () => {
    const extendedConv: IConversationExtended[] = await Promise.all(
      conversations.map(async (conversation: IConversation) => {
        const friendId = conversation.members.find(
          (memberId: string) => memberId !== userId
        );
        let friend = await getFriendCall(friendId!);

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
  }, [conversations, onlineUsers, userId]);

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
              <div className="profile-picture">
                {conversation.friend.picture ? (
                  <img src={conversation.friend.picture} alt="" />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
              </div>
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
