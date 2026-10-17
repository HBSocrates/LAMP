import React, { useState } from 'react';
import '../styles/App.css';
import '../styles/YouTubeGuide.css';

const YouTubeGuide = () => {
    const [url, setUrl] = useState('');
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateGuide = async () => {
        if (!url.trim()) {
            setError('Please enter a YouTube URL.');
            return;
        }

        setLoading(true);
        setError('');
        setGuide(null);

        try {
            const response = await fetch('/api/youtube/guide', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ url }),
            });

            const raw = await response.text();
            let data = {};
            if (raw) {
                try {
                    data = JSON.parse(raw);
                } catch {
                    throw new Error(
                        response.ok
                            ? 'Received an unexpected response from the server.'
                            : `Server error (${response.status}). Make sure the Flask API is running and its dependencies are installed.`,
                    );
                }
            }

            if (!response.ok) {
                throw new Error(data.message || `Request failed (${response.status}).`);
            }
            setGuide(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            generateGuide();
        }
    };

    return (
        <div className="yt-guide-wrapper">
            <div className="yt-guide-container">
                <div className="yt-guide-card">
                    <h1>YouTube Tutorial Guide</h1>
                    <p>
                        Paste a YouTube tutorial URL to pull its transcript and turn it into a
                        step-by-step guide you can follow along with.
                    </p>
                    <div className="yt-guide-input-group">
                        <input
                            className="yt-guide-input"
                            type="text"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <button
                            className="yt-guide-submit"
                            onClick={generateGuide}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Guide'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="yt-guide-error">
                        <h3>Could not generate a guide</h3>
                        <p>{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="yt-guide-loading">
                        Fetching the transcript and building your guide...
                    </div>
                )}

                {guide && (
                    <div className="yt-guide-results">
                        <div className="yt-guide-header">
                            <h2>{guide.title || 'Tutorial Guide'}</h2>
                            <a
                                className="yt-guide-link"
                                href={guide.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Watch on YouTube &rarr;
                            </a>
                        </div>

                        {guide.steps && guide.steps.length > 0 ? (
                            <div className="yt-steps">
                                {guide.steps.map((step) => (
                                    <div className="yt-step" key={step.step}>
                                        <div className="yt-step-number">{step.step}</div>
                                        <div className="yt-step-body">
                                            <span className="yt-step-timestamp">
                                                {step.timestamp}
                                            </span>
                                            <p className="yt-step-text">{step.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="yt-guide-error">
                                <h3>No steps found</h3>
                                <p>The transcript could not be split into steps.</p>
                            </div>
                        )}

                        <details className="yt-transcript">
                            <summary>View full transcript</summary>
                            <pre>{guide.transcript}</pre>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YouTubeGuide;
