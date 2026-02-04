const API_BASE_AUTH = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const API_BASE_STOCK = process.env.REACT_APP_STOCK_URL || 'http://localhost:5002';

export const login = async (loginForm) => {
    const response = await fetch(`${API_BASE_AUTH}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
    });
    return response.json();
};

export const register = async (registerForm) => {
    const response = await fetch(`${API_BASE_AUTH}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
    });
    return response.json();
};

export const fetchStockQuote = async (symbol, token) => {
    const response = await fetch(`${API_BASE_STOCK}/api/v1/stock/quote/${symbol}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const fetchCompanyProfile = async (symbol, token) => {
    const response = await fetch(`${API_BASE_STOCK}/api/v1/stock/company/${symbol}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const searchStocks = async (inputValue, token) => {
    const response = await fetch(`${API_BASE_STOCK}/api/v1/stock/search-list?q=${inputValue}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await response.json();
    if (data.error) return [];
    return data.map(item => ({
        value: item.symbol,
        label: `${item.symbol} - ${item.description}`
    }));
};

export const fetchStockCandles = async (symbol, period = '1y', interval = '1d', token) => {
    const response = await fetch(`${API_BASE_STOCK}/api/v1/stock/stock-candles?symbol=${symbol}&period=${period}&interval=${interval}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};
