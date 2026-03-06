import React, { Suspense, useState } from "react";
import '../styles/App.css'
import RSSReader from "../components/RSSReader/RSSReader";
import RSSFetch from "../components/RSSReader/rssFetch";

const RSSFeed = () => {
    const [currentUrl, setCurrentUrl] = useState("https://raw.githubusercontent.com/yottalogical/hello-internet-archive/master/HelloInternetArchive.rss");

    let resource = RSSFetch(currentUrl);

    function setResource(url) {
        setCurrentUrl(url);
        console.log("Resource set to ", url);
    }

    return (
        <div>
            <h1>RSS Feed</h1>
            <input name = "rssUrl" /> <br></br>
            <button onClick={() => resource = setResource(document.getElementsByName("rssUrl")[0].value)}>Get RSS Feed</button>
            <Suspense fallback={<div>Loading...</div>}>
                <RSSReader resource={resource} />
            </Suspense>
        </div>
    );
};

export default RSSFeed;