import React from 'react';
import { Modal, Box, Typography, TextField, Button, Backdrop, Fade } from '@mui/material';
import { Lock, UserPlus } from 'lucide-react';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 },
    background: 'var(--card-bg)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    p: 4,
    borderRadius: '24px',
    outline: 'none'
};

const inputStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#6366f1',
        },
    },
    '& .MuiInputLabel-root': {
        color: 'var(--text-muted)',
    },
    '& .MuiInputBase-input': {
        color: '#fff',
    }
};

export const LoginModal = ({ open, onClose, form, setForm, onSubmit, loading }) => (
    <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
            backdrop: {
                timeout: 500,
                sx: { background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)' }
            },
        }}
    >
        <Fade in={open}>
            <Box sx={modalStyle}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '16px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                        }}
                    >
                        <Lock color="#6366f1" size={28} />
                    </Box>
                    <Typography id="login-modal-title" variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 1 }}>
                        Securely access your market dashboard
                    </Typography>
                </Box>

                <form onSubmit={onSubmit}>
                    <TextField
                        fullWidth
                        label="Username or Email"
                        value={form.username_or_email}
                        onChange={(e) => setForm({ ...form, username_or_email: e.target.value })}
                        margin="normal"
                        required
                        sx={inputStyle}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        margin="normal"
                        required
                        sx={inputStyle}
                    />
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            className="btn-primary"
                            fullWidth
                            disabled={loading}
                            sx={{ py: 1.5, textTransform: 'none', fontWeight: 700 }}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                        <Button
                            variant="text"
                            fullWidth
                            onClick={onClose}
                            sx={{ color: 'var(--text-muted)', textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Box>
        </Fade>
    </Modal>
);

export const RegisterModal = ({ open, onClose, form, setForm, onSubmit, loading }) => (
    <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
            backdrop: {
                timeout: 500,
                sx: { background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)' }
            },
        }}
    >
        <Fade in={open}>
            <Box sx={modalStyle}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '16px',
                            background: 'rgba(236, 72, 153, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                        }}
                    >
                        <UserPlus color="#ec4899" size={28} />
                    </Box>
                    <Typography id="register-modal-title" variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
                        Create Account
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 1 }}>
                        Join the future of investment tracking
                    </Typography>
                </Box>

                <form onSubmit={onSubmit}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        margin="normal"
                        required
                        sx={inputStyle}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        margin="normal"
                        required
                        sx={inputStyle}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        margin="normal"
                        required
                        sx={inputStyle}
                    />
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            className="btn-primary"
                            sx={{
                                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 700
                            }}
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Get Started'}
                        </Button>
                        <Button
                            variant="text"
                            fullWidth
                            onClick={onClose}
                            sx={{ color: 'var(--text-muted)', textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Box>
        </Fade>
    </Modal>
);

