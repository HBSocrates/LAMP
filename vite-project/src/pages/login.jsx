import React, { useState, useEffect } from 'react';

//  Login Page.  In theory, should use the backend to keep track of if the user is logged in or not, but for now we'll be using localstorage for simplicity
const Login = () => {
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [loginText, setLoginText] = useState(localStorage.getItem('loggedIn') === 'true' ? 'Already Logged In' : 'Log In');

    const validateLogin = async (e) => {
        console.log('Submitting login form with username:', username, 'and password:', password);
        e.preventDefault();
        setProcessing(true);
        setError(null);
        let message = '';

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
            message = data.message;
            console.log('Received response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

        // Handle successful login (e.g., redirect, store token)
        } catch (error) {
            console.log('Login error:', error);
            setError(error.message);
            setLoginText('Login Failed');
        } finally {
            if (message === 'Login successful') {
                console.log('Login successful for user:', username);
                setLoginText('Login Successful. Welcome, ' + username + '!');
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', username);
            } else {
                console.log('Login failed:', message);
                setLoginText('Login Failed');
            }
            setProcessing(false);
            setError(null);
        }
    };

    return (
        <div>
            <h1>{error ? error : loginText}</h1>
            {loginText === 'Already Logged In' ? (
                <>
                    <p>You are already logged in.</p>
                    <button type='submit' onClick={() => {
                        localStorage.removeItem('loggedIn');
                        localStorage.removeItem('username');
                        setLoginText('Log In');
                    }}>Log Out</button>
                </>
            ) : (
                <>
                    <input name="username" required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /> <br></br>
                    <input name="password" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /> <br></br>
                    <button type='submit' onClick = {validateLogin}>{processing ? 'Processing...' : 'Log In'}</button>
                </>
            )}
        </div>
    );
};

export default Login;