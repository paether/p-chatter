import "./Loading.css";

export const Loading: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-ring main">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};
