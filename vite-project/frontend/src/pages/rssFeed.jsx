import React, { Suspense, useState, useEffect, useCallback } from "react";
import '../styles/App.css'
import '../styles/RSSFeed.css'
import RSSReader from "../components/RSSReader/RSSReader.jsx";
import RSSFetch from "../components/RSSReader/RSSFetch.jsx";
import RSSMenu from "../components/RSSReader/RSSMenu.jsx";
import Axios from "axios";

const rss2jsonProxyUrl = "https://api.rss2json.com/v1/api.json?rss_url=";
const rss2jsonApiKey = "tueaj0vocku3c88jt64ffztwnbz3e3vqshlyzwst";

const RSSFeed = () => {
    const [currentUrl, setCurrentUrl] = useState("");
    const [rssUrlInput, setRssUrlInput] = useState("");
    const [rssFeeds, setRssFeeds] = useState([]);

    // Stores the list of { url, title } pairs returned by the server
    const parseFeedMessage = useCallback((feeds) => {
        if (!feeds || feeds.length === 0) return null;

        console.log('Parsing feeds:', feeds);
        setRssFeeds(feeds);

        return feeds.length > 0 ? feeds[0].url : null;
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

            const firstUrl = parseFeedMessage(data.feeds || []);
            if (firstUrl) {
                setCurrentUrl(firstUrl);
                setRssUrlInput(firstUrl);
            }
        } catch (error) {
            console.error('Error fetching feeds:', error);
        }
    }, [parseFeedMessage]);

    const setUserRssFeed = useCallback(async () => {
        const rssInput = document.getElementById("rss-url-input")
        const rssUrl = rssInput ? rssInput.value : '';
        if (!rssUrl) return;
        try {
            let rssTitle = rssUrl;
            try {
                const titleResponse = await Axios.get(
                    `${rss2jsonProxyUrl}${encodeURIComponent(rssUrl)}&api_key=${rss2jsonApiKey}&count=1`
                );
                if (titleResponse.data?.feed?.title) {
                    rssTitle = titleResponse.data.feed.title;
                }
            } catch (titleError) {
                console.error('Error fetching feed title:', titleError);
            }

            const response = await fetch('/api/set_rss', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: localStorage.getItem('username'),
                    rss_feed_url: rssUrl,
                    rss_title: rssTitle,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'RSS fetch failed');
        } catch (error) {
            console.error('Error fetching feeds:', error);
        }
    }, []);

    useEffect(() => {
        if (localStorage.getItem('loggedIn') === 'true') {
            fetchUserRSSFeeds();
        }
    }, [fetchUserRSSFeeds]);

    const handleGetFeed = () => {
        setCurrentUrl(rssUrlInput);
    };

    const resource = currentUrl ? RSSFetch(currentUrl) : null;

    return (
        <div className="rss-feed-wrapper">
            {localStorage.getItem('loggedIn') === 'true' && (
                <RSSMenu
                    titles={rssFeeds.map((feed) => feed.title)}
                    rss_feeds={rssFeeds.map((feed) => feed.url)}
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
                            id="rss-url-input"
                            onChange={
                                (e) => {setRssUrlInput(e.target.value)}
                            }
                            placeholder="Enter RSS Feed URL..."
                        />
                        <button className="submit-btn" onClick={handleGetFeed}>
                            Get RSS Feed
                        </button>
                        <button className="submit-btn" onClick={setUserRssFeed}>
                            Save RSS Feed
                        </button>
                    </div>
                </div>

                <Suspense fallback={<div className="loading-state">Loading feed...</div>}>
                    <RSSReader key={currentUrl} resource={resource}/>
                </Suspense>
            </div>
        </div>
    );
};

export default RSSFeed;
