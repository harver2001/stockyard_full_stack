import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Login, PersonAdd, Brightness4, Brightness7, Logout } from '@mui/icons-material';

const Navbar = ({ onRegisterOpen, onLoginOpen, darkMode, onToggleDarkMode, token, onLogout }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    ShareTracker
                </Typography>
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
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
