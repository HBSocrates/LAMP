import React, { Suspense, useState, useEffect, useCallback } from "react";
import '../styles/App.css'
import '../styles/RSSFeed.css'
import RSSReader from "../components/RSSReader/RSSReader.jsx";
import RSSFetch from "../components/RSSReader/RSSFetch.jsx";
import RSSMenu from "../components/RSSReader/RSSMenu.jsx";

const RSSFeed = () => {
    const [currentUrl, setCurrentUrl] = useState("https://raw.githubusercontent.com/yottalogical/hello-internet-archive/master/HelloInternetArchive.rss");
    const [rssUrlInput, setRssUrlInput] = useState(currentUrl);
    const [fetched, setFetched] = useState(false);
    const [rss_feeds, setRssFeeds] = useState([]);

    // Parses the server response for RSS feed URLs
    const feed_parse = useCallback((message) => {
        console.log('Parsing message:', message);
        const cleaned = message
            .replace(/([<]rss_feeds )/g, '')
            .replace(/\[/g, '')
            .replace(/\>]/g, '');

        const rss_urls = cleaned.split('>,');
        console.log('Parsed RSS feed URLs:', rss_urls);
        setRssFeeds(rss_urls);

        return rss_urls[0];
    }, []);

    const fetchRSSFeed = useCallback(async () => {
        setFetched(true);
        try {
            const response = await fetch('/api/get_rss', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username: localStorage.getItem('username') }),
            });

            const data = await response.json();
            const message = data.message;

            if (!response.ok) {
                throw new Error(data.message || 'RSS fetch failed');
            }

            if (message && message !== 'None') {
                const firstUrl = feed_parse(message);
                setCurrentUrl(firstUrl);
            } else {
                console.log('No feed URL received from server.');
            }
        } catch (error) {
            console.error('Error fetching feed:', error);
        }
    }, [feed_parse]);

    useEffect(() => {
        if (localStorage.getItem('loggedIn') === 'true') {
            fetchRSSFeed();
        }
    }, [fetchRSSFeed]);

    const setRSSFeedOnServer = async (url, authorName) => {
        try {
            const response = await fetch('/api/set_rss', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: localStorage.getItem('username'),
                    rss_feed_url: url,
                    rss_author: authorName,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'RSS feed update failed');
            console.log('RSS feed URL updated successfully');
        } catch (error) {
            console.error('Error updating feed:', error);
        }
    };

    const handleGetFeed = () => {
        setCurrentUrl(rssUrlInput);
    };

    const handleSetResource = (url) => {
        setCurrentUrl(url);
        // We'll extract the pod name from the RSSReader's title if possible,
        // but since the setRSSFeed logic relied on a DOM element from RSSReader,
        // we'll handle the server update when the user explicitly wants to save.
        // For now, we maintain the ability to trigger it.
    };

    let RssSelector = null;
    if (localStorage.getItem('loggedIn') === 'true') {
        RssSelector = <RSSMenu titles={rss_feeds} rss_feeds={rss_feeds} name={"Your RSS Feeds"} setCurrentUrl={setCurrentUrl} />;
    }

    const resource = RSSFetch(currentUrl);

    return (
        <div className="rss-feed-wrapper">
            {RssSelector}
            <div className="rss-main-container">
                <div className="rss-control-card">
                    <h1>Podcast RSS Feed</h1>
                    <p>Explore podcast feeds using the rss2json API.</p>

                    <div className="rss-input-group">
                        <input
                            className="rss-url-input"
                            value={rssUrlInput}
                            onChange={(e) => setRssUrlInput(e.target.value)}
                        />
                        <button className="submit-btn" onClick={handleGetFeed}>Get RSS Feed</button>
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
