import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

interface IFriend {
  onFriendClick: any;
  name: string;
  avatarSrc: string;
}

const Friend = ({ onFriendClick, name, avatarSrc }: IFriend) => {
  return (
    <li className="person" onClick={onFriendClick}>
      <img
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg"
        alt="avatar"
      />
      <div className="about">
        <div className="name">{name}</div>
        <div className="status">
          <FontAwesomeIcon className="online" icon={faCircle} />
          online
        </div>
      </div>
    </li>
  );
};

export default Friend;
