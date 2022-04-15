import "./Loading.css";

export const Loading: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-ring main">
        {/* these empty divs are required for the loading animation */}
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};
