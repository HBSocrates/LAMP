import React, { Suspense, useState, useEffect, useCallback } from "react";
import '../styles/App.css'
import '../styles/RSSFeed.css'
import RSSReader from "../components/RSSReader/RSSReader.jsx";
import RSSFetch from "../components/RSSReader/RSSFetch.jsx";
import RSSMenu from "../components/RSSReader/RSSMenu.jsx";

const RSSFeed = () => {
    const [currentUrl, setCurrentUrl] = useState("");
    const [rssUrlInput, setRssUrlInput] = useState("");
    const [rss_feeds, setRssFeeds] = useState([]);

    // Parses the server response for RSS feed URLs
    const parseFeedMessage = useCallback((message) => {
        if (!message || message === 'None') return null;

        console.log('Parsing message:', message);
        const cleaned = message
            .replace(/([<]rss_feeds )/g, '')
            .replace(/\[/g, '')
            .replace(/\>]/g, '');

        const rss_urls = cleaned.split('>,').filter(url => url.trim() !== "");
        console.log('Parsed RSS feed URLs:', rss_urls);
        setRssFeeds(rss_urls);

        return rss_urls.length > 0 ? rss_urls[0] : null;
    }, []);

    const fetchUserRSSFeeds = useCallback(async () => {
        try {
            const response = await fetch('/api/get_rss', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username: localStorage.getItem('username') }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'RSS fetch failed');

            const firstUrl = parseFeedMessage(data.message);
            if (firstUrl) {
                setCurrentUrl(firstUrl);
                setRssUrlInput(firstUrl);
            }
        } catch (error) {
            console.error('Error fetching feeds:', error);
        }
    }, [parseFeedMessage]);

    useEffect(() => {
        if (localStorage.getItem('loggedIn') === 'true') {
            fetchUserRSSFeeds();
        }
    }, [fetchUserRSSFeeds]);

    const handleGetFeed = () => {
        setCurrentUrl(rssUrlInput);
    };

    const handleSetResource = (url) => {
        setCurrentUrl(url);
    };

    const resource = currentUrl ? RSSFetch(currentUrl) : null;

    return (
        <div className="rss-feed-wrapper">
            {localStorage.getItem('loggedIn') === 'true' && (
                <RSSMenu
                    titles={rss_feeds}
                    rss_feeds={rss_feeds}
                    name="Your RSS Feeds"
                    setCurrentUrl={setCurrentUrl}
                />
            )}

            <div className="rss-main-container">
                <div className="rss-control-card">
                    <h1>Podcast RSS Feed</h1>
                    <p>Explore podcast feeds using the rss2json API.</p>

                    <div className="rss-input-group">
                        <input
                            className="rss-url-input"
                            value={rssUrlInput}
                            onChange={(e) => setRssUrlInput(e.target.value)}
                            placeholder="Enter RSS Feed URL..."
                        />
                        <button className="submit-btn" onClick={handleGetFeed}>
                            Get RSS Feed
                        </button>
                    </div>
                </div>

                <Suspense fallback={<div className="loading-state">Loading feed...</div>}>
                    <RSSReader resource={resource} setResource={handleSetResource} />
                </Suspense>
            </div>
        </div>
    );
};

export default RSSFeed;
