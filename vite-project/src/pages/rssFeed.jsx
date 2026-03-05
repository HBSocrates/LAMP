import React, { Suspense } from "react";
import '../styles/App.css'
import RSSReader from "../components/RSSReader/RSSReader";

const RSSFeed = () => {
    let title = ["General", "Resume", "Education", "Contact Info"];
    let content = [" I am a computer programmer, specializing in full-stack development. I have experience in a variety of programming languages and frameworks, and I am always eager to learn new technologies. I am passionate about creating efficient and user-friendly applications that solve real-world problems.",
        "coming soon",
        "coming soon",
        `Email: ayang426@gmail.com
        Phone: 559-709-2023`];

    return (
        <div>
            <h1>RSS Feed</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <RSSReader rssUrl="https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/e5f91208-cc7e-4726-a312-ae280140ad11/d64f756d-6d5e-4fae-b24f-ae280140ad36/podcast.rss" />
            </Suspense>
        </div>
    );
};

export default RSSFeed;