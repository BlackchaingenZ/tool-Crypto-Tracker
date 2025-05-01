import { initAuth } from './auth.js';
import {
    fetchAllUSDTradingPairs,
    calculateRSI,
    get24hrTicker
} from './lib/api.js';
import { formatNumber, filterCoins } from './lib/utils.js';
import {
    filterOverboughtCoins,
    filterOversoldCoins,
    filterHighVolumeCoins,
} from './lib/filters/index.js';

// Xác thực người dùng
document.addEventListener('DOMContentLoaded', () => {
    initAuth(() => {
        document.getElementById('refreshData').addEventListener('click', fetchAndDisplayData);
        fetchAndDisplayData();
    });
});

// Hàm chính để tải và hiển thị dữ liệu
async function fetchAndDisplayData() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';

    try {
        const LIST_COINS = await fetchAllUSDTradingPairs();
        if (LIST_COINS.length === 0) {
            resultsContainer.innerHTML = '<div class="error">Hệ thống quá tải, vui lòng thử lại sau 5 phút</div>';
            return;
        }

        const maxCoinsToFetch = 200;
        const coinsToFetch = LIST_COINS.slice(0, maxCoinsToFetch);

        const BATCH_SIZE = 20; // Giới hạn số lượng xử lý song song
        const allCoinsData = [];

        for (let i = 0; i < coinsToFetch.length; i += BATCH_SIZE) {
            const batch = coinsToFetch.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.all(batch.map(async (symbol) => {
                try {
                    const [rsi6, rsi12, rsi24, tickerData] = await Promise.all([
                        calculateRSI(symbol, '1h', 6),
                        calculateRSI(symbol, '1h', 12),
                        calculateRSI(symbol, '1h', 24),
                        get24hrTicker(symbol)
                    ]);

                    if (!tickerData) return null;

                    return {
                        symbol,
                        rsi6,
                        rsi12,
                        rsi24,
                        tickerData,
                        priceChangePercent: parseFloat(tickerData.priceChangePercent)
                    };
                } catch (error) {
                    console.error(`Lỗi xử lý ${symbol}:`, error);
                    return null;
                }
            }));

            allCoinsData.push(...batchResults.filter(item => item !== null));
        }

        // Sắp xếp và hiển thị
        allCoinsData.sort((a, b) => b.priceChangePercent - a.priceChangePercent);

        const coinsHTML = allCoinsData.map(coin => {
            const { symbol, rsi6, rsi12, rsi24, tickerData } = coin;
            const priceChange = parseFloat(tickerData.priceChange);
            const priceChangePercent = parseFloat(tickerData.priceChangePercent);
            const lastPrice = parseFloat(tickerData.lastPrice);
            const baseVolume = parseFloat(tickerData.volume);
            const quoteVolume = parseFloat(tickerData.quoteVolume);
            const highPrice = parseFloat(tickerData.highPrice);
            const lowPrice = parseFloat(tickerData.lowPrice);

            return `
                <div class="coin-card" data-coin="${symbol.toLowerCase()}">
                    <div class="coin-header">
                        <span class="coin-name">${symbol.replace('USDT', '')}</span>
                        <span class="coin-price ${priceChange >= 0 ? 'positive' : 'negative'}">
                            $${formatNumber(lastPrice)}
                        </span>
                    </div>
                    <div class="coin-data">
                        <div class="data-item">
                            <span class="data-label">24h Change</span>
                            <span class="data-value ${priceChange >= 0 ? 'positive' : 'negative'}">
                                ${priceChangePercent.toFixed(2)}%
                            </span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">RSI(6)</span>
                            <span class="data-value rsi-value" data-rsi-type="6">
                                ${rsi6 ? rsi6.toFixed(2) : 'N/A'}
                            </span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">RSI(12)</span>
                            <span class="data-value rsi-value" data-rsi-type="12">
                                ${rsi12 ? rsi12.toFixed(2) : 'N/A'}
                            </span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">RSI(24)</span>
                            <span class="data-value rsi-value" data-rsi-type="24">
                                ${rsi24 ? rsi24.toFixed(2) : 'N/A'}
                            </span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">24h High</span>
                            <span class="data-value">$${formatNumber(highPrice)}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">24h Low</span>
                            <span class="data-value">$${formatNumber(lowPrice)}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Volume (24h)</span>
                            <span class="data-value">${formatNumber(baseVolume)} ${symbol.replace('USDT', '')}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Vol (USDT)</span>
                            <span class="data-value">$${formatNumber(quoteVolume)}</span>
                        </div>
                    </div>
                </div>`;
        });

        resultsContainer.innerHTML = coinsHTML.join('');
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        resultsContainer.innerHTML = '<div class="error">Đã xảy ra lỗi khi tải dữ liệu</div>';
    }
}

// Sự kiện khi DOM được tải
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('refreshData').addEventListener('click', fetchAndDisplayData);
    document.getElementById('searchInput').addEventListener('input', (e) => filterCoins(e.target.value));
    document.getElementById('filterOversold').addEventListener('click', filterOversoldCoins);
    document.getElementById('filterOverbought').addEventListener('click', filterOverboughtCoins);
    document.getElementById('filterHighVolume').addEventListener('click', filterHighVolumeCoins);
    // Tự động tải dữ liệu khi mở popup
    fetchAndDisplayData();
});


