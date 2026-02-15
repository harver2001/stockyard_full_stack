import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button } from '@mui/material';
import { Delete, Folder, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const PortfolioPage = ({ token }) => {
    const [portfolio, setPortfolio] = useState([]);

    useEffect(() => {
        // Placeholder for fetching portfolio data
        setPortfolio([
            { id: 1, symbol: 'AAPL', quantity: 10, avgPrice: 150.25 },
            { id: 2, symbol: 'GOOGL', quantity: 5, avgPrice: 2800.50 },
            { id: 3, symbol: 'TSLA', quantity: 15, avgPrice: 700.12 },
        ]);
    }, [token]);

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
                                key={item.id}
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
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">${item.avgPrice.toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    ${(item.quantity * item.avgPrice).toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="error"
                                        size="small"
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

            {portfolio.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography variant="h6" color="text.secondary">
                        Your portfolio is empty.
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default PortfolioPage;

