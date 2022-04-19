import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { axiosInstance } from "../../../api";

interface IConversation {
  members: [];
}

export interface IPublicUser {
  username: string;
  password: string;
  picture: string;
  friends: Array<string>;
}

const Conversation: React.FC<{
  conversation: IConversation;
  userId: string;
}> = ({ conversation, userId }) => {
  useEffect(() => {
    const friendId = conversation.members.find(
      (memberId) => memberId !== userId
    );

    const getFriend = async () => {
      try {
        const resp = await axiosInstance.get("/users", {
          params: {
            specUserId: friendId,
          },
        });
        console.log(resp);
      } catch (error) {
        console.log(error);
      }
    };
    getFriend();
  }, []);

  return (
    <li className="person">
      <img
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg"
        alt="avatar"
      />
      <div className="about">
        <div className="name"></div>
        <div className="status">
          <FontAwesomeIcon className="online" icon={faCircle} />
          online
        </div>
      </div>
    </li>
  );
};

export default Conversation;
