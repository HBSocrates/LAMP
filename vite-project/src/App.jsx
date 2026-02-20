import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import mathLogo from './assets/Math.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="/mathapp.html">
          <img src={mathLogo} className="logo math" alt="Math logo" />
        </a>
      </div>
      <h1>Andy Yang</h1>
      <div className="card">
        <p>
          Welcome to my site! Click the pi symbol above to play a fun math game!
        </p>
      </div>
    </>
  )
}

export default App
