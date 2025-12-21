import React, { useState } from 'react';
import './App.css';

function App() {
  const [authResponse, setAuthResponse] = useState(null);
  const [stockResponse, setStockResponse] = useState(null);
  const [token, setToken] = useState('');

  const register = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
        }),
      });
      const data = await response.json();
      setAuthResponse(data);
    } catch (error) {
      setAuthResponse({ error: 'Failed to connect to auth service' });
    }
  };

  const login = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username_or_email: 'testuser',
          password: 'password123',
        }),
      });
      const data = await response.json();
      setAuthResponse(data);
      if (data.access_token) {
        setToken(data.access_token);
      }
    } catch (error) {
      setAuthResponse({ error: 'Failed to connect to auth service' });
    }
  };

  const getStockQuote = async () => {
    if (!token) {
      setStockResponse({ error: 'Please login first' });
      return;
    }
    try {
      const response = await fetch('http://localhost:5002/api/v1/stock/quote/AAPL', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStockResponse(data);
    } catch (error) {
      setStockResponse({ error: 'Failed to connect to stock service' });
    }
  };

  const getCompanyProfile = async () => {
    if (!token) {
      setStockResponse({ error: 'Please login first' });
      return;
    }
    try {
      const response = await fetch('http://localhost:5002/api/v1/stock/company/AAPL', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStockResponse(data);
    } catch (error) {
      setStockResponse({ error: 'Failed to connect to stock service' });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ShareTracker Frontend</h1>
        <div>
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
        </div>
        {authResponse && <pre>{JSON.stringify(authResponse, null, 2)}</pre>}

        <div>
          <button onClick={getStockQuote}>Get AAPL Quote</button>
          <button onClick={getCompanyProfile}>Get AAPL Company Profile</button>
        </div>
        {stockResponse && <pre>{JSON.stringify(stockResponse, null, 2)}</pre>}
      </header>
    </div>
  );
}

export default App;
