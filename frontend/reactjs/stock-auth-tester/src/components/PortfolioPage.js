import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Delete, Folder } from '@mui/icons-material';

const PortfolioPage = ({ token }) => {
    const [portfolio, setPortfolio] = useState([]);

    useEffect(() => {
        // Placeholder for fetching portfolio data
        // In a real scenario, this would call the portfolio_service
        setPortfolio([
            { id: 1, symbol: 'AAPL', quantity: 10, avgPrice: 150.25 },
            { id: 2, symbol: 'GOOGL', quantity: 5, avgPrice: 2800.50 },
        ]);
    }, [token]);

    if (!token) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h5" align="center">Please login to view your portfolio.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
                <Folder sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h4" component="h1">
                    My Portfolio
                </Typography>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Symbol</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Avg Price</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {portfolio.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell fontWeight="bold">{item.symbol}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">${item.avgPrice.toFixed(2)}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="error">
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default PortfolioPage;
