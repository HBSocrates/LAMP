import React, { useState } from "react";
import RSSButton from "./RSSButton";
import "../../styles/RSSButtons.css";

const RSSMenu = ({titles, rss_feeds, name, setCurrentUrl}) => {
    const [currentlyActive, setCurrentlyActive] = useState(1);

    const handleRSSButtonClick = (newButtonActivation) => {
        setCurrentlyActive(
            newButtonActivation === currentlyActive ? null : newButtonActivation
        );
        const selectedUrl = rss_feeds[newButtonActivation - 1];
        console.log('Fetching feed for url:', selectedUrl);
        setCurrentUrl(selectedUrl);
    };

    const RSSButtons = titles.map((item, index) => {
        return (
        <RSSButton
            key={item}
            title={item.length > 40 ? item.substring(0, 40) + "..." : item}
            isActive={currentlyActive === index + 1}
            onClick={() => handleRSSButtonClick(index + 1)}
        />
        );
    });

    return (
        <div className="rss-menu">
            <h2 className="title">{name}</h2>
            <div className="rss-items">
            {RSSButtons}
            </div>
        </div>
    );
};

export default RSSMenu;
