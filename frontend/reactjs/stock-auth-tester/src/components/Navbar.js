import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Login, PersonAdd, Brightness4, Brightness7, Logout, AccountBalance } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Navbar = ({ onRegisterOpen, onLoginOpen, darkMode, onToggleDarkMode, token, onLogout }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                    ShareTracker
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {token && (
                        <Button
                            color="inherit"
                            startIcon={<AccountBalance />}
                            component={Link}
                            to="/portfolio"
                            sx={{ mx: 1 }}
                        >
                            Portfolio
                        </Button>
                    )}
                    {!token ? (
                        <>
                            <Button
                                color="inherit"
                                startIcon={<PersonAdd />}
                                onClick={onRegisterOpen}
                            >
                                Register
                            </Button>
                            <Button
                                color="inherit"
                                startIcon={<Login />}
                                onClick={onLoginOpen}
                            >
                                Login
                            </Button>
                        </>
                    ) : (
                        <Button
                            color="inherit"
                            startIcon={<Logout />}
                            onClick={onLogout}
                        >
                            Logout
                        </Button>
                    )}
                    <IconButton color="inherit" onClick={onToggleDarkMode}>
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
