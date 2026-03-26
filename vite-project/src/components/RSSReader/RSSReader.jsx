import React, { Suspense } from "react";
import "../../styles/RSSReader.css";
import secondsToDhms from "../UtilityFunctions/secondsToDHMS";
import parse from "html-react-parser";

const RSSReader = ({resource}) => {
    let totalDuration = 0;

    let rssFeed = resource.read();

    if (rssFeed.status !== "ok") {
        return <div>Error fetching RSS feed: {rssFeed.message}.  If you encounter further issues, please check the <a href="https://rss2json.com" target="_blank">rss2json</a> service.</div>;
    }

    // Extracts relevant information from the RSS feed items and returns an array of objects
    function extractFeedItems(jsonItems) {
        const feedItems = [];
        
        console.log("Extracting ", jsonItems.length, "items from RSS feed");

        for (let i = 0; i < jsonItems.length; i++) {
            const title = jsonItems[i].title;
            const link = jsonItems[i].enclosure.link;
            const date = new Date(null);
            const duration = secondsToDhms(jsonItems[i].enclosure.duration);
            totalDuration += jsonItems[i].enclosure.duration;
            const pubDate = jsonItems[i].pubDate;
            //const description = jsonItems[i].description;
            feedItems.push({ title, link, duration, pubDate/*, description*/ });
        }

        return feedItems;
    }

    // Main function to fetch, parse, extract, and display RSS feed items
    const feedItems = extractFeedItems(rssFeed.items);
    return (
        <div className="rss-reader">
            <div>Total duration of this podcast is {secondsToDhms(totalDuration)}</div>
            {feedItems.map((item, index) => ( 
                <div className="rss-item" key={index}>
                    <h2><a href={item.link} target="_blank">{item.title}</a></h2>
                    <p><strong>Published:</strong> {item.pubDate}</p>
                    <p><strong>Duration:</strong> {item.duration}</p>
                    {/* <p><strong>Description:</strong></p> {parse(item.description)} */}
                </div>))}
        </div>
    );
}

export default RSSReader;