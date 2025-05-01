import { formatNumber } from '../utils.js';

// Hàm lọc và hiển thị coin quá bán (RSI < 30)
export function filterOversoldCoins() {
    const coinCards = document.querySelectorAll('.coin-card');
    const oversoldCoins = [];

    coinCards.forEach(card => {
        const coinName = card.querySelector('.coin-name').textContent;
        const rsi6 = parseFloat(card.querySelector('[data-rsi-type="6"]').textContent);
        const rsi12 = parseFloat(card.querySelector('[data-rsi-type="12"]').textContent);
        const rsi24 = parseFloat(card.querySelector('[data-rsi-type="24"]').textContent);

        // Tìm RSI thấp nhất trong 3 khung thời gian
        const minRSI = Math.min(rsi6, rsi12, rsi24);

        if (minRSI < 30) {
            oversoldCoins.push({
                name: coinName,
                rsi6,
                rsi12,
                rsi24,
                minRSI
            });
        }
    });

    // Sắp xếp từ thấp đến cao theo minRSI
    oversoldCoins.sort((a, b) => a.minRSI - b.minRSI);

    // Tạo HTML kết quả
    const resultsContainer = document.getElementById('resultsContainer');
    if (oversoldCoins.length > 0) {
        let resultHTML = '<div class="oversold-list"><h3>Coin quá bán (RSI < 30) - Sắp xếp từ thấp đến cao:</h3><ul>';

        oversoldCoins.forEach(coin => {
            resultHTML += `
                <li>
                    <span class="coin-name-display">${coin.name}</span>
                    <span class="min-rsi">Min RSI: ${coin.minRSI.toFixed(2)}</span>
                    <span class="rsi-value rsi-6">RSI6: ${coin.rsi6.toFixed(2)}</span>
                    <span class="rsi-value rsi-12">RSI12: ${coin.rsi12.toFixed(2)}</span>
                    <span class="rsi-value rsi-24">RSI24: ${coin.rsi24.toFixed(2)}</span>
                </li>`;
        });

        resultHTML += '</ul></div>';
        resultsContainer.innerHTML = resultHTML;
    } else {
        resultsContainer.innerHTML = '<div class="info">Không có coin nào quá bán (RSI < 30)</div>';
    }
}