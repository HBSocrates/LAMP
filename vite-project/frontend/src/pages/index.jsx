import React from 'react';
import "../styles/App.css";
import { Link } from 'react-router-dom';
import mathLogo from "../assets/math.svg";
import reactLogo from "../assets/react.svg";
import matryoshkaLogo from "../assets/matryoshka-doll.svg";

const Home = () => {
  const projects = [
    {
      title: "Math Game App",
      description: "An interactive educational game designed to make learning mathematics engaging and fun through challenges and rewards.",
      link: "/mathApp",
      icon: mathLogo,
    },
    {
      title: "RSS Feed Reader",
      description: "A personalized feed aggregator that allows you to track the latest updates from your favorite sources in one place.",
      link: "/rssFeed",
      icon: reactLogo,
    },
    {
      title: "Russian Jiangi",
      description: "A specialized tool designed for learning and exploring the nuances of the Russian language and culture.",
      link: "/RussianJiangi",
      icon: matryoshkaLogo,
    },
  ];

  return (
    <div className="portfolio">
      <section className="hero">
        <div className="container">
          <img src={mathLogo} className="logo math" alt="Math logo" style={{ marginBottom: '2rem' }} />
          <h1>Andy Yang</h1>
          <p className="tagline">
            Building a bridge between curiosity and code. I'm a developer passionate about creating
            interactive experiences, educational tools, and exploring new technologies.
          </p>
          <a href="#projects" className="cta-button">View My Work</a>
        </div>
      </section>

      <section id="projects" className="projects-section">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card">
                <img src={project.icon} alt={project.title} className="project-icon" />
                <h3>{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <Link to={project.link} className="project-link">
                  View Project &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Andy Yang. Built with React & Vite.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
