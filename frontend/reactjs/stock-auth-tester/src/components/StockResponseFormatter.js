import React from 'react';
import { Box, Typography, Divider, Grid } from '@mui/material';

const StockResponseFormatter = ({ responseData }) => {
    if (!responseData || typeof responseData !== 'object') {
        return <Typography color="text.secondary">Invalid data format</Typography>;
    }

    // Exclude error or detail keys if they exist in success response
    const entries = Object.entries(responseData).filter(([key]) => key !== 'error' && key !== 'detail');

    return (
        <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
                {entries.map(([key, value]) => {
                    const formattedKey = key.replace(/_/g, ' ').toUpperCase();
                    let displayValue = value;

                    if (typeof value === 'number') {
                        displayValue = value % 1 === 0 ? value.toLocaleString() : value.toFixed(2).toLocaleString();
                    } else if (typeof value === 'boolean') {
                        displayValue = value ? 'Yes' : 'No';
                    } else if (value === null || value === undefined) {
                        displayValue = 'N/A';
                    }

                    return (
                        <Grid item xs={12} key={key}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                                <Typography
                                    sx={{
                                        color: 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    {formattedKey}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {displayValue}
                                </Typography>
                            </Box>
                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                        </Grid>
                    )
                })}
            </Grid>
        </Box>
    );
};

export default StockResponseFormatter;