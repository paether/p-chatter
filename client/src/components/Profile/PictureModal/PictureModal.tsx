import React from "react";
import ReactDom from "react-dom";
import classNames from "classnames";

import "./PictureModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PictureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const containerClass = classNames({
    "change-picture-container": true,
    active: isOpen,
  });

  return ReactDom.createPortal(
    <div className={containerClass}>
      <div className="overlay"></div>
      <div className="change-picture-modal">
        <button onClick={onClose}>close</button>
        adasdsa
      </div>
    </div>,
    document.getElementById("modal")!
  );
};
export default PictureModal;
