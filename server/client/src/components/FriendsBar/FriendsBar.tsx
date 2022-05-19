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
              <li
                key={friend._id}
                onClick={() => openChat(friend._id)}
                className="friend"
              >
                <div className="name">{friend.username}</div>

                <FontAwesomeIcon
                  className={friend.online ? "online status" : "offline status"}
                  icon={faCircle}
                />

                <FontAwesomeIcon icon={faMessage} />
                {unreadMsgs[friend._id] ? (
                  <span className="unread">
                    {unreadMsgs[friend._id] > 10
                      ? "10+"
                      : unreadMsgs[friend._id]}
                  </span>
                ) : null}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default FriendsBar;
