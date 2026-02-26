import { useState } from 'react'
import '../styles/App.css'
import '../mathOperands.js'
import AccordionMenu from '../components/AccordianMenu/AccordianMenu.jsx';
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

  const answerKeyPressed = (event) => {
    if (event.key === "Enter") {
      validateSolution();
    }
  }
  
  const minKeyPressed = (event) => {
    if (event.key === "Enter") {
      localStorage.setItem('min', event.target.value);
      setMin(event.target.value);
    }
  }

  const maxKeyPressed = (event) => {
    if (event.key === "Enter") {
      localStorage.setItem('max', event.target.value);
      setMax(event.target.value);
    }
  }

  function validateSolution() {
    if (answer == solution){
      //setRandNum1
      let tempRandNum1 = Math.floor(Math.random() * (max - min) + min);
      setRandNum1(tempRandNum1);

      //setRandNum2
      let tempRandNum2 = Math.floor(Math.random() * (max - min) + min);
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

      setScore(score + 1);
      if (score + 1 > highScore) {
        highScore = score + 1;
        localStorage.setItem('highScore', highScore);
      }

    }
    else {
      setResponse("Incorrect, try again!");
      setScore(0);
    }
  }

  return (
    <>
      <div>
        <h1> Maths! </h1>
        <p>Score: {score} High Score: {highScore}</p>
        <p>{randNum1} {randOperand.name} {randNum2} =</p>
        <label>
          <input name="answer" type="number" defaultValue="0" onChange={e => setAnswer(e.target.value)} onKeyDown={answerKeyPressed}/>
          <button name="submit" onClick={() => {validateSolution()}}> Submit </button>
        </label>
        <p>{response}</p>
      </div>
      <div>
          <h2>Settings</h2>
          <label>
            Min:
            <input name="min" type="number" defaultValue={localStorage.getItem('min') ? localStorage.getItem('min') : -12} onKeyDown={minKeyPressed}/> <br></br>
            Max:
            <input name="max" type="number" defaultValue={localStorage.getItem('max') ? localStorage.getItem('max') : 12} onKeyDown={maxKeyPressed}/> <br></br>
            <button name="submit" onClick={() => {
              localStorage.setItem('min', document.getElementsByName('min')[0].value);
              localStorage.setItem('max', document.getElementsByName('max')[0].value);
              setMin(document.getElementsByName('min')[0].value);
              setMax(document.getElementsByName('max')[0].value);
            }}> Submit </button>
            <br></br>
            <button name="reset" onClick={() => {
              localStorage.setItem('min', -12);
              localStorage.setItem('max', 12);
              setMin(-12);
              setMax(12);
              document.getElementsByName('min')[0].value = -12;
              document.getElementsByName('max')[0].value = 12;
            }}> Reset </button>
          </label>
      </div>
    </>
  )
}

export default MathGameApp

