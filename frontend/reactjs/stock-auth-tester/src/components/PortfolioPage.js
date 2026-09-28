import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Button,
    CircularProgress, TextField, Alert, Snackbar, Grid, Card,
    CardContent, Chip, Tooltip
} from '@mui/material';
import {
    Delete, Folder, ArrowBack, Refresh, TrendingUp, TrendingDown,
    AccountBalanceWallet, MonetizationOn, ShowChart
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { fetchPortfolio, updatePortfolio, fetchBatchStockQuotes } from '../services/api';

const PortfolioPage = ({ token }) => {
    const [portfolio, setPortfolio] = useState([]);
    const [quotes, setQuotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [quotesLoading, setQuotesLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'success', open: false });
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadQuotes = useCallback(async (stockList) => {
        if (!stockList || stockList.length === 0 || !token) return;
        const symbols = stockList.map(s => s.symbol);
        setQuotesLoading(true);
        try {
            const batchData = await fetchBatchStockQuotes(symbols, token);
            if (batchData && typeof batchData === 'object' && !batchData.error) {
                setQuotes(batchData);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error("Failed to fetch live quotes:", err);
        } finally {
            setQuotesLoading(false);
        }
    }, [token]);

    const getPortfolio = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchPortfolio(token);
            if (Array.isArray(data)) {
                setPortfolio(data);
                await loadQuotes(data);
            }
        } catch (error) {
            console.error("Failed to fetch portfolio:", error);
        } finally {
            setLoading(false);
        }
    }, [token, loadQuotes]);

    useEffect(() => {
        getPortfolio();
    }, [getPortfolio]);

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
                await loadQuotes(response.stocks);
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

    // Calculate Financial KPIs
    const { totalValue, totalCost, totalGainLoss, totalGainLossPct, totalDayChange } = useMemo(() => {
        let value = 0;
        let cost = 0;
        let dayChange = 0;

        portfolio.forEach(item => {
            const qty = item.quantity || 0;
            const buyPrice = item.purchasePrice || 0;
            const quote = quotes[item.symbol];
            const currentPrice = quote && quote.current_price > 0 ? quote.current_price : buyPrice;
            const change = quote?.change || 0;

            const itemCost = qty * buyPrice;
            const itemVal = qty * currentPrice;
            const itemDay = qty * change;

            cost += itemCost;
            value += itemVal;
            dayChange += itemDay;
        });

        const gainLoss = value - cost;
        const gainLossPct = cost > 0 ? (gainLoss / cost) * 100 : 0;

        return {
            totalValue: value,
            totalCost: cost,
            totalGainLoss: gainLoss,
            totalGainLossPct: gainLossPct,
            totalDayChange: dayChange,
        };
    }, [portfolio, quotes]);

    const formatCurrency = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <Container maxWidth="lg" sx={{ mt: 6, pb: 8 }}>
            {/* Header section */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Folder sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" component="h1" fontWeight={800} className="gradient-text">
                            Investment Portfolio
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            Real-time tracking of assets, valuation, and performance
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Tooltip title="Refresh real-time prices">
                        <span>
                            <Button
                                variant="outlined"
                                onClick={() => loadQuotes(portfolio)}
                                disabled={quotesLoading || portfolio.length === 0}
                                startIcon={quotesLoading ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    borderColor: 'rgba(255,255,255,0.15)',
                                    color: '#fff',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        background: 'rgba(99, 102, 241, 0.05)'
                                    }
                                }}
                            >
                                {quotesLoading ? 'Updating...' : 'Refresh Quotes'}
                            </Button>
                        </span>
                    </Tooltip>

                    <Button
                        component={Link}
                        to="/"
                        startIcon={<ArrowBack />}
                        variant="outlined"
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            borderColor: 'rgba(255,255,255,0.15)',
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: 'rgba(99, 102, 241, 0.05)'
                            }
                        }}
                    >
                        Dashboard
                    </Button>
                </Box>
            </Box>

            {/* Summary KPI Cards Bar */}
            {!loading && portfolio.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Total Portfolio Value */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card className="glass-card" sx={{ border: 'none', borderRadius: '18px', p: 1 }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                        PORTFOLIO VALUE
                                    </Typography>
                                    <AccountBalanceWallet sx={{ color: '#6366f1', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
                                    {formatCurrency(totalValue)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                                    Live market valuation
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Invested */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card className="glass-card" sx={{ border: 'none', borderRadius: '18px', p: 1 }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                        TOTAL INVESTED
                                    </Typography>
                                    <MonetizationOn sx={{ color: '#3b82f6', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
                                    {formatCurrency(totalCost)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                                    Total purchase cost basis
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Return (P&L) */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card className="glass-card" sx={{ border: 'none', borderRadius: '18px', p: 1 }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                        TOTAL RETURN
                                    </Typography>
                                    {totalGainLoss >= 0 ? (
                                        <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
                                    ) : (
                                        <TrendingDown sx={{ color: '#ef4444', fontSize: 20 }} />
                                    )}
                                </Box>
                                <Typography
                                    variant="h5"
                                    fontWeight={800}
                                    sx={{ color: totalGainLoss >= 0 ? '#10b981' : '#ef4444' }}
                                >
                                    {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Chip
                                        size="small"
                                        label={`${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPct.toFixed(2)}%`}
                                        sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: totalGainLoss >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                            color: totalGainLoss >= 0 ? '#10b981' : '#ef4444',
                                            border: `1px solid ${totalGainLoss >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>all-time</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Today's Gain/Loss */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card className="glass-card" sx={{ border: 'none', borderRadius: '18px', p: 1 }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                        DAY CHANGE
                                    </Typography>
                                    <ShowChart sx={{ color: totalDayChange >= 0 ? '#10b981' : '#ef4444', fontSize: 20 }} />
                                </Box>
                                <Typography
                                    variant="h5"
                                    fontWeight={800}
                                    sx={{ color: totalDayChange >= 0 ? '#10b981' : '#ef4444' }}
                                >
                                    {totalDayChange >= 0 ? '+' : ''}{formatCurrency(totalDayChange)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                                    {lastUpdated ? `Live at ${lastUpdated.toLocaleTimeString()}` : 'Real-time quotes'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Main Portfolio Table */}
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
                    <CircularProgress size={40} sx={{ color: 'primary.main', mb: 2 }} />
                    <Typography sx={{ color: 'text.secondary' }}>Loading your investments & live quotes...</Typography>
                </Box>
            ) : (
                <>
                    {portfolio.length > 0 ? (
                        <>
                            <TableContainer
                                component={Paper}
                                className="glass-card"
                                sx={{
                                    border: 'none',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    background: 'var(--card-bg)'
                                }}
                            >
                                <Table sx={{ minWidth: 700 }}>
                                    <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                        <TableRow>
                                            <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>SYMBOL</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>SHARES</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>AVG BUY PRICE</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>LIVE PRICE</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>MARKET VALUE</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>TOTAL RETURN</TableCell>
                                            <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>ACTION</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {portfolio.map((item) => {
                                            const qty = item.quantity || 0;
                                            const buyPrice = item.purchasePrice || 0;
                                            const quote = quotes[item.symbol];
                                            const currentPrice = quote && quote.current_price > 0 ? quote.current_price : buyPrice;
                                            const costBasis = qty * buyPrice;
                                            const marketVal = qty * currentPrice;
                                            const gainLoss = marketVal - costBasis;
                                            const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                                            const dayChangePct = quote?.percent_change || 0;

                                            return (
                                                <TableRow
                                                    key={item._id}
                                                    sx={{
                                                        '&:last-child td, &:last-child th': { border: 0 },
                                                        transition: 'background 0.2s ease',
                                                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' }
                                                    }}
                                                >
                                                    {/* Symbol */}
                                                    <TableCell component="th" scope="row">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Box
                                                                sx={{
                                                                    width: 38,
                                                                    height: 38,
                                                                    borderRadius: '10px',
                                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: 800,
                                                                    color: 'primary.light',
                                                                    fontSize: '0.85rem'
                                                                }}
                                                            >
                                                                {item.symbol.slice(0, 2)}
                                                            </Box>
                                                            <Box>
                                                                <Typography fontWeight={800} sx={{ color: '#fff', fontSize: '0.95rem' }}>
                                                                    {item.symbol}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    Stock Equity
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Shares */}
                                                    <TableCell align="right">
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                                                            sx={{
                                                                width: '84px',
                                                                '& .MuiInputBase-input': {
                                                                    textAlign: 'right',
                                                                    color: '#fff',
                                                                    fontWeight: 700,
                                                                    py: 0.8
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

                                                    {/* Buy Price */}
                                                    <TableCell align="right">
                                                        <Typography fontWeight={600} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                            {formatCurrency(buyPrice)}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Live Price */}
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                            <Typography fontWeight={700} sx={{ color: '#fff' }}>
                                                                {formatCurrency(currentPrice)}
                                                            </Typography>
                                                            {quote && (
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: dayChangePct >= 0 ? '#10b981' : '#ef4444',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    {dayChangePct >= 0 ? '+' : ''}{dayChangePct.toFixed(2)}% today
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>

                                                    {/* Market Value */}
                                                    <TableCell align="right">
                                                        <Typography fontWeight={700} sx={{ color: '#fff', fontSize: '0.95rem' }}>
                                                            {formatCurrency(marketVal)}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Total Return */}
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                            <Typography
                                                                fontWeight={700}
                                                                sx={{ color: gainLoss >= 0 ? '#10b981' : '#ef4444' }}
                                                            >
                                                                {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: gainLoss >= 0 ? '#10b981' : '#ef4444',
                                                                    fontWeight: 700
                                                                }}
                                                            >
                                                                {gainLoss >= 0 ? '+' : ''}{gainLossPct.toFixed(2)}%
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Actions */}
                                                    <TableCell align="center">
                                                        <Tooltip title="Remove stock from portfolio">
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
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Button
                                    onClick={handleUpdatePortfolio}
                                    disabled={updating}
                                    variant="contained"
                                    className="btn-primary"
                                    sx={{
                                        px: 4,
                                        py: 1.2,
                                        fontWeight: 700,
                                        borderRadius: '10px',
                                        textTransform: 'none'
                                    }}
                                >
                                    {updating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Changes'}
                                </Button>

                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    * Quotes are automatically refreshed using Redis cache & real-time market proxies.
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Paper
                            className="glass-card"
                            sx={{
                                textAlign: 'center',
                                py: 10,
                                px: 4,
                                borderRadius: '24px',
                                border: '1px dashed rgba(255,255,255,0.15)'
                            }}
                        >
                            <Folder sx={{ fontSize: 60, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>
                                Your Portfolio is Empty
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 450, mx: 'auto' }}>
                                You haven't added any stocks yet. Head back to the dashboard, search for your favorite tickers (e.g. AAPL, NVDA), and add them to track your wealth.
                            </Typography>
                            <Button
                                component={Link}
                                to="/"
                                variant="contained"
                                className="btn-primary"
                                sx={{ textTransform: 'none', px: 4, py: 1.2, borderRadius: '10px' }}
                            >
                                Explore Market & Add Stocks
                            </Button>
                        </Paper>
                    )}
                </>
            )}

            <Snackbar open={message.open} autoHideDuration={5000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={message.type} sx={{ width: '100%', borderRadius: '12px' }}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default PortfolioPage;
