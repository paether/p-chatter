import React, {
  useEffect,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faUser } from "@fortawesome/free-solid-svg-icons";

import "./Conversation.css";

interface IConversationExtended {
  members: string[];
  _id: string;
  friend: IFriend | undefined;
}

const Conversation: React.FC<{
  conversations: IConversation[];
  currentConversation: IConversation | null;
  userId: string;
  setCurrentConversation: Dispatch<SetStateAction<IConversation | null>>;
  setCurrentChatPartner: Dispatch<SetStateAction<IFriend | null>>;
  onlineFriends: IFriend[];
}> = ({
  conversations,
  currentConversation,
  userId,
  setCurrentConversation,
  setCurrentChatPartner,
  onlineFriends,
}) => {
  const [conversationsExtended, setConversationsExtended] = useState<
    IConversationExtended[]
  >([]);

  const getExtendedConversations = useCallback(() => {
    const extendedConv: IConversationExtended[] = conversations.map(
      (conversation: IConversation) => {
        const friendId = conversation.members.find(
          (memberId: string) => memberId !== userId
        );

        const friend = onlineFriends.find((friend) => {
          return friendId! === friend._id;
        });

        return { ...conversation, friend };
      }
    );
    setConversationsExtended(extendedConv);
  }, [conversations, onlineFriends, userId]);

  useEffect(() => {
    getExtendedConversations();
  }, [conversations, getExtendedConversations]);

  return (
    <>
      {conversationsExtended
        //put online friends ahead in list
        .reduce((acc, conversation) => {
          if (conversation.friend?.online) {
            return [conversation, ...acc];
          }
          return [...acc, conversation];
        }, [] as IConversationExtended[])
        .map((conversation) => {
          return (
            <li
              key={conversation._id}
              className={
                currentConversation?._id === conversation._id
                  ? "person active"
                  : "person"
              }
              onClick={() => {
                setCurrentConversation(conversation);
                setCurrentChatPartner(conversation.friend!);
              }}
            >
              <div className="profile-picture">
                {conversation.friend?.picture ? (
                  <img src={conversation.friend.picture} alt="" />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
              </div>
              <div className="about">
                <div className="name">{conversation.friend?.username}</div>
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
