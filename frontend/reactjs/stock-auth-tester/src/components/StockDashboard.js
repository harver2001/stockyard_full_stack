import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Alert } from '@mui/material';
import AsyncSelect from 'react-select/async';
import { RefreshCcw, Info, Search, TrendingUp } from 'lucide-react';
import { searchStocks } from '../services/api';
import StockResponseFormatter from './StockResponseFormatter';
import Chart from './Chart';

const StockDashboard = ({
    darkMode,
    token,
    selectedStock,
    onStockSelect,
    onGetQuote,
    onGetProfile,
    stockResponse,
    candleData
}) => {
    return (
        <Grid container spacing={4}>
            {/* Chart Section */}
            <Grid item xs={12}>
                <Box className="glass-card" sx={{ p: 1, borderRadius: '24px', overflow: 'hidden' }}>
                    <Chart
                        symbol={selectedStock?.value}
                        candleData={candleData}
                        darkMode={darkMode}
                    />
                </Box>
            </Grid>

            {/* Actions Section */}
            <Grid item xs={12} md={5}>
                <Card className="glass-card" sx={{ height: '100%', border: 'none' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                            <Search size={20} color="#6366f1" />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Market Search
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 4 }}>
                            <Typography variant="body2" sx={{ mb: 1, color: 'var(--text-muted)', fontWeight: 500 }}>
                                Select a company or symbol
                            </Typography>
                            <AsyncSelect
                                cacheOptions
                                loadOptions={(inputValue) => searchStocks(inputValue, token)}
                                defaultOptions
                                onChange={onStockSelect}
                                placeholder="Search e.g. NVDA, Tesla..."
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                                        borderColor: state.isFocused ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '4px',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)'
                                        }
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: '#1e293b',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        overflow: 'hidden'
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                        color: state.isFocused ? '#6366f1' : '#f8fafc',
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        '&:active': {
                                            backgroundColor: 'rgba(99, 102, 241, 0.2)'
                                        }
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: '#f8fafc',
                                        fontWeight: 600
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        color: '#f8fafc',
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: 'rgba(248, 250, 252, 0.4)',
                                    })
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="contained"
                                className="btn-primary"
                                fullWidth
                                startIcon={<RefreshCcw size={18} />}
                                onClick={() => onGetQuote(selectedStock?.value || 'AAPL')}
                                disabled={!token}
                                sx={{ textTransform: 'none', py: 1.5 }}
                            >
                                Refresh {selectedStock?.value || 'AAPL'} Analytics
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<Info size={18} />}
                                onClick={() => onGetProfile(selectedStock?.value || 'AAPL')}
                                disabled={!token}
                                sx={{
                                    textTransform: 'none',
                                    py: 1.5,
                                    borderRadius: '10px',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    '&:hover': {
                                        borderColor: '#6366f1',
                                        background: 'rgba(99, 102, 241, 0.05)'
                                    }
                                }}
                            >
                                Company Overview
                            </Button>
                        </Box>

                        {!token && (
                            <Alert severity="info" sx={{ mt: 3, borderRadius: '12px', background: 'rgba(2, 132, 199, 0.1)', color: '#7dd3fc', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                                Please secure your session to access dynamic market data.
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Response Section */}
            <Grid item xs={12} md={7}>
                <Card className="glass-card" sx={{ height: '100%', border: 'none' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                            <TrendingUp size={20} color="#ec4899" />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Market Intelligence
                            </Typography>
                        </Box>

                        <Box sx={{ minHeight: '300px' }}>
                            {stockResponse ? (
                                <StockResponseFormatter responseData={stockResponse} />
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 300, opacity: 0.5 }}>
                                    <TrendingUp size={48} strokeWidth={1} />
                                    <Typography sx={{ mt: 2, color: 'var(--text-muted)' }}>
                                        Fetch data to generate market insights
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default StockDashboard;


