import React from "react";
import Axios from "axios";

const RSSFetch = (rssUrl) => {
    const proxyUrl = "https://api.rss2json.com/v1/api.json?rss_url=";
    const api_key = "tueaj0vocku3c88jt64ffztwnbz3e3vqshlyzwst"; // API key for rss2json service
    let status = "pending";
    let result;
    let suspender;

    // Fetches RSS Feed content using a proxy to bypass CORS restrictions
    suspender = Axios.get(`${proxyUrl}${encodeURIComponent(rssUrl)}&api_key=${api_key}&count=20`)
    .catch(function (error) {
        if (error.response) {
            status = "error";
            result = error.response.data;
        }
    })
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