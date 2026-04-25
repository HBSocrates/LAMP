import { useState, useEffect, useRef } from 'react'
import '../styles/App.css'
import '../styles/MathGame.css'
import { operandsList } from '../mathOperands.js';

function MathGameApp() {
  const inputRef = useRef(null);

  const [randNum1, setRandNum1] = useState(0);
  const [randNum2, setRandNum2] = useState(0);
  const [randOperand, setRandOperand] = useState(operandsList[0]);
  const [solution, setSolution] = useState(0);
  const [answer, setAnswer] = useState("");
  const [response, setResponse] = useState("");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(localStorage.getItem('highScore') || 0);
  const [min, setMin] = useState(localStorage.getItem('min') || -12);
  const [max, setMax] = useState(localStorage.getItem('max') || 12);
  const [showSettings, setShowSettings] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  const generateProblem = () => {
    const n1 = Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min);
    const n2 = Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min);
    const opIdx = Math.floor(Math.random() * operandsList.length);
    const op = operandsList[opIdx];

    let sol = 0;
    switch (op.name) {
      case '+': sol = n1 + n2; break;
      case '-': sol = n1 - n2; break;
      case '*': sol = n1 * n2; break;
      case '/': sol = Math.floor(n1 / n2); break; // simplified for game
      default: sol = 0;
    }

    setRandNum1(n1);
    setRandNum2(n2);
    setRandOperand(op);
    setSolution(sol);
    setAnswer("");
  };

  useEffect(() => {
    generateProblem();
    if (localStorage.getItem('loggedIn') === 'true') {
      fetchHighScore();
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [randNum1, randNum2, randOperand]);

  const fetchHighScore = async () => {
    try {
      const response = await fetch('/api/get_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: localStorage.getItem('username') }),
      });
      const data = await response.json();
      if (data.message) setHighScore(data.message);
    } catch (error) {
      console.error('Error fetching score:', error);
    }
  };

  const updateHighScoreOnServer = async (newHigh) => {
    try {
      await fetch('/api/set_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: localStorage.getItem('username'),
          high_score: newHigh
        }),
      });
    } catch (error) {
      console.error('Error setting score:', error);
    }
  };

  const validateSolution = () => {
    if (parseInt(answer) === solution) {
      const newScore = score + 1;
      setScore(newScore);
      setResponse("Correct!");
      setAnimationClass("correct-anim");

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('highScore', newScore);
        if (localStorage.getItem('loggedIn') === 'true') {
          updateHighScoreOnServer(newScore);
        }
      }

      setTimeout(() => {
        setAnimationClass("");
        generateProblem();
      }, 600);
    } else {
      setResponse("Incorrect, try again!");
      setAnimationClass("incorrect-anim");
      setScore(0);
      if (localStorage.getItem('loggedIn') === 'true') {
        updateHighScoreOnServer(highScore);
      }
      setTimeout(() => setAnimationClass(""), 600);
    }
  };

  const handleSettingSubmit = () => {
    const minVal = document.getElementsByName('min')[0].value;
    const maxVal = document.getElementsByName('max')[0].value;
    localStorage.setItem('min', minVal);
    localStorage.setItem('max', maxVal);
    setMin(minVal);
    setMax(maxVal);
    setShowSettings(false);
  };

  const handleResetSettings = () => {
    localStorage.setItem('min', -12);
    localStorage.setItem('max', 12);
    setMin(-12);
    setMax(12);
    document.getElementsByName('min')[0].value = -12;
    document.getElementsByName('max')[0].value = 12;
  };

  return (
    <div className="math-game-wrapper">
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Score</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">High Score</span>
          <span className="stat-value">{highScore}</span>
        </div>
      </div>

      <div className={`game-card ${animationClass}`}>
        <h1 className="game-title">Maths!</h1>
        <p className="game-subtitle">Get as many correct in a row as you can!</p>

        <div className="problem-container">
          <div className="problem-display">
            {randNum1} <span className="operator">{randOperand.name}</span> {randNum2} =
          </div>

          <div className="answer-row">
            <input
              ref={inputRef}
              className="answer-input"
              type="number"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === "Enter" && validateSolution()}
            />
            <button className="submit-btn" onClick={validateSolution}>Submit</button>
          </div>

          <div className={`response-msg ${response === "Correct!" ? "success" : "error"}`}>
            {response}
          </div>
        </div>
      </div>

      <div id="settings-container">
        <div className="settings-header">
          <button
            className="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? '⚙️ Hide' : '⚙️ Settings'}
          </button>
        </div>
        <div className={`settings-panel ${showSettings ? 'open' : ''}`}>
          <div className="settings-content">
            <div className="setting-group">
              <label>Min Value</label>
              <input name="min" type="number" defaultValue={min} />
            </div>
            <div className="setting-group">
              <label>Max Value</label>
              <input name="max" type="number" defaultValue={max} />
            </div>
            <div className="settings-actions">
              <button className="submit-btn small" onClick={handleSettingSubmit}>Apply</button>
              <button className="reset-btn small" onClick={handleResetSettings}>Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MathGameApp