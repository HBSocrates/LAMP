import React, { useState } from "react";
import RSSButton from "./RSSButton";
import "../../styles/RSSButtons.css";

const RSSMenu = ({titles, rss_feeds, name, setCurrentUrl}) => {
    const [currentlyActive, setCurrentlyActive] = useState(1);
    // Make sure we have the same number of titles and contents before we try to create the RSS Button
    // Then we map through all the titles and create an RSS button for each title, using the corresponding content from the contents array
    let RSSButtons = [];
    RSSButtons = titles.map((item, index) => {
        return (
        <RSSButton
            key={item}
            title={item.length > 20 ? item.substring(0, 40) + "..." : item}
            isActive={currentlyActive === index + 1}
            onClick={() => handleRSSButtonClick(index + 1)}
        />
        );
    });

    // Function to collapse/expand RSS Button by setting the currently active item to the index of the clicked item
    // or null if the clicked item is already active
    const handleRSSButtonClick = (newButtonActivation) => {
        setCurrentlyActive(
            newButtonActivation === currentlyActive ? null : newButtonActivation
        );
        console.log('Fetching feed for url:', rss_feeds[newButtonActivation - 1]);
        setCurrentUrl(rss_feeds[newButtonActivation - 1]);

        console.log(`currently active item: ${currentlyActive}`);
        console.log(
            `newly active item: ${newButtonActivation} previous active item ${newButtonActivation}`
        );
    };

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