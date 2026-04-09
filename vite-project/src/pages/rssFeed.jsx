import React, { Suspense, useState } from "react";
import '../styles/App.css'
import RSSReader from "../components/RSSReader/RSSReader.jsx";
import RSSFetch from "../components/RSSReader/RSSFetch.jsx";

const RSSFeed = () => {
    const [currentUrl, setCurrentUrl] = useState("https://raw.githubusercontent.com/yottalogical/hello-internet-archive/master/HelloInternetArchive.rss");
    const [fetched, setFetched] = useState(false);
    const [rss_feeds, setRssFeeds] = useState([]);

    let resource = RSSFetch(currentUrl);

    // Parses our rss feed urls from the server response and updates the rss_feeds state variable
    // Returns the first value in array for immediate use
    const feed_parse = (message) => {
        console.log('Parsing message:', message);
        message = message.replace(/([<]rss_feeds )/g, '')
        message = message.replace(/\[/g, '')
        message = message.replace(/\>]/g, '')

        let rss_urls =  message.split('>,');

        console.log('Parsed RSS feed URLs:', rss_urls);
        setRssFeeds(rss_urls);

        return rss_urls[0];
    }

    const fetchRSSFeed = async () => {
        let message = '';
        setFetched(true);

        try {
            const response = await fetch('/api/get_rss', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                username: localStorage.getItem('username'),
            }),
            });

            const data = await response.json();
            message = data.message;
            console.log('Received response:', message);

            if (!response.ok) {
                throw new Error(data.message || 'RSS fetch failed');
            }

        } catch (error) {
            console.log('Error fetching feed:', error);
        } finally {
            if (message != 'None') {
                setCurrentUrl(feed_parse(message));
            } else {
                console.log('No feed URL received from server.');
            }
        }

    }
    
    const setRSSFeed = async (url) => {
        let message = '';

        try {
            const response = await fetch('/api/set_rss', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                username: localStorage.getItem('username'),
                rss_feed_url: url,
            }),
            });

            const data = await response.json();
            message = data.message;
            console.log('Received response:', message);

            if (!response.ok) {
                throw new Error(data.message || 'RSS feed URL update failed');
            }

        } catch (error) {
            console.log('Error fetching feed:', error);
        } finally {
            if (message === 'RSS feed URL updated') {
                console.log('RSS feed URL updated successfully');
            } else {
                console.log('No feed URL received from server.');
            }
        }

    }

    function setResource(url) {
        setCurrentUrl(url);
        setRSSFeed(url);
        console.log("Resource set to ", url);
    }

    return (
        <>
            {localStorage.getItem('loggedIn') === 'true' && !fetched ? fetchRSSFeed() : null}
            <div>
                <h1>Podcast RSS Feed</h1>
                <p>This website uses the rss2json api to fetch RSS podcast feeds.</p>
                <input name = "rssUrl" defaultValue = {currentUrl} /> <br></br>
                <button onClick={() => resource = setResource(document.getElementsByName("rssUrl")[0].value)}>Get RSS Feed</button>
                <Suspense fallback={<div>Loading...</div>}>
                    <RSSReader resource={resource} />
                </Suspense>
            </div>
        </>
    );
};

export default RSSFeed;