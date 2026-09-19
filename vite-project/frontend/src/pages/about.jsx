import React from "react";
import '../styles/App.css'
import AccordionMenu from "../components/AccordionMenu/AccordionMenu";

const About = () => {
    let title = ["General", "Education", "Contact Info"];
    let content = [" I am a computer programmer, specializing in full-stack development. I have experience in a variety of programming languages and frameworks, and I am always eager to learn new technologies. I am passionate about creating efficient and user-friendly applications that solve real-world problems.",
        "BS, Computer Science from University of California, Merced",
        `Email: ayang426@gmail.com`];

    return (
        <div>
            <AccordionMenu titles={title} contents={content} name="About Me" />
        </div>
    );
};

export default About;