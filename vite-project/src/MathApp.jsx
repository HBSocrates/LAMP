import { useState } from 'react'
import './App.css'
import './mathOperands.js'
import { operandsList } from './mathOperands.js';

function MathApp() {
  let min = 1;
  let max = 100;
  let operandNum = 0;

  const [randNum1, setRandNum1] = useState(0);
  const [randNum2, setRandNum2] = useState(0);
  const [randOperand, setRandOperand] = useState(operandsList[operandNum]);
  const [solution, setSolution] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [response, setResponse] = useState("");

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
    }
    else {
      setResponse("Incorrect, try again!");
    }
  }

  return (
    <>
      <div>
        <h1> Maths! </h1>
        <p>{randNum1} {randOperand.name} {randNum2} =</p>
        <p>{answer}</p>
        <p>{solution}</p>
        <label>
          <input name="answer" type="number" defaultValue="0" onChange={e => setAnswer(e.target.value)}/>
          <button name="submit" onClick={() => {validateSolution()}}> Submit </button>
        </label>
        <p>{response}</p>
      </div>
    </>
  )
}

export default MathApp
