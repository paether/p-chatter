import "./FriendsBar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faMessage } from "@fortawesome/free-solid-svg-icons";

interface IFriendsBarProps {
  friends: IFriend[];
  openChat: (userId: string) => Promise<void>;
  logOut: () => void;
}

const FriendsBar: React.FC<IFriendsBarProps> = ({
  friends,
  openChat,
  logOut,
}) => {
  return (
    <div className="friends-bar-container">
      <div className="friends-bar-header logout" onClick={logOut}>
        Sign out
      </div>
      <div className="friends-bar-header">Friends</div>
      <ul className="friends-list-container">
        {friends
          .reduce((acc, friend) => {
            if (friend.online) {
              return [friend, ...acc];
            }
            return [...acc, friend];
          }, [] as IFriend[])
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
