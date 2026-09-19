import React from "react";
import "../../styles/RSSReader.css";
import secondsToDhms from "../UtilityFunctions/secondsToDHMS";

const RSSReader = ({resource}) => {
    if (!resource) {
        return (
            <div className="rss-empty-state">
                <div className="empty-icon">📡</div>
                <div className="empty-content">
                    <h3>No Feed Selected</h3>
                    <p>Enter an RSS feed URL above to start exploring podcasts!</p>
                </div>
            </div>
        );
    }

    const rssFeed = resource.read();
    if (rssFeed.status == "ok") {
        console.log('Fetched RSS feed:', rssFeed.feed.title);
    }

    if (rssFeed.status !== "ok") {
        return (
            <div className="rss-error-card">
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                    <h3>Feed Fetch Error</h3>
                    <p>{rssFeed.message}. If you encounter further issues, please check the <a href="https://rss2json.com" target="_blank">rss2json</a> service.</p>
                </div>
            </div>
        );
    }

    const feedItems = rssFeed.items.map((item) => ({
        author: rssFeed.feed.title,
        title: item.title,
        link: item.enclosure.link,
        duration: secondsToDhms(item.enclosure.duration),
        pubDate: item.pubDate,
    }));

    const totalDuration = rssFeed.items.reduce(
        (sum, item) => sum + Number(item.enclosure.duration),
        0
    );

    return (
        <div className="rss-reader">
            <div className="feed-header">
                <h1 className="feed-title">{feedItems[0]?.author || "Podcast Feed"}</h1>
                <div className="total-duration">
                    <span className="duration-label">Total duration:</span>
                    <span className="duration-value">{secondsToDhms(totalDuration)}</span>
                </div>
            </div>

            <div className="rss-items-grid">
                {feedItems.map((item, index) => (
                    <div className="rss-item-card" key={index}>
                        <div className="item-content">
                            <h2 className="item-title">
                                <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                            </h2>
                            <div className="item-meta">
                                <div className="meta-item">
                                    <span className="meta-label">Published:</span>
                                    <span className="meta-value">{item.pubDate}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Duration:</span>
                                    <span className="meta-value">{item.duration}</span>
                                </div>
                            </div>
                        </div>
                        <audio className="podcast-player"
                            src={item.link}
                            controls 
                            autoPlay={false}
                            loop={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RSSReader;
