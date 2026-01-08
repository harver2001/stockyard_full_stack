import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Alert, Paper } from '@mui/material';
import AsyncSelect from 'react-select/async';
import { searchStocks } from '../services/api';

const StockDashboard = ({
    darkMode,
    token,
    selectedStock,
    onStockSelect,
    onGetQuote,
    onGetProfile,
    stockResponse
}) => {
    return (
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
                                loadOptions={searchStocks}
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
                            sx={{ mb: 2 }}
                            onClick={() => onGetQuote(selectedStock?.value || 'AAPL')}
                            disabled={!token}
                        >
                            Refresh {selectedStock?.value || 'AAPL'} Quote
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
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
    );
};

export default StockDashboard;
