import React, { useState, useEffect } from 'react';
import { Container, Typography, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import { LoginModal, RegisterModal } from './components/AuthModals';
import StockDashboard from './components/StockDashboard';
import Logout from './components/Logout';
import PortfolioPage from './components/PortfolioPage';
import { login, register, fetchStockQuote, fetchCompanyProfile, fetchStockCandles } from './services/api';

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
  const [candleData, setCandleData] = useState(null);

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
        setAuthResponse(null); // Clear success message once logged in
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

  const handleGetStockCandles = async (symbol) => {
    if (!token) return;
    try {
      const data = await fetchStockCandles(symbol, '1y', '1d', token);
      setCandleData(data);
    } catch (error) {
      console.error('Failed to fetch candle data', error);
    }
  };

  const handleStockSelect = (option) => {
    setSelectedStock(option);
    if (option) {
      handleGetStockQuote(option.value);
      handleGetStockCandles(option.value);
    } else {
      setCandleData(null);
      setStockResponse(null);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('access_token');
    setToken('');
    setAuthResponse(null);
    setSelectedStock(null);
    setStockResponse(null);
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setToken(token);
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar
            onRegisterOpen={() => setRegisterOpen(true)}
            onLoginOpen={() => setLoginOpen(true)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            token={token}
            onLogout={logoutUser}
          />

          <Routes>
            <Route path="/" element={
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
                  candleData={candleData}
                />

                {token && <Logout onLogout={logoutUser} />}
              </Container>
            } />
            <Route path="/portfolio" element={<PortfolioPage token={token} />} />
          </Routes>

          {!token && <LoginModal
            open={loginOpen}
            onClose={() => setLoginOpen(false)}
            form={loginForm}
            setForm={setLoginForm}
            onSubmit={handleLoginSubmit}
            loading={loading}
            token={token}
            logoutUser={logoutUser}
          />}

          {!token && <RegisterModal
            open={registerOpen}
            onClose={() => setRegisterOpen(false)}
            form={registerForm}
            setForm={setRegisterForm}
            onSubmit={handleRegisterSubmit}
            loading={loading}
          />}

          {authResponse && (!token || authResponse.error || authResponse.detail) && (
            <Container maxWidth="md" sx={{ mt: 2 }}>
              <Alert severity={(authResponse.error || authResponse.detail) ? 'error' : 'success'}>
                <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                  {JSON.stringify(authResponse, null, 2)}
                </pre>
              </Alert>
            </Container>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;