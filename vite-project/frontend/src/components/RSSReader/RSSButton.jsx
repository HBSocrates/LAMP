import React from "react";

const RSSButton = ({ title, isActive, onClick }) => {
  return (
    <div
      className={`rss-button ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <h1 className="rss-title">{title}</h1>
    </div>
  );
};

export default RSSButton;