import "./FriendsBar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faMessage } from "@fortawesome/free-solid-svg-icons";

interface IOnlineFriend extends IFriend {
  online?: boolean;
}

interface IFriendsBarProps {
  friends: IOnlineFriend[];
  openChat: (userId: string) => Promise<void>;
}

const FriendsBar: React.FC<IFriendsBarProps> = ({ friends, openChat }) => {
  return (
    <div className="friends-bar-container">
      <div className="friends-bar-header">Friends</div>
      <ul className="friends-list-container">
        {friends
          .reduce((acc, friend) => {
            if (friend.online) {
              return [friend, ...acc];
            }
            return [...acc, friend];
          }, [] as IOnlineFriend[])
          .map((friend: any) => {
            return (
              <li key={friend._id} className="friend">
                <div className="name">{friend.username}</div>
                <FontAwesomeIcon
                  className={friend.online ? "online status" : "offline status"}
                  icon={faCircle}
                />

                <FontAwesomeIcon
                  onClick={() => openChat(friend._id)}
                  icon={faMessage}
                />
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default FriendsBar;
