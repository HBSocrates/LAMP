import React, { useState, useEffect } from 'react';

//  Sign Up Page.  In theory, should use the backend to keep track of if the user is logged in or not, but for now we'll be using localstorage for simplicity
const SignUp = () => {
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [signUpText, setSignUpText] = useState('Sign Up');
    const [responseMessage, setResponseMessage] = useState('');

    const signUp = async (e) => {
        console.log('Submitting sign up form with username:', username, 'and password:', password);
        e.preventDefault();
        setProcessing(true);
        setError(null);
        try {
            const response = await fetch('/api/signup', {
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
                throw new Error(data.message || 'Sign up failed');
            }
        } catch (error) {
            setError(error.message);
            setSignUpText('Sign Up Failed');    
        } finally {
            setProcessing(false);
            if (responseMessage === 'Signup successful') {
                setSignUpText('Sign Up Successful. Welcome, ' + username + '!');
                setError(null);
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', username);
            } else {
                setSignUpText('Sign Up Failed');
                setError(null);
            }
        }
    }

    return (
        <div>
            <h1>{error ? error : signUpText}</h1>
            <input name="username" required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /> <br></br>
            <input name="password" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /> <br></br>
            <button type='submit' onClick = {signUp}>{processing ? 'Processing...' : 'Sign Up'}</button>
        </div>
    );
};

export default SignUp;