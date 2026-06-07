import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, CircularProgress, TextField, Alert, Snackbar } from '@mui/material';
import { Delete, Folder, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { fetchPortfolio, updatePortfolio } from '../services/api';

const PortfolioPage = ({ token }) => {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'success', open: false });

    useEffect(() => {
        const getPortfolio = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const data = await fetchPortfolio(token);
                if (Array.isArray(data)) {
                    setPortfolio(data);
                }
            } catch (error) {
                console.error("Failed to fetch portfolio:", error);
            } finally {
                setLoading(false);
            }
        };
        getPortfolio();
    }, [token]);

    const handleQuantityChange = (id, newQuantity) => {
        const qty = parseInt(newQuantity) || 0;
        setPortfolio(prevPortfolio =>
            prevPortfolio.map(item =>
                item._id === id ? { ...item, quantity: qty } : item
            )
        );
    };

    const handleUpdatePortfolio = async () => {
        setUpdating(true);
        try {
            const response = await updatePortfolio(token, portfolio);
            if (response.stocks) {
                setPortfolio(response.stocks);
                setMessage({ text: 'Portfolio updated successfully!', type: 'success', open: true });
            } else {
                setMessage({ text: 'Failed to update portfolio.', type: 'error', open: true });
            }
        } catch (error) {
            console.error("Error updating portfolio:", error);
            setMessage({ text: 'An error occurred while updating.', type: 'error', open: true });
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteStock = (id) => {
        setPortfolio(prevPortfolio => prevPortfolio.filter(item => item._id !== id));
    };

    const handleCloseSnackbar = () => {
        setMessage({ ...message, open: false });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 8, pb: 8 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Folder sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h4" component="h1" fontWeight={800} className="gradient-text">
                        Investment Portfolio
                    </Typography>
                </Box>

                <Button
                    component={Link}
                    to="/"
                    startIcon={<ArrowBack />}
                    variant="outlined"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: 'text.secondary',
                        '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'rgba(99, 102, 241, 0.05)'
                        }
                    }}
                >
                    Back to Dashboard
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer
                        component={Paper}
                        className="glass-card"
                        sx={{
                            border: 'none',
                            overflow: 'hidden',
                            background: 'var(--card-bg)'
                        }}
                    >
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'text.muted', fontWeight: 600 }}>SYMBOL</TableCell>
                                    <TableCell align="right" sx={{ color: 'text.muted', fontWeight: 600 }}>QUANTITY</TableCell>
                                    <TableCell align="right" sx={{ color: 'text.muted', fontWeight: 600 }}>AVG PRICE</TableCell>
                                    <TableCell align="right" sx={{ color: 'text.muted', fontWeight: 600 }}>MARKET VALUE</TableCell>
                                    <TableCell align="right" sx={{ color: 'text.muted', fontWeight: 600 }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {portfolio.map((item) => (
                                    <TableRow
                                        key={item._id}
                                        sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            transition: 'background 0.2s ease',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' }
                                        }}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Typography fontWeight={700} sx={{ color: 'primary.light' }}>
                                                {item.symbol}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                                                sx={{
                                                    width: '80px',
                                                    '& .MuiInputBase-input': {
                                                        textAlign: 'right',
                                                        color: 'text.primary',
                                                        fontWeight: 600
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'rgba(255,255,255,0.1)'
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'primary.main'
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">${(item.purchasePrice || 0).toLocaleString()}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                            ${(item.quantity * (item.purchasePrice || 0)).toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteStock(item._id)}
                                                sx={{
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button
                        onClick={handleUpdatePortfolio}
                        disabled={updating}
                        sx={{
                            marginTop: "2rem",
                            padding: "0.8em 2em",
                            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                            color: "white",
                            fontWeight: 700,
                            borderRadius: '10px',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                            '&:hover': {
                                background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                            },
                            '&:disabled': {
                                background: 'rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.3)'
                            }
                        }}
                    >
                        {updating ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Update Portfolio'}
                    </Button>

                    <Snackbar open={message.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                        <Alert onClose={handleCloseSnackbar} severity={message.type} sx={{ width: '100%' }}>
                            {message.text}
                        </Alert>
                    </Snackbar>

                    {portfolio.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <Typography variant="h6" color="text.secondary">
                                Your portfolio is empty.
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default PortfolioPage;

