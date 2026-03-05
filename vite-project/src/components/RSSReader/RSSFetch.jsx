import React from "react";
import Axios from "axios";

const RSSFetch = (rssUrl) => {
    const proxyUrl = "https://api.rss2json.com/v1/api.json?rss_url=";
    let status = "pending";
    let result;
    
    console.log("fetching:", rssUrl);

    // Fetches RSS Feed content using a proxy to bypass CORS restrictions
    let suspender = Axios(`${proxyUrl}${encodeURIComponent(rssUrl)}`)
    .then(
        (r) => {
            status = "success";
            result = r.data;
        },
        (e) => {
            status = "error";
            result = e;
        }
    );
    

    return {
        read() {
            console.log(result);
            if (status === "pending") {
                throw suspender;
            } else if (status === "error") {
                throw result;
            } else if (status === "success") {
                return result;
            }
        }
    };
}

export default RSSFetch;