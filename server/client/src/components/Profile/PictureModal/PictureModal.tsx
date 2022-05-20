import React, { useContext, useEffect, useState } from "react";

import ReactDom from "react-dom";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX, faUser } from "@fortawesome/free-solid-svg-icons";

import "./PictureModal.css";
import { AuthContext } from "../../../context/AuthContext";
import { Loading } from "../../Loading";
import { putAddProfilePicture } from "../../../api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PictureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPictureUploading, setIsPictureUploading] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const element = e.target as HTMLInputElement;
    if (element.files?.length) {
      setSelectedFile(element.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !state.user) return;

    try {
      setIsPictureUploading(true);
      const formData = new FormData();
      formData.append("profileImage", selectedFile);
      const picture = await putAddProfilePicture(state.user?._id, formData);
      dispatch({ type: "UPDATE_USER", payload: { ...state.user, picture } });
      setIsPictureUploading(false);
    } catch (error: any) {
      setIsPictureUploading(false);

      if (error.statusText.includes("File too large")) {
        alert("Maximum file size for avatar is 2MB!");
        return;
      }
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
          {!isPictureUploading ? (
            state.user!.picture ? (
              <img src={state.user!.picture} alt="" />
            ) : (
              <FontAwesomeIcon icon={faUser} />
            )
          ) : (
            <Loading />
          )}
        </div>
        <div className="upload-avatar">
          <label htmlFor="change-avatar-input">Choose a file...</label>
          <input
            accept="image/png, image/jpg, image/jpeg"
            id="change-avatar-input"
            type="file"
            onChange={onFileChange}
          />
          {selectedFile ? (
            <div className="selected-file">{selectedFile.name}</div>
          ) : null}

          <button
            disabled={selectedFile ? false : true}
            onClick={handleSubmit}
            className="change-avatar-btn"
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
