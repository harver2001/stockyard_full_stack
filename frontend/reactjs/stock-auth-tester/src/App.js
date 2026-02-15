import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Navbar from './components/Navbar';
import { LoginModal, RegisterModal } from './components/AuthModals';
import StockDashboard from './components/StockDashboard';
import PortfolioPage from './components/PortfolioPage';
import LandingPage from './components/LandingPage';
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
      primary: {
        main: '#6366f1',
      },
      secondary: {
        main: '#ec4899',
      },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontFamily: '"Outfit", sans-serif' },
      h2: { fontFamily: '"Outfit", sans-serif' },
      h3: { fontFamily: '"Outfit", sans-serif' },
      h4: { fontFamily: '"Outfit", sans-serif' },
      h5: { fontFamily: '"Outfit", sans-serif' },
      h6: { fontFamily: '"Outfit", sans-serif' },
    },
    shape: {
      borderRadius: 12,
    },
  });

  const logoutUser = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken('');
    setAuthResponse(null);
    setSelectedStock(null);
    setStockResponse(null);
  }, []);

  const checkTokenExpiry = useCallback(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          console.warn("Token expired, logging out...");
          logoutUser();
        } else {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Invalid token found, removing...");
        logoutUser();
      }
    }
  }, [logoutUser]);

  useEffect(() => {
    checkTokenExpiry();
    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    return () => clearInterval(interval);
  }, [checkTokenExpiry]);

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
        setAuthResponse(null);
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

          <main style={{ minHeight: 'calc(100vh - 64px)' }}>
            <Routes>
              <Route path="/" element={
                !token ? (
                  <LandingPage
                    onLoginOpen={() => setLoginOpen(true)}
                    onRegisterOpen={() => setRegisterOpen(true)}
                  />
                ) : (
                  <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                      <Typography variant="h3" component="h1" gutterBottom className="gradient-text">
                        Market Dashboard
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Real-time market insights and portfolio management
                      </Typography>
                    </Box>

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
                  </Container>
                )
              } />

              <Route
                path="/portfolio"
                element={token ? <PortfolioPage token={token} /> : <Navigate to="/" />}
              />
            </Routes>
          </main>

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

          {authResponse && (authResponse.error || authResponse.detail) && (
            <Container maxWidth="sm" sx={{ mt: 2, position: 'fixed', bottom: 20, right: 20, zIndex: 2000 }}>
              <Alert
                severity="error"
                onClose={() => setAuthResponse(null)}
                className="glass-card"
                sx={{ border: 'none', color: '#fff' }}
              >
                {authResponse.error || authResponse.detail}
              </Alert>
            </Container>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;