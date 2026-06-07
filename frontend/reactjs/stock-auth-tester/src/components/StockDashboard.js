import { Grid, Card, CardContent, Typography, Box, Button, Alert, Modal, Paper, TextField, IconButton } from '@mui/material';
import AsyncSelect from 'react-select/async';
import { RefreshCcw, Info, Search, TrendingUp, TrendingDown, Activity, Plus, X } from 'lucide-react';
import { searchStocks } from '../services/api';
import StockResponseFormatter from './StockResponseFormatter';
import Chart from './Chart';
import { useState } from 'react';

const RecommendationCard = ({ analysis, loading }) => {
    if (loading) {
        return (
            <Card className="glass-card" sx={{ height: '100%', border: 'none', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'var(--text-muted)' }}>Calculating indicators...</Typography>
            </Card>
        );
    }

    if (!analysis) {
        return (
            <Card className="glass-card" sx={{ height: '100%', border: 'none', minHeight: 420, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, textAlign: 'center', opacity: 0.7 }}>
                <Activity size={48} strokeWidth={1} color="#6366f1" style={{ marginBottom: 16 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#fff' }}>
                    Recommendation Engine
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', maxWidth: 260 }}>
                    Select a stock symbol to generate live technical analysis & entry/exit signals.
                </Typography>
            </Card>
        );
    }

    const { verdict, confidence, rsi, macd, signal, histogram, reasons } = analysis;

    // Set colors & layout based on verdict
    let verdictColor = '#f59e0b';
    let verdictBg = 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)';
    let verdictBorder = 'rgba(245, 158, 11, 0.3)';
    let verdictShadow = '0 0 20px rgba(245, 158, 11, 0.15)';
    let VerdictIcon = Activity;

    if (verdict === 'BUY') {
        verdictColor = '#10b981';
        verdictBg = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)';
        verdictBorder = 'rgba(16, 185, 129, 0.3)';
        verdictShadow = '0 0 20px rgba(16, 185, 129, 0.15)';
        VerdictIcon = TrendingUp;
    } else if (verdict === 'SELL') {
        verdictColor = '#ef4444';
        verdictBg = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)';
        verdictBorder = 'rgba(239, 68, 68, 0.3)';
        verdictShadow = '0 0 20px rgba(239, 68, 68, 0.15)';
        VerdictIcon = TrendingDown;
    }

    return (
        <Card className="glass-card" sx={{ height: '100%', border: 'none', minHeight: 420, display: 'flex', flexDirection: 'column', borderRadius: '24px' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Activity size={20} color="#6366f1" />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
                        Technical Verdict
                    </Typography>
                </Box>

                {/* Verdict Badge */}
                <Box
                    sx={{
                        background: verdictBg,
                        border: `1px solid ${verdictBorder}`,
                        borderRadius: '16px',
                        py: 1.8,
                        px: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: verdictShadow,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <VerdictIcon size={28} color={verdictColor} />
                        <Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                                SIGNAL VERDICT
                            </Typography>
                            <Typography variant="h5" sx={{ color: verdictColor, fontWeight: 900, letterSpacing: '-0.02em' }}>
                                {verdict}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                            CONFIDENCE
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900 }}>
                            {confidence}%
                        </Typography>
                    </Box>
                </Box>

                {/* Quick Indicators Stats */}
                <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 calc(50% - 6px)', p: 1.2, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 700 }}>
                            RSI (14)
                        </Typography>
                        <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 800, mt: 0.5 }}>
                            {rsi}
                        </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 6px)', p: 1.2, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 700 }}>
                            MACD HIST
                        </Typography>
                        <Typography sx={{ color: histogram >= 0 ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: 800, mt: 0.5 }}>
                            {histogram >= 0 ? '+' : ''}{histogram}
                        </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 6px)', p: 1.2, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 700 }}>
                            MACD LINE
                        </Typography>
                        <Typography sx={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 800, mt: 0.5 }}>
                            {macd}
                        </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 6px)', p: 1.2, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 700 }}>
                            SIGNAL LINE
                        </Typography>
                        <Typography sx={{ color: '#f97316', fontSize: '0.85rem', fontWeight: 800, mt: 0.5 }}>
                            {signal}
                        </Typography>
                    </Box>
                </Box>

                {/* Reasons / Justification */}
                <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, maxHeight: 180 }}>
                    <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, mb: 1, letterSpacing: '0.02em' }}>
                        SIGNAL ANALYSIS
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {reasons.map((reason, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <Box sx={{ minWidth: 6, height: 6, borderRadius: '50%', background: '#6366f1', mt: 0.7 }} />
                                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                                    {reason}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

const StockDashboard = ({
    darkMode,
    token,
    selectedStock,
    onStockSelect,
    onGetQuote,
    onGetProfile,
    onAddPortfolio,
    stockResponse,
    candleData,
    loading
}) => {
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setQuantity(1);
    };

    const handleConfirmAdd = () => {
        onAddPortfolio(selectedStock?.value || 'AAPL', quantity);
        handleClose();
    };

    return (
        <Grid container spacing={4}>
            {/* Chart Section */}
            <Grid item xs={12} md={8}>
                <Box className="glass-card" sx={{ p: 1, borderRadius: '24px', overflow: 'hidden' }}>
                    <Chart
                        symbol={selectedStock?.value}
                        candleData={candleData}
                        darkMode={darkMode}
                    />
                </Box>
            </Grid>

            {/* Recommendation Section */}
            <Grid item xs={12} md={4}>
                <RecommendationCard
                    analysis={candleData?.analysis}
                    loading={loading}
                />
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
                                startIcon={<Plus size={18} />}
                                onClick={handleOpen}
                                disabled={!token || loading}
                                sx={{
                                    textTransform: 'none',
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    }
                                }}
                            >
                                Add {selectedStock?.value || 'AAPL'} to Portfolio
                            </Button>

                            <Button
                                variant="outlined"
                                className="btn-secondary"
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

            {/* Quantity Modal */}
            <Modal
                open={open}
                onClose={handleClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <Paper
                    className="glass-card"
                    sx={{
                        p: 4,
                        width: '400px',
                        outline: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        position: 'relative'
                    }}
                >
                    <IconButton
                        onClick={handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
                    >
                        <X size={20} />
                    </IconButton>

                    <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: '#fff' }}>
                        Add to Portfolio
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                        Specify the number of shares for <strong>{selectedStock?.value || 'AAPL'}</strong>
                    </Typography>

                    <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                        sx={{
                            mb: 4,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                            }
                        }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleClose}
                            sx={{ borderRadius: '10px', textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleConfirmAdd}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                            }}
                        >
                            Confirm
                        </Button>
                    </Box>
                </Paper>
            </Modal>
        </Grid>
    );
};

export default StockDashboard;


