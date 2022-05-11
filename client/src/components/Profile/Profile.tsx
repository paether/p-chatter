import React, { useContext, useState } from "react";

import "./Profile.css";
import { AuthContext } from "../../context/AuthContext";

interface Props {
  logOut: () => void;
}

const Profile: React.FC<Props> = ({ logOut }) => {
  const { state } = useContext(AuthContext);

  return <div className="profile-container"></div>;
};

export default Profile;
