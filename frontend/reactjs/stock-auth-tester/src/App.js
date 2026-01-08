import React, { useState, useEffect } from 'react';
import { Container, Typography, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Navbar from './components/Navbar';
import { LoginModal, RegisterModal } from './components/AuthModals';
import StockDashboard from './components/StockDashboard';
import { login, register, fetchStockQuote, fetchCompanyProfile } from './services/api';

import './App.css';

function App() {
  const [authResponse, setAuthResponse] = useState(null);
  const [stockResponse, setStockResponse] = useState(null);
  const [token, setToken] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username_or_email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(loginForm);
      setAuthResponse(data);
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        setToken(data.access_token);
        setLoginOpen(false);
        setLoginForm({ username_or_email: '', password: '' });
      }
    } catch (error) {
      setAuthResponse({ error: 'Failed to connect to auth service' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(registerForm);
      setAuthResponse(data);
      if (data && !data.error) {
        setRegisterOpen(false);
        setRegisterForm({ username: '', email: '', password: '' });
      }
    } catch (error) {
      setAuthResponse({ error: 'Failed to connect to auth service' });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStockQuote = async (symbol) => {
    if (!token) return;
    try {
      const data = await fetchStockQuote(symbol, token);
      setStockResponse(data);
    } catch (error) {
      setStockResponse({ error: 'Failed to connect to stock service' });
    }
  };

  const handleGetCompanyProfile = async (symbol) => {
    if (!token) return;
    try {
      const data = await fetchCompanyProfile(symbol, token);
      setStockResponse(data);
    } catch (error) {
      setStockResponse({ error: 'Failed to connect to stock service' });
    }
  };

  const handleStockSelect = (option) => {
    setSelectedStock(option);
    if (option) {
      handleGetStockQuote(option.value);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setToken(token);
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Navbar
          onRegisterOpen={() => setRegisterOpen(true)}
          onLoginOpen={() => setLoginOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Stock Data Dashboard
          </Typography>

          <StockDashboard
            darkMode={darkMode}
            token={token}
            selectedStock={selectedStock}
            onStockSelect={handleStockSelect}
            onGetQuote={handleGetStockQuote}
            onGetProfile={handleGetCompanyProfile}
            stockResponse={stockResponse}
          />
        </Container>

        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          form={loginForm}
          setForm={setLoginForm}
          onSubmit={handleLoginSubmit}
          loading={loading}
        />

        <RegisterModal
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          form={registerForm}
          setForm={setRegisterForm}
          onSubmit={handleRegisterSubmit}
          loading={loading}
        />

        {authResponse && (
          <Container maxWidth="md" sx={{ mt: 2 }}>
            <Alert severity={(authResponse.error || authResponse.detail) ? 'error' : 'success'}>
              <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                {JSON.stringify(authResponse, null, 2)}
              </pre>
            </Alert>
          </Container>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;