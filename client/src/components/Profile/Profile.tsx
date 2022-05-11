import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import "./Profile.css";
import { AuthContext } from "../../context/AuthContext";

interface Props {
  logOut: () => void;
}

const Profile: React.FC<Props> = ({ logOut }) => {
  const { state } = useContext(AuthContext);
  const dropwDownRef = useRef<HTMLDivElement>(null);

  const [showDropDown, setShowDropDown] = useState(false);

  useEffect(() => {
    console.log(showDropDown);

    if (showDropDown) {
      dropwDownRef.current!.classList.add("open");
      return;
    }
    dropwDownRef.current!.classList.remove("open");
  }, [showDropDown]);

  return (
    <div className="profile-container">
      <div
        onClick={() => setShowDropDown(!showDropDown)}
        className="profile-header "
      >
        {state.user!.picture ? (
          <img src={state.user!.picture} alt="" />
        ) : (
          <FontAwesomeIcon icon={faUser} />
        )}
        <span className="dropdown-caret"></span>
      </div>
      <div ref={dropwDownRef} className="profile-dropdown"></div>
    </div>
  );
};

export default Profile;
