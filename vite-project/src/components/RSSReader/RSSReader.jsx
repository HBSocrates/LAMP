import React from "react";
import RSSFetch from "./rssFetch";
import "../../styles/RSSReader.css";
import parse from "html-react-parser";

const url = "https://raw.githubusercontent.com/yottalogical/hello-internet-archive/master/HelloInternetArchive.rss";
const resource = RSSFetch(url);

const RSSReader = ({rssUrl}) => {
    const rssFeed = resource.read();

    // Extracts relevant information from the RSS feed items and returns an array of objects
        function extractFeedItems(jsonItems) {
            const feedItems = [];

            for (let i = 0; i < jsonItems.length; i++) {
                const title = jsonItems[i].title;
                const link = jsonItems[i].enclosure.link;
				const date = new Date(null);
				date.setSeconds(jsonItems[i].enclosure.duration);
				const duration = date.toISOString().slice(11, 19);
                const pubDate = jsonItems[i].pubDate;
                const description = jsonItems[i].description;
                feedItems.push({ title, link, duration, pubDate, description });
            }

            return feedItems;
        }

    // Main function to fetch, parse, extract, and display RSS feed items
    const feedItems = extractFeedItems(rssFeed.items);
    return (
        <div className="rss-reader">
            {feedItems.map((item, index) => ( 
                <div className="rss-item" key={index}>
                    <h2><a href={item.link} target="_blank">{item.title}</a></h2>
                    <p><strong>Published:</strong> {item.pubDate}</p>
                    <p><strong>Duration:</strong> {item.duration}</p>
                    <p><strong>Description:</strong> {parse(item.description)}</p>
                </div>))}
        </div>
    );
}

export default RSSReader;