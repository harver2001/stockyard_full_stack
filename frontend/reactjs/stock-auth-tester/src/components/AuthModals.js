import React from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

export const LoginModal = ({ open, onClose, form, setForm, onSubmit, loading }) => (
    <Modal open={open} onClose={onClose} aria-labelledby="login-modal-title">
        <Box sx={modalStyle}>
            <Typography id="login-modal-title" variant="h6" component="h2" gutterBottom>
                Login
            </Typography>
            <form onSubmit={onSubmit}>
                <TextField
                    fullWidth
                    label="Username or Email"
                    value={form.username_or_email}
                    onChange={(e) => setForm({ ...form, username_or_email: e.target.value })}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    margin="normal"
                    required
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" fullWidth disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Button variant="outlined" fullWidth onClick={onClose}>
                        Cancel
                    </Button>
                </Box>
            </form>
        </Box>
    </Modal>
);

export const RegisterModal = ({ open, onClose, form, setForm, onSubmit, loading }) => (
    <Modal open={open} onClose={onClose} aria-labelledby="register-modal-title">
        <Box sx={modalStyle}>
            <Typography id="register-modal-title" variant="h6" component="h2" gutterBottom>
                Register
            </Typography>
            <form onSubmit={onSubmit}>
                <TextField
                    fullWidth
                    label="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    margin="normal"
                    required
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" fullWidth disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                    <Button variant="outlined" fullWidth onClick={onClose}>
                        Cancel
                    </Button>
                </Box>
            </form>
        </Box>
    </Modal>
);
