import pandas as pd
import numpy as np

def calculate_rsi(prices, period=14):
    if len(prices) < period:
        return [50.0] * len(prices)
    
    series = pd.Series(prices)
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    
    # Wilder's Exponential Moving Average
    avg_gain = gain.ewm(alpha=1/period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, adjust=False).mean()
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    rsi = rsi.fillna(50.0)
    return rsi.tolist()

def calculate_macd(prices, fast_period=12, slow_period=26, signal_period=9):
    if len(prices) < slow_period:
        return [0.0] * len(prices), [0.0] * len(prices), [0.0] * len(prices)
        
    series = pd.Series(prices)
    ema_fast = series.ewm(span=fast_period, adjust=False).mean()
    ema_slow = series.ewm(span=slow_period, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
    macd_histogram = macd_line - signal_line
    
    macd_line = macd_line.fillna(0.0)
    signal_line = signal_line.fillna(0.0)
    macd_histogram = macd_histogram.fillna(0.0)
    
    return macd_line.tolist(), signal_line.tolist(), macd_histogram.tolist()

def calculate_ema(prices, period):
    if len(prices) < period:
        return prices
        
    series = pd.Series(prices)
    ema = series.ewm(span=period, adjust=False).mean()
    ema = ema.fillna(series)
    return ema.tolist()

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    if len(prices) < period:
        return prices, prices, prices
        
    series = pd.Series(prices)
    middle_band = series.rolling(window=period).mean()
    std = series.rolling(window=period).std()
    upper_band = middle_band + (std_dev * std)
    lower_band = middle_band - (std_dev * std)
    
    middle_band = middle_band.fillna(series)
    upper_band = upper_band.fillna(series)
    lower_band = lower_band.fillna(series)
    
    return upper_band.tolist(), middle_band.tolist(), lower_band.tolist()

def get_prediction_verdict(rsi_list, macd_list, signal_list, hist_list, ema20_list, ema50_list, bb_upper_list, bb_lower_list, prices):
    if not prices or len(prices) < 2:
        return {
            'verdict': 'HOLD',
            'confidence': 50,
            'rsi': 50.0,
            'macd': 0.0,
            'signal': 0.0,
            'histogram': 0.0,
            'ema20': prices[-1] if prices else 0.0,
            'ema50': prices[-1] if prices else 0.0,
            'bb_upper': prices[-1] if prices else 0.0,
            'bb_lower': prices[-1] if prices else 0.0,
            'reasons': ['Insufficient price history for technical analysis.']
        }
        
    current_price = prices[-1]
    prev_price = prices[-2] if len(prices) > 1 else current_price
    
    current_rsi = rsi_list[-1]
    
    current_macd = macd_list[-1]
    prev_macd = macd_list[-2] if len(macd_list) > 1 else current_macd
    current_signal = signal_list[-1]
    prev_signal = signal_list[-2] if len(signal_list) > 1 else current_signal
    current_hist = hist_list[-1]
    prev_hist = hist_list[-2] if len(hist_list) > 1 else current_hist
    
    current_ema20 = ema20_list[-1]
    prev_ema20 = ema20_list[-2] if len(ema20_list) > 1 else current_ema20
    current_ema50 = ema50_list[-1]
    prev_ema50 = ema50_list[-2] if len(ema50_list) > 1 else current_ema50
    
    current_bb_upper = bb_upper_list[-1]
    current_bb_lower = bb_lower_list[-1]
    
    score = 0
    reasons = []
    
    # 1. RSI Indicator
    if current_rsi < 30:
        score += 35
        reasons.append(f"RSI is oversold at {current_rsi:.2f}, indicating a high probability of a bullish price correction.")
    elif current_rsi < 40:
        score += 15
        reasons.append(f"RSI is moderately low at {current_rsi:.2f}, reflecting building buying interest.")
    elif current_rsi > 70:
        score -= 35
        reasons.append(f"RSI is overbought at {current_rsi:.2f}, indicating the stock may be overextended and due for a pullback.")
    elif current_rsi > 60:
        score -= 15
        reasons.append(f"RSI is moderately high at {current_rsi:.2f}, reflecting increasing selling pressure.")
    else:
        reasons.append(f"RSI is neutral at {current_rsi:.2f}, suggesting balanced supply and demand.")
        
    # 2. MACD Indicator
    bullish_macd_crossover = (prev_macd <= prev_signal) and (current_macd > current_signal)
    bearish_macd_crossover = (prev_macd >= prev_signal) and (current_macd < current_signal)
    
    if bullish_macd_crossover:
        score += 30
        reasons.append("MACD line crossed above the signal line (Bullish Crossover), indicating the start of upward momentum.")
    elif bearish_macd_crossover:
        score -= 30
        reasons.append("MACD line crossed below the signal line (Bearish Crossover), indicating the start of downward momentum.")
    elif current_macd > current_signal:
        score += 10
        if current_hist > prev_hist:
            score += 5
            reasons.append("MACD is bullish and divergence is expanding, showing accelerating upward momentum.")
        else:
            reasons.append("MACD is bullish but momentum is decelerating.")
    elif current_macd < current_signal:
        score -= 10
        if current_hist < prev_hist:
            score -= 5
            reasons.append("MACD is bearish and divergence is expanding, showing accelerating downward momentum.")
        else:
            reasons.append("MACD is bearish but momentum is slowing.")
            
    # 3. EMA Trend Overlays
    price_above_ema20 = current_price > current_ema20
    price_above_ema50 = current_price > current_ema50
    
    ema_bullish_crossover = (prev_ema20 <= prev_ema50) and (current_ema20 > current_ema50)
    ema_bearish_crossover = (prev_ema20 >= prev_ema50) and (current_ema20 < current_ema50)
    
    if ema_bullish_crossover:
        score += 25
        reasons.append("EMA-20 crossed above EMA-50 (Bullish Golden Cross), indicating a strong medium-term uptrend.")
    elif ema_bearish_crossover:
        score -= 25
        reasons.append("EMA-20 crossed below EMA-50 (Bearish Death Cross), indicating a strong medium-term downtrend.")
    elif price_above_ema20 and price_above_ema50:
        score += 10
        reasons.append("Price is trading above both the 20-day and 50-day EMAs, confirming a strong bullish trend.")
    elif not price_above_ema20 and not price_above_ema50:
        score -= 10
        reasons.append("Price is trading below both the 20-day and 50-day EMAs, confirming a strong bearish trend.")
    else:
        reasons.append("EMA indicators show a mixed/neutral trend alignment.")
        
    # 4. Bollinger Bands (Volatility and range breakouts)
    if current_price <= current_bb_lower:
        score += 25
        reasons.append(f"Price (${current_price:.2f}) broke below the Lower Bollinger Band (${current_bb_lower:.2f}), suggesting it is extremely oversold.")
    elif current_price >= current_bb_upper:
        score -= 25
        reasons.append(f"Price (${current_price:.2f}) broke above the Upper Bollinger Band (${current_bb_upper:.2f}), suggesting it is extremely overbought.")
        
    # Determine verdict and confidence
    if score >= 35:
        verdict = 'BUY'
        confidence = min(98, int(50 + (score / 125.0) * 48))
    elif score <= -35:
        verdict = 'SELL'
        confidence = min(98, int(50 + (abs(score) / 125.0) * 48))
    else:
        verdict = 'HOLD'
        confidence = int(100 - abs(score) * 1.8)
        
    return {
        'verdict': verdict,
        'confidence': confidence,
        'rsi': round(current_rsi, 2),
        'macd': round(current_macd, 4),
        'signal': round(current_signal, 4),
        'histogram': round(current_hist, 4),
        'ema20': round(current_ema20, 2),
        'ema50': round(current_ema50, 2),
        'bb_upper': round(current_bb_upper, 2),
        'bb_lower': round(current_bb_lower, 2),
        'reasons': reasons
    }
