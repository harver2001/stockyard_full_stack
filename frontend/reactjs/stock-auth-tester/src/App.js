import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Modal,
  Box,
  TextField,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton
} from '@mui/material';
import { Login, PersonAdd, Brightness4, Brightness7 } from '@mui/icons-material';
import AsyncSelect from 'react-select/async';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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



  const API_BASE_AUTH = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const API_BASE_STOCK = process.env.REACT_APP_STOCK_URL || 'http://localhost:5002';

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_AUTH}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });
      const data = await response.json();
      setAuthResponse(data);
      if (data.access_token) {
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
      const response = await fetch(`${API_BASE_AUTH}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      });
      const data = await response.json();
      setAuthResponse(data);
      if (response.ok) {
        setRegisterOpen(false);
        setRegisterForm({ username: '', email: '', password: '' });
      }
    } catch (error) {
      setAuthResponse({ error: 'Failed to connect to auth service' });
    } finally {
      setLoading(false);
    }
  };

  const getStockQuote = async (symbol = 'AAPL') => {
    if (!token) {
      setStockResponse({ error: 'Please login first' });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_STOCK}/api/v1/stock/quote/${symbol}`, {
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

  const loadStockOptions = async (inputValue) => {
    try {
      const response = await fetch(`${API_BASE_STOCK}/api/v1/stock/search-list?q=${inputValue}`);
      const data = await response.json();
      return data.map(item => ({
        value: item.symbol,
        label: `${item.symbol} - ${item.name}`
      }));
    } catch (error) {
      console.error('Error fetching stock options:', error);
      return [];
    }
  };

  const handleStockSelect = (option) => {
    setSelectedStock(option);
    if (option) {
      getStockQuote(option.value);
    }
  };


  const getCompanyProfile = async () => {
    if (!token) {
      setStockResponse({ error: 'Please login first' });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_STOCK}/api/v1/stock/company/AAPL`, {
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

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ShareTracker
            </Typography>
            <Button
              color="inherit"
              startIcon={<PersonAdd />}
              onClick={() => setRegisterOpen(true)}
            >
              Register
            </Button>
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => setLoginOpen(true)}
            >
              Login
            </Button>
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Stock Data Dashboard
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Stock Actions
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                      Search and select a stock:
                    </Typography>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={loadStockOptions}
                      defaultOptions
                      onChange={handleStockSelect}
                      placeholder="Type to search (e.g. Apple, AAPL)..."
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                          borderColor: darkMode ? '#444' : '#ccc',
                          color: darkMode ? '#fff' : '#000',
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused
                            ? (darkMode ? '#333' : '#eee')
                            : (darkMode ? '#1e1e1e' : '#fff'),
                          color: darkMode ? '#fff' : '#000',
                          '&:active': {
                            backgroundColor: darkMode ? '#444' : '#ddd',
                          }
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: darkMode ? '#fff' : '#000',
                        }),
                        input: (base) => ({
                          ...base,
                          color: darkMode ? '#fff' : '#000',
                        })
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => getStockQuote(selectedStock?.value || 'AAPL')}
                    disabled={!token}
                  >
                    Refresh {selectedStock?.value || 'AAPL'} Quote
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={getCompanyProfile}
                    disabled={!token}
                  >
                    Get AAPL Company Profile
                  </Button>

                  {!token && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Please login to access stock data
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Response
                  </Typography>
                  {stockResponse && (
                    <Paper sx={{ p: 2, mt: 2, maxHeight: 300, overflow: 'auto' }}>
                      <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                        {JSON.stringify(stockResponse, null, 2)}
                      </pre>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Login Modal */}
        <Modal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          aria-labelledby="login-modal-title"
        >
          <Box sx={modalStyle}>
            <Typography id="login-modal-title" variant="h6" component="h2" gutterBottom>
              Login
            </Typography>
            <form onSubmit={handleLoginSubmit}>
              <TextField
                fullWidth
                label="Username or Email"
                value={loginForm.username_or_email}
                onChange={(e) => setLoginForm({ ...loginForm, username_or_email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                margin="normal"
                required
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" fullWidth disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
                <Button variant="outlined" fullWidth onClick={() => setLoginOpen(false)}>
                  Cancel
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Register Modal */}
        <Modal
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          aria-labelledby="register-modal-title"
        >
          <Box sx={modalStyle}>
            <Typography id="register-modal-title" variant="h6" component="h2" gutterBottom>
              Register
            </Typography>
            <form onSubmit={handleRegisterSubmit}>
              <TextField
                fullWidth
                label="Username"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                margin="normal"
                required
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" fullWidth disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </Button>
                <Button variant="outlined" fullWidth onClick={() => setRegisterOpen(false)}>
                  Cancel
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Auth Response Alert */}
        {authResponse && (
          <Container maxWidth="md" sx={{ mt: 2 }}>
            <Alert severity={authResponse.error ? 'error' : 'success'}>
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


// Store the tokens in local storage for persistence
// useEffect(() => {
//   const storedToken = localStorage.getItem('authToken');
//   if (storedToken) {
//     setToken(storedToken);
//   }
// }, []);