import { formatNumber } from '../utils.js';

// Hàm lọc và hiển thị coin quá mua (RSI > 70)
export function filterOverboughtCoins() {
    const coinCards = document.querySelectorAll('.coin-card');
    const overboughtCoins = [];

    coinCards.forEach(card => {
        const coinName = card.querySelector('.coin-name').textContent;
        const rsi6 = parseFloat(card.querySelector('[data-rsi-type="6"]').textContent);
        const rsi12 = parseFloat(card.querySelector('[data-rsi-type="12"]').textContent);
        const rsi24 = parseFloat(card.querySelector('[data-rsi-type="24"]').textContent);

        // Tìm RSI cao nhất trong 3 khung thời gian
        const maxRSI = Math.max(rsi6, rsi12, rsi24);

        if (maxRSI > 70) {
            overboughtCoins.push({
                name: coinName,
                rsi6,
                rsi12,
                rsi24,
                maxRSI
            });
        }
    });

    // Sắp xếp từ cao xuống thấp theo maxRSI
    overboughtCoins.sort((a, b) => b.maxRSI - a.maxRSI);

    // Tạo HTML kết quả
    const resultsContainer = document.getElementById('resultsContainer');
    if (overboughtCoins.length > 0) {
        let resultHTML = '<div class="oversold-list"><h3>Coin quá mua (RSI > 70) - Sắp xếp từ cao xuống thấp:</h3><ul>';

        overboughtCoins.forEach(coin => {
            resultHTML += `
                <li>
                    <span class="coin-name-display">${coin.name}</span>
                    <span class="max-rsi">Max RSI: ${coin.maxRSI.toFixed(2)}</span>
                    <span class="rsi-value rsi-6">RSI6: ${coin.rsi6.toFixed(2)}</span>
                    <span class="rsi-value rsi-12">RSI12: ${coin.rsi12.toFixed(2)}</span>
                    <span class="rsi-value rsi-24">RSI24: ${coin.rsi24.toFixed(2)}</span>
                </li>`;
        });

        resultHTML += '</ul></div>';
        resultsContainer.innerHTML = resultHTML;
    } else {
        resultsContainer.innerHTML = '<div class="info">Không có coin nào quá mua (RSI > 70)</div>';
    }
}