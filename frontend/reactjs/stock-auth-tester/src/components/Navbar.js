import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Container } from '@mui/material';
import { Login, PersonAdd, Brightness4, Brightness7, Logout, AccountBalance, TrendingUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'

const Navbar = ({ onRegisterOpen, onLoginOpen, darkMode, onToggleDarkMode, token, onLogout }) => {
    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                zIndex: 1100
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ height: 70 }}>
                    <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 1.5 }}>
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                borderRadius: '10px',
                                p: 0.5,
                                display: 'flex'
                            }}
                        >
                            <TrendingUp sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                fontFamily: "'Outfit', sans-serif",
                                color: '#fff',
                                letterSpacing: '-0.02em'
                            }}
                        >
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: "easeout", delay: 0.4 }}>StockYard</motion.span>
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {token && (
                            <Button
                                color="inherit"
                                startIcon={<AccountBalance />}
                                component={Link}
                                to="/portfolio"
                                sx={{
                                    mx: 1,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': { background: 'rgba(255,255,255,0.05)' }
                                }}
                            >
                                Portfolio
                            </Button>
                        )}
                        {!token ? (
                            <>
                                <Button
                                    onClick={onLoginOpen}
                                    sx={{
                                        color: '#fff',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        px: 2,
                                        '&:hover': { background: 'rgba(255,255,255,0.05)' }
                                    }}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={onRegisterOpen}
                                    className="btn-primary"
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        px: 3
                                    }}
                                >
                                    Join Now
                                </Button>
                            </>
                        ) : (
                            <Button
                                color="error"
                                variant="outlined"
                                startIcon={<Logout />}
                                onClick={onLogout}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                    '&:hover': { borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }
                                }}
                            >
                                Logout
                            </Button>
                        )}

                        <Box sx={{ ml: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', pl: 1 }}>
                            <IconButton onClick={onToggleDarkMode} sx={{ color: '#fff' }}>
                                {darkMode ? <Brightness7 size={20} /> : <Brightness4 size={20} />}
                            </IconButton>
                        </Box>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;

