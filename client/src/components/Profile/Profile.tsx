import React from "react";

import "./Profile.css";

interface Props {
  logOut: () => void;
}

const Profile: React.FC<Props> = ({ logOut }) => {
  return (
    <div className="friends-bar-header logout" onClick={logOut}>
      Sign out
    </div>
  );
};

export default Profile;
