import React, { useState, useEffect } from 'react';

//  Login Page.  In theory, should use the backend to keep track of if the user is logged in or not, but for now we'll be using localstorage for simplicity
const Login = () => {
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [loginText, setLoginText] = useState('Log In');
    const [responseMessage, setResponseMessage] = useState('');

    const validateLogin = async (e) => {
        console.log('Submitting login form with username:', username, 'and password:', password);
        e.preventDefault();
        setProcessing(true);
        setError(null);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: username,
                    password: password,
                }),
            });

            const data = await response.json();
            console.log('Received response:', data);
            setResponseMessage(data.message);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

        // Handle successful login (e.g., redirect, store token)
        } catch (error) {
            setError(error.message);
            setLoginText('Login Failed');
        } finally {
            setProcessing(false);
            if (responseMessage === 'Login successful') {
                setLoginText('Login Successful. Welcome, ' + username + '!');
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', username);
                setError(null);
            } else {
                setLoginText('Login Failed');
                setError(null);
            }
        }
    };

    return (
        <div>
            <h1>{error ? error : loginText}</h1>
            <input name="username" required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /> <br></br>
            <input name="password" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /> <br></br>
            <button type='submit' onClick = {validateLogin}>{processing ? 'Processing...' : 'Log In'}</button>
        </div>
    );
};

export default Login;