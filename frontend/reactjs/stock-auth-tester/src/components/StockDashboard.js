import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Alert, Paper } from '@mui/material';
import AsyncSelect from 'react-select/async';
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
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Chart
                    symbol={selectedStock?.value}
                    candleData={candleData}
                    darkMode={darkMode}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <Card sx={{
                    height: '100%',
                    background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Stock Actions
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                Search and select a stock:
                            </Typography>
                            <AsyncSelect
                                cacheOptions
                                loadOptions={(inputValue) => searchStocks(inputValue, token)}
                                defaultOptions
                                onChange={onStockSelect}
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
                            sx={{ mb: 2, borderRadius: 2 }}
                            onClick={() => onGetQuote(selectedStock?.value || 'AAPL')}
                            disabled={!token}
                        >
                            Refresh {selectedStock?.value || 'AAPL'} Quote
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            fullWidth
                            sx={{ borderRadius: 2 }}
                            onClick={() => onGetProfile(selectedStock?.value || 'AAPL')}
                            disabled={!token}
                        >
                            Get {selectedStock?.value || 'AAPL'} Company Profile
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
                <Card sx={{
                    height: '100%',
                    background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Data Response
                        </Typography>
                        {stockResponse && (
                            <StockResponseFormatter responseData={stockResponse} />
                        )}
                        {!stockResponse && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                                <Typography color="textSecondary">No data fetched yet</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default StockDashboard;

