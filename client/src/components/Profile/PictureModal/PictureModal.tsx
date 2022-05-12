import React, { useContext, useState } from "react";
import ReactDom from "react-dom";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX, faUser } from "@fortawesome/free-solid-svg-icons";

import "./PictureModal.css";
import { AuthContext } from "../../../context/AuthContext";

import { putAddProfilePicture } from "../../../api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PictureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileChange = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !state.user) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);
      await putAddProfilePicture(state.user?._id, formData);
    } catch (error) {
      console.log(error);
    }
  };

  const containerClass = classNames({
    "change-picture-container": true,
    active: isOpen,
  });

  return ReactDom.createPortal(
    <div className={containerClass}>
      <div onClick={onClose} className="overlay"></div>
      <div className="change-picture-modal">
        <FontAwesomeIcon onClick={onClose} icon={faX} />
        <div className="avatar">
          {state.user!.picture ? (
            <img src={state.user!.picture} alt="" />
          ) : (
            <FontAwesomeIcon icon={faUser} />
          )}
        </div>
        <div className="upload-avatar">
          <input type="file" onChange={onFileChange} />
          <button
            disabled={selectedFile ? false : true}
            onClick={handleSubmit}
            className="change-avatar"
          >
            Change Avatar
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal")!
  );
};
export default PictureModal;
