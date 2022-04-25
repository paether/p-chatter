import { useState } from "react";
import "./FriendsBar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

const FriendsBar = ({ friends }: { friends: any }) => {
  return (
    <div className="friends-bar-container">
      <div className="friends-bar-header">Friends</div>
      <ul className="friends-list-container">
        {friends.map((friend: any) => {
          return (
            <li key={friend._id} className="friend">
              <div className="name">{friend.username}</div>
              <FontAwesomeIcon
                className={friend.online ? "online status" : "offline status"}
                icon={faCircle}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FriendsBar;
