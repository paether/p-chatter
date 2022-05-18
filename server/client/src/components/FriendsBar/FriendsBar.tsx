import "./FriendsBar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faMessage } from "@fortawesome/free-solid-svg-icons";

interface IFriendsBarProps {
  unreadMsgs: IUnreadMsg;
  friends: IFriend[];
  openChat: (userId: string) => Promise<void>;
}

const FriendsBar: React.FC<IFriendsBarProps> = ({
  friends,
  openChat,
  unreadMsgs,
}) => {
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
          }, [] as IFriend[])
          .map((friend: IFriend) => {
            return (
              <li key={friend._id} className="friend">
                <div className="name">{friend.username}</div>
                {unreadMsgs[friend._id] ? (
                  <div className="name">{unreadMsgs[friend._id]}</div>
                ) : null}
                {friend.unread ? (
                  <div className="name">{friend.unread}</div>
                ) : null}

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
