import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faRightFromBracket,
  faPersonBooth,
} from "@fortawesome/free-solid-svg-icons";

import "./Profile.css";
import PictureModal from "./PictureModal";
import { AuthContext } from "../../context/AuthContext";

interface Props {
  logOut: () => void;
}

const Profile: React.FC<Props> = ({ logOut }) => {
  const { state } = useContext(AuthContext);

  const dropwDownRef = useRef<HTMLUListElement>(null);
  const profileHeaderRef = useRef<HTMLDivElement>(null);

  const [showDropDown, setShowDropDown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClickOutside = (event: any) => {
    if (
      dropwDownRef.current &&
      !dropwDownRef.current.contains(event.target) &&
      !profileHeaderRef.current?.contains(event.target)
    ) {
      setShowDropDown(false);
    }
  };
  useEffect(() => {
    if (showDropDown) {
      document.addEventListener("click", (e) => handleClickOutside(e));
      dropwDownRef.current!.classList.add("open");
      return;
    }
    dropwDownRef.current!.classList.remove("open");
    return () => {
      document.removeEventListener("click", (e) => handleClickOutside(e));
    };
  }, [showDropDown]);

  return (
    <>
      <div className="profile-container">
        <div
          onClick={() => setShowDropDown(!showDropDown)}
          className="profile-header "
          ref={profileHeaderRef}
        >
          {state.user!.picture ? (
            <img src={state.user!.picture} alt="" />
          ) : (
            <FontAwesomeIcon icon={faUser} />
          )}
          <span className="dropdown-caret"></span>
        </div>
        <ul ref={dropwDownRef} className="profile-dropdown">
          <li onClick={logOut}>
            <div className="logout">Sign Out</div>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </li>
          <li
            onClick={() => {
              setShowModal(true);
              setShowDropDown(false);
            }}
          >
            <div className="change-picture">Change avatar</div>
            <FontAwesomeIcon icon={faPersonBooth} />
          </li>
        </ul>
        <PictureModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </>
  );
};

export default Profile;
