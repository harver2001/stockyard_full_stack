import React, { useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup, FormControlLabel, Switch } from '@mui/material';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale
);

const StockChart = ({ symbol, candleData, darkMode }) => {
    const [activeTab, setActiveTab] = useState('price');
    const [showEma20, setShowEma20] = useState(false);
    const [showEma50, setShowEma50] = useState(false);
    const [showBB, setShowBB] = useState(false);

    const chartData = useMemo(() => {
        if (!candleData || !candleData.t) return null;

        const labels = candleData.t.map(t => new Date(t * 1000));
        const prices = candleData.c;

        if (activeTab === 'price') {
            const isPositive = prices[prices.length - 1] >= prices[0];
            const primaryColor = isPositive ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';
            const gradientColor = isPositive ? 'rgba(75, 192, 192, 0.15)' : 'rgba(255, 99, 132, 0.15)';

            const datasets = [
                {
                    label: `${symbol} Price`,
                    data: prices,
                    borderColor: primaryColor,
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) return null;
                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, gradientColor);
                        gradient.addColorStop(1, 'transparent');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    borderWidth: 2,
                }
            ];

            if (showEma20 && candleData.ema20) {
                datasets.push({
                    label: 'EMA 20',
                    data: candleData.ema20,
                    borderColor: '#f59e0b', // Amber
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    borderWidth: 1.5,
                });
            }

            if (showEma50 && candleData.ema50) {
                datasets.push({
                    label: 'EMA 50',
                    data: candleData.ema50,
                    borderColor: '#3b82f6', // Blue
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    borderWidth: 1.5,
                });
            }

            if (showBB && candleData.bb_upper && candleData.bb_lower) {
                // Bollinger Upper
                datasets.push({
                    label: 'BB Upper',
                    data: candleData.bb_upper,
                    borderColor: 'rgba(168, 85, 247, 0.6)', // Purple
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1,
                });
                // Bollinger Middle
                if (candleData.bb_middle) {
                    datasets.push({
                        label: 'BB Middle (SMA 20)',
                        data: candleData.bb_middle,
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                        fill: false,
                        pointRadius: 0,
                        borderWidth: 1,
                    });
                }
                // Bollinger Lower
                datasets.push({
                    label: 'BB Lower',
                    data: candleData.bb_lower,
                    borderColor: 'rgba(168, 85, 247, 0.6)',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1,
                });
            }

            return { labels, datasets };
        } else if (activeTab === 'rsi') {
            const rsi = candleData.rsi || [];
            return {
                labels,
                datasets: [
                    {
                        label: 'RSI (14)',
                        data: rsi,
                        borderColor: '#818cf8', // Indigo
                        backgroundColor: 'rgba(129, 140, 248, 0.1)',
                        fill: true,
                        tension: 0.1,
                        pointRadius: 0,
                        borderWidth: 2,
                    },
                    {
                        label: 'Overbought (70)',
                        data: Array(labels.length).fill(70),
                        borderColor: 'rgba(239, 68, 68, 0.4)', // Light red dashed
                        borderDash: [4, 4],
                        fill: false,
                        pointRadius: 0,
                        borderWidth: 1,
                    },
                    {
                        label: 'Oversold (30)',
                        data: Array(labels.length).fill(30),
                        borderColor: 'rgba(16, 185, 129, 0.4)', // Light green dashed
                        borderDash: [4, 4],
                        fill: false,
                        pointRadius: 0,
                        borderWidth: 1,
                    }
                ]
            };
        } else if (activeTab === 'macd') {
            const macd = candleData.macd || [];
            const signal = candleData.signal || [];
            const histogram = candleData.histogram || [];

            return {
                labels,
                datasets: [
                    {
                        label: 'MACD',
                        data: macd,
                        borderColor: '#3b82f6', // Blue
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,
                        borderWidth: 1.5,
                    },
                    {
                        label: 'Signal',
                        data: signal,
                        borderColor: '#f97316', // Orange
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,
                        borderWidth: 1.5,
                    },
                    {
                        label: 'Histogram',
                        type: 'bar',
                        data: histogram,
                        backgroundColor: histogram.map(val => val >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'),
                        borderColor: histogram.map(val => val >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
                        borderWidth: 1,
                        barThickness: 'flex',
                        maxBarThickness: 3,
                    }
                ]
            };
        }

        return null;
    }, [candleData, symbol, activeTab, showEma20, showEma50, showBB]);

    const options = useMemo(() => {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: activeTab === 'macd' || (activeTab === 'price' && (showEma20 || showEma50 || showBB)),
                    position: 'top',
                    labels: {
                        color: darkMode ? '#fff' : '#000',
                        font: { size: 10, weight: 600 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: darkMode ? '#fff' : '#000',
                    bodyColor: darkMode ? '#fff' : '#000',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const val = context.parsed.y;
                            if (val === undefined || val === null) return '';
                            if (activeTab === 'price') {
                                return `${label}: $${val.toFixed(2)}`;
                            } else if (activeTab === 'rsi') {
                                return `${label}: ${val.toFixed(2)}`;
                            } else {
                                return `${label}: ${val.toFixed(4)}`;
                            }
                        }
                    }
                },
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        font: { size: 10 }
                    }
                },
                y: {
                    grid: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    },
                    ticks: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        font: { size: 10 },
                        callback: (value) => {
                            if (activeTab === 'price') return `$${value}`;
                            return value;
                        }
                    }
                },
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        };

        if (activeTab === 'rsi') {
            baseOptions.scales.y.min = 0;
            baseOptions.scales.y.max = 100;
        }

        return baseOptions;
    }, [activeTab, showEma20, showEma50, showBB, darkMode]);

    const handleTabChange = (event, newTab) => {
        if (newTab !== null) {
            setActiveTab(newTab);
        }
    };

    if (!candleData) {
        return (
            <Paper
                sx={{
                    p: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 300,
                    background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Typography color="textSecondary">Select a stock to view chart</Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{
            height: 420,
            width: '100%',
            p: 2,
            background: darkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                    {symbol} Performance
                </Typography>
                
                <ToggleButtonGroup
                    value={activeTab}
                    exclusive
                    onChange={handleTabChange}
                    size="small"
                    sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        p: '2px',
                        '& .MuiToggleButton-root': {
                            border: 'none',
                            borderRadius: '8px',
                            color: 'rgba(255,255,255,0.6)',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2,
                            py: 0.5,
                            '&.Mui-selected': {
                                color: '#fff',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                }
                            },
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.08)'
                            }
                        }
                    }}
                >
                    <ToggleButton value="price">Price</ToggleButton>
                    <ToggleButton value="rsi">RSI</ToggleButton>
                    <ToggleButton value="macd">MACD</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {activeTab === 'price' && (
                <Box sx={{ display: 'flex', gap: 3, px: 1, flexWrap: 'wrap' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={showEma20}
                                onChange={(e) => setShowEma20(e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#f59e0b' },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#f59e0b' }
                                }}
                            />
                        }
                        label={<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>EMA 20</Typography>}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={showEma50}
                                onChange={(e) => setShowEma50(e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#3b82f6' },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3b82f6' }
                                }}
                            />
                        }
                        label={<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>EMA 50</Typography>}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={showBB}
                                onChange={(e) => setShowBB(e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#a855f7' },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#a855f7' }
                                }}
                            />
                        }
                        label={<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Bollinger Bands</Typography>}
                    />
                </Box>
            )}

            <Box sx={{ flex: 1, position: 'relative', minHeight: 280 }}>
                {chartData && <Line data={chartData} options={options} />}
            </Box>
        </Box>
    );
};
 
export default StockChart;