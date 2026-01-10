import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

const Logout = ({ onLogout }) => {
    return (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center', mt: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                You are currently logged in
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You have access to all stock features.
            </Typography>
            <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={onLogout}
            >
                Logout
            </Button>
        </Paper>
    );
};

export default Logout;
