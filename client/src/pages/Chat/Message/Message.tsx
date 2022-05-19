import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Message: React.FC<{
  isRight: boolean;
  time: string;
  name: string;
  message: string;
}> = ({ isRight, time, name, message }) => {
  return (
    <>
      <div className="message-meta-data">
        <span className="message-meta-data-time">{time}</span>
        <span className="message-meta-data-name">{name}</span>
        <FontAwesomeIcon
          className={isRight ? "self" : "other"}
          icon={faCircle}
        />
      </div>

      <div
        className={isRight ? "message self-message" : "message other-message"}
      >
        {message}
      </div>
    </>
  );
};
