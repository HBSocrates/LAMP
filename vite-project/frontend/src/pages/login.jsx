import React, { useState } from 'react';
import '../styles/App.css';

//  Login Page.  In theory, should use the backend to keep track of if the user is logged in or not, but for now we'll be using localstorage for simplicity
const Login = () => {
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [loginText, setLoginText] = useState(localStorage.getItem('loggedIn') === 'true' ? 'Already Logged In' : 'Log In');

    const validateLogin = async () => {
        console.log('Submitting login form with username:', username, 'and password:', password);
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

            if (message === 'Login successful') {
                console.log('Login successful for user:', username);
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', username);
                setLoginText('Login Successful. Welcome, ' + username + '!');
            } else {
                console.log('Login failed:', message);
                setLoginText('Login Failed');
            }
        } catch (error) {
            console.log('Login error:', error);
            setError(error.message);
            setLoginText('Login Failed');
        } finally {
            setProcessing(false);
            setError(null);
        }
    };

    // Shows different page content depending on if the user is logged in or not.  If logged in, shows a welcome message and a log out button.  If not logged in, shows the login form
    return (
        <div className="auth-page">
            <div className="auth-card">
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
                        <input name="username" required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input name="password" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type='submit' onClick={validateLogin}>{processing ? 'Processing...' : 'Log In'}</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;