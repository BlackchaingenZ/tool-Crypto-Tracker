// Danh sách đồng coin trên Binance
export async function fetchAllUSDTradingPairs() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        const data = await response.json();

        // Lọc các cặp USDT đang giao dịch
        const usdtPairs = data.symbols
            .filter(s =>
                s.quoteAsset === 'USDT' &&
                s.status === 'TRADING' &&
                !s.symbol.includes('_') // Loại bỏ các cặp phái sinh (nếu có)
            )
            .map(s => s.symbol);

        return usdtPairs;
    } catch (error) {
        console.error('Error fetching trading pairs:', error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}

// Hàm tính RSI
export async function calculateRSI(symbol, interval = '1h', period = 14, limit = 100) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        const data = await response.json();
        const closes = data.map(candle => parseFloat(candle[4]));

        if (closes.length < period + 1) return null;

        let gains = 0, losses = 0;
        for (let i = 1; i <= period; i++) {
            const change = closes[i] - closes[i - 1];
            change >= 0 ? gains += change : losses += Math.abs(change);
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        for (let i = period + 1; i < closes.length; i++) {
            const change = closes[i] - closes[i - 1];
            const currentGain = change >= 0 ? change : 0;
            const currentLoss = change < 0 ? Math.abs(change) : 0;

            avgGain = (avgGain * (period - 1) + currentGain) / period;
            avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
        }

        return 100 - (100 / (1 + (avgLoss === 0 ? Infinity : avgGain / avgLoss)));
    } catch (error) {
        console.error(`Error calculating RSI for ${symbol}:`, error);
        return null;
    }
}

// Hàm lấy dữ liệu 24h
export async function get24hrTicker(symbol) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching 24hr data for ${symbol}:`, error);
        return null;
    }
}