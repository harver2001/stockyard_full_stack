import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, Shield, Zap, ArrowRight, Github } from 'lucide-react';
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';

const LandingPage = ({ onLoginOpen, onRegisterOpen }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const features = [
        {
            icon: <TrendingUp className="text-primary" size={32} color="#6366f1" />,
            title: "Real-time Tracking",
            description: "Get up-to-the-minute stock quotes and market data from leading exchanges."
        },
        {
            icon: <BarChart2 className="text-primary" size={32} color="#8b5cf6" />,
            title: "Advanced Analytics",
            description: "Analyze historical performance with interactive charts and technical indicators."
        },
        {
            icon: <Shield className="text-primary" size={32} color="#ec4899" />,
            title: "Secure Portfolio",
            description: "Manage your investments securely with encrypted data and private access."
        },
        {
            icon: <Zap className="text-primary" size={32} color="#6366f1" />,
            title: "Instant Insights",
            description: "Receive personalized insights and market news tailored to your interests."
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', pt: 12, pb: 8 }}>
            <Container maxWidth="lg">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Hero Section */}
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <motion.div variants={itemVariants}>
                            <Typography
                                variant="h1"
                                className="gradient-text"
                                sx={{
                                    fontSize: { xs: '3rem', md: '5rem' },
                                    fontWeight: 800,
                                    mb: 2,
                                    lineHeight: 1.1
                                }}
                            >
                                Track Your Wealth <br />
                                <span style={{ color: '#6366f1' }}>With Confidence</span>
                            </Typography>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'var(--text-muted)',
                                    mb: 6,
                                    maxWidth: '700px',
                                    mx: 'auto',
                                    fontWeight: 400
                                }}
                            >
                                The ultimate platform for modern investors. Monitor stocks, analyze trends, and grow your portfolio with professional-grade tools.
                            </Typography>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    onClick={onRegisterOpen}
                                    variant="contained"
                                    className="btn-primary"
                                    size="large"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        textTransform: 'none',
                                        borderRadius: '12px'
                                    }}
                                    endIcon={<ArrowRight size={20} />}
                                >
                                    Start Investing Today
                                </Button>
                                <Button
                                    onClick={onLoginOpen}
                                    variant="outlined"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        textTransform: 'none',
                                        borderRadius: '12px',
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        color: '#fff',
                                        '&:hover': {
                                            borderColor: '#fff',
                                            backgroundColor: 'rgba(255,255,255,0.05)'
                                        }
                                    }}
                                >
                                    Login to Account
                                </Button>
                            </Box>
                        </motion.div>
                    </Box>

                    {/* Features Grid */}
                    <Grid container spacing={4} sx={{ mb: 12 }}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <motion.div variants={itemVariants}>
                                    <Card className="glass-card" sx={{ height: '100%', border: 'none' }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Box sx={{ mb: 2 }}>
                                                {feature.icon}
                                            </Box>
                                            <Typography variant="h6" sx={{ color: '#fff', mb: 1.5, fontWeight: 700 }}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                                {feature.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Call to Action */}
                    <motion.div variants={itemVariants}>
                        <Box
                            className="glass-card"
                            sx={{
                                p: { xs: 4, md: 8 },
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)'
                            }}
                        >
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
                                Ready to take control?
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'var(--text-muted)', mb: 4, maxWidth: '600px', mx: 'auto' }}>
                                Join thousands of traders who use ShareTracker to navigate the markets. Free to start, powerful enough to scale.
                            </Typography>
                            <Button
                                onClick={onRegisterOpen}
                                variant="contained"
                                className="btn-primary"
                                size="large"
                                sx={{ px: 6, borderRadius: '12px' }}
                            >
                                Create Free Account
                            </Button>
                        </Box>
                    </motion.div>
                </motion.div>
            </Container>
        </Box>
    );
};

export default LandingPage;
