import { useState } from 'react'
import '../styles/App.css'
import '../styles/MathGame.css'
import '../mathOperands.js'
import { operandsList } from '../mathOperands.js';

function MathGameApp() {
  let operandNum = 0;
  let highScore = localStorage.getItem('highScore') ? localStorage.getItem('highScore') : 0;

  const [randNum1, setRandNum1] = useState(0);
  const [randNum2, setRandNum2] = useState(0);
  const [randOperand, setRandOperand] = useState(operandsList[operandNum]);
  const [solution, setSolution] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [response, setResponse] = useState("");
  const [score, setScore] = useState(0);
  const [min, setMin] = useState(localStorage.getItem('min') ? localStorage.getItem('min') : -12);
  const [max, setMax] = useState(localStorage.getItem('max') ? localStorage.getItem('max') : 12);
  const [fetched, setFetched] = useState(false);

  const getHighScore = async () => {
    let message = '';
    setFetched(true);

      try {
        const response = await fetch('/api/get_score', {
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
        console.log('Received response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

      } catch (error) {
        console.log('Error fetching score:', error);
      } finally {
        highScore = message;
      }
    
  }

  const setHighScore = async () => {
    let message = '';

      try {
        const response = await fetch('/api/set_score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: localStorage.getItem('username'),
            high_score: highScore,
          }),
        });

        const data = await response.json();
        message = data.message;
        console.log('Received response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Setting high score failed');
        }

      } catch (error) {
        console.log('Error setting score:', error);
      } finally {
        console.log('Set score response message:', message);
      }
  }

  // Function to handle enter press on answer input, triggers solution validation
  const answerKeyPressed = (event) => {
    if (event.key === "Enter") {
      validateSolution();
    }
  }

  const [showSettings, setShowSettings] = useState(false);
  
  // Function to handle enter press on min input, updates min value in state and localStorage
  const minKeyPressed = (event) => {
    if (event.key === "Enter") {
      localStorage.setItem('min', event.target.value);
      setMin(event.target.value);
    }
  }

  // Function to handle enter press on max input, updates max value in state and localStorage
  const maxKeyPressed = (event) => {
    if (event.key === "Enter") {
      localStorage.setItem('max', event.target.value);
      setMax(event.target.value);
    }
  }

  // Function to handle submit button click for settings, updates min and max values in state and localStorage
  const submitSettingButton = (event) => {
    localStorage.setItem('min', document.getElementsByName('min')[0].value);
    localStorage.setItem('max', document.getElementsByName('max')[0].value);
    setMin(document.getElementsByName('min')[0].value);
    setMax(document.getElementsByName('max')[0].value);
  }

  // Function to handle reset button click, resets min and max values to defaults in state and localStorage
  const resetButton = (event) => {
    localStorage.setItem('min', -12);
    localStorage.setItem('max', 12);
    setMin(-12);
    setMax(12);
    document.getElementsByName('min')[0].value = -12;
    document.getElementsByName('max')[0].value = 12;
  }

  // Function to validate the user's answer against the correct solution, updates score and generates new problem if correct, resets score if incorrect
  function validateSolution() {
    if (answer == solution){
      //setRandNum1
      let tempRandNum1 = Math.floor(Number(Math.random() * (max - min)) + Number(min));
      setRandNum1(tempRandNum1);

      //setRandNum2
      let tempRandNum2 = Math.floor(Number(Math.random() * (max - min)) + Number(min));
      setRandNum2(tempRandNum2);

      //setRandOperand
      operandNum = Math.floor(Math.random() * (3 - 0));
      setRandOperand(operandsList[operandNum]);

      //setSolution
      switch (operandNum) {
        case 0:
                setSolution(tempRandNum1 + tempRandNum2);
                break
        case 1:
                setSolution(tempRandNum1 - tempRandNum2);
                break
        case 2:
                setSolution(tempRandNum1 * tempRandNum2);
                break
        case 3:
                setSolution(tempRandNum1 / tempRandNum2);
                break
        default:
                console.log("error");
      }
      setResponse("Correct!");

      document.getElementById("answer").value = "";

      setScore(score + 1);
      if (score + 1 > highScore) {
        highScore = score + 1;
        localStorage.setItem('highScore', highScore);
      }

    }
    else {
      setResponse("Incorrect, try again!");
      setHighScore();
      setScore(0);
    }
  }
  
  //&#x2699; unicode for gear/settings symbol, to be used in settings button
  return (
    <>
      {localStorage.getItem('loggedIn') == 'true'&&!fetched ? getHighScore() : null}
      <div>
        <h1> Maths!</h1>
        <h3>Get as many correct in a row as you can! <br></br>If you're logged in, your high score will be saved to your account</h3>
        <p>High Score: {highScore}<br></br>Score: {score}</p>
        <strong>{randNum1} {randOperand.name} {randNum2} =</strong>
        <label>
          <input className="answer" id="answer" type="number" onChange={e => setAnswer(e.target.value)} onKeyDown={answerKeyPressed}/>
          <button className="submit" onClick={() => {validateSolution()}}> Submit </button>
        </label>
        <p>{response}</p>
      </div>
      <div>
        <div id="settings-container">
          <div className="settings-header">
            <button
              className="settings-toggle"
              aria-expanded={showSettings}
              onClick={() => setShowSettings(s => !s)}
            >
              {showSettings ? '⚙️ Hide' : '⚙️ Settings'}
            </button>
          </div>
          <div className={`settings-panel ${showSettings ? 'open' : ''}`}>
            <label className="settings">
              Min:{"  "}
              <input className="min" name="min" type="number" defaultValue={localStorage.getItem('min') ? localStorage.getItem('min') : -12} onKeyDown={minKeyPressed}/> <br></br>
              Max:{"  "}
              <input className="max" name="max" type="number" defaultValue={localStorage.getItem('max') ? localStorage.getItem('max') : 12} onKeyDown={maxKeyPressed}/> <br></br>
              <button className="submit" onClick={() => {submitSettingButton()}}> Submit </button>
              <button className="reset" onClick={() => {resetButton()}}> Reset </button>
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default MathGameApp