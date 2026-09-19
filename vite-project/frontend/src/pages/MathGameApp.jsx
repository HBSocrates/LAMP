import { useState, useEffect, useRef, useCallback } from 'react'
import '../styles/App.css'
import '../styles/MathGame.css'
import { operandsList } from '../mathOperands.js';

function createProblem(minVal, maxVal) {
  const min = Number(minVal);
  const max = Number(maxVal);
  const range = max - min + 1;

  const n1 = Math.floor(Math.random() * range) + min;
  const n2 = Math.floor(Math.random() * range) + min;
  const op = operandsList[Math.floor(Math.random() * operandsList.length)];

  let sol = 0;
  switch (op.name) {
    case '+': sol = n1 + n2; break;
    case '-': sol = n1 - n2; break;
    case '*': sol = n1 * n2; break;
    case '/': {
      // Ensure no division by zero and allow decimals
      const divisor = n2 === 0 ? 1 : n2;
      sol = n1 / divisor;
      break;
    }
    default: sol = 0;
  }

  // Round solution to 3 decimal places
  sol = Math.round(sol * 1000) / 1000;

  return { n1, n2, op, sol };
}

function MathGameApp() {
  const inputRef = useRef(null);

  const [problem, setProblem] = useState(() =>
    createProblem(
      localStorage.getItem('min') || -12,
      localStorage.getItem('max') || 12
    )
  );
  const [answer, setAnswer] = useState("");
  const [response, setResponse] = useState("");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(localStorage.getItem('highScore') || 0);
  const [min, setMin] = useState(localStorage.getItem('min') || -12);
  const [max, setMax] = useState(localStorage.getItem('max') || 12);
  const [showSettings, setShowSettings] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  const generateProblem = useCallback(() => {
    setProblem(createProblem(min, max));
    setAnswer("");
  }, [min, max]);

  useEffect(() => {
    if (localStorage.getItem('loggedIn') !== 'true') return
    let cancelled = false
    fetch('/api/get_score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: localStorage.getItem('username') }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.message) setHighScore(data.message)
      })
      .catch((error) => console.error('Error fetching score:', error))
    return () => {
      cancelled = true
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [problem]);

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
    if (parseFloat(answer) === problem.sol) {
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
    const minInput = document.getElementsByName('min')[0];
    const maxInput = document.getElementsByName('max')[0];

    if (!minInput || !maxInput) return;

    const minVal = minInput.value;
    const maxVal = maxInput.value;

    localStorage.setItem('min', minVal);
    localStorage.setItem('max', maxVal);
    setMin(minVal);
    setMax(maxVal);
    setProblem(createProblem(minVal, maxVal));
    setAnswer("");
    setShowSettings(false);
  };

  const handleResetSettings = () => {
    localStorage.setItem('min', -12);
    localStorage.setItem('max', 12);
    setMin(-12);
    setMax(12);
    setProblem(createProblem(-12, 12));
    setAnswer("");
    const minInput = document.getElementsByName('min')[0];
    const maxInput = document.getElementsByName('max')[0];
    if (minInput) minInput.value = -12;
    if (maxInput) maxInput.value = 12;
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
        <p className="game-subtitle">Get as many correct in a row as you can!<br />(Decimal answers are rounded to 3 decimal points)</p>

        <div className="problem-container">
          <div className="problem-display">
            {problem.n1} <span className="operator">{problem.op.name}</span> {problem.n2} =
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