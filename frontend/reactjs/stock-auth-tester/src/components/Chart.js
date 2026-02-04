import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Box, Paper, Typography, useTheme } from '@mui/material';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale
);

const StockChart = ({ symbol, candleData, darkMode }) => {
    // const theme = useTheme();

    const chartData = useMemo(() => {
        if (!candleData || !candleData.t) return null;

        const labels = candleData.t.map(t => new Date(t * 1000));
        const prices = candleData.c;

        const isPositive = prices[prices.length - 1] >= prices[0];
        const primaryColor = isPositive ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';
        const gradientColor = isPositive ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)';

        return {
            labels,
            datasets: [
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
                },
            ],
        };
    }, [candleData, symbol]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: darkMode ? '#fff' : '#000',
                bodyColor: darkMode ? '#fff' : '#000',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        return `Price: $${context.parsed.y.toFixed(2)}`;
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
                }
            },
            y: {
                grid: {
                    color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    callback: (value) => `$${value}`
                }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
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
            height: 400,
            width: '100%',
            p: 2,
            background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            mt: 2
        }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {symbol} Performance
            </Typography>
            <Box sx={{ height: 320 }}>
                {chartData && <Line data={chartData} options={options} />}
            </Box>
        </Box>
    );
};

export default StockChart;