import React from 'react';
import { Paper } from '@mui/material';

const StockResponseFormatter = ({ responseData }) => {
    return (
        <div>
            <Paper sx={{ p: 2, mt: 2, maxHeight: 300, overflow: 'auto' }}>
                <ul>
                    {Object.entries(responseData).map(([key, value]) => {
                        return (
                            <li>The {key} is {value}</li>
                        )
                    })}
                </ul>
            </Paper>
        </div>
    )
}

export default StockResponseFormatter;