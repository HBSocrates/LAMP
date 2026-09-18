import React, { useState, useEffect } from 'react';
import '../styles/App.css';

function App() {
   const [data, setData] = useState(null);
useEffect(() => {
   fetch('/api/data')
   .then((response) => response.json())
   .then((data) => setData(data));
}, []);
return (
   <div className="App">
   <header className="App-header">
   <h1>Flask and React Integration</h1>
   {data ? (
   <div>
     <p>{data.message}</p>
     <ul>
        {data.items.map((item, index) => (
        <li key={index}>{item}</li>
         ))}
     </ul>
   </div>
   ) : (
     <p>Loading</p>
   )}
   </header>
   </div>
  );
 }
export default App;