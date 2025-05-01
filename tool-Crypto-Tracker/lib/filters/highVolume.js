import { formatNumber } from '../utils.js';

// Hàm tính volume
export async function calculateVolume(symbol) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';

    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        const data = await response.json();

        if (data.quoteVolume) {
            return parseFloat(data.quoteVolume); // Trả về khối lượng giao dịch theo USDT
        } else {
            console.warn(`Không tìm thấy dữ liệu quoteVolume cho ${symbol}`);
            return null;
        }
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu quoteVolume cho ${symbol}:`, error);
        return null;
    }
}

// Hàm lọc và hiển thị coin có khối lượng giao dịch cao
export async function filterHighVolumeCoins() {
    const coinCards = document.querySelectorAll('.coin-card');
    const highVolumeCoins = [];

    for (const card of coinCards) {
        const coinName = card.querySelector('.coin-name').textContent;
        const symbol = `${coinName}USDT`; // Thêm USDT vào tên coin

        try {
            const volume = await calculateVolume(symbol);

            if (volume !== null && volume > 0) {
                highVolumeCoins.push({
                    name: coinName,
                    volume
                });
            }
        } catch (error) {
            console.error(`Lỗi khi xử lý ${symbol}:`, error);
            continue;
        }
    }

    // Sắp xếp từ cao xuống thấp theo khối lượng
    highVolumeCoins.sort((a, b) => b.volume - a.volume);

    // Tạo HTML kết quả
    const resultsContainer = document.getElementById('resultsContainer');
    if (highVolumeCoins.length > 0) {
        let resultHTML = '<div class="high-volume-list"><h3>Coin có khối lượng giao dịch cao trong 24h - Sắp xếp từ cao xuống thấp:</h3><ul>';

        highVolumeCoins.forEach(coin => {
            resultHTML += `
                <li>
                    <span class="coin-name-display">${coin.name}</span>
                    <span class="volume">Khối lượng:</span>
                    <span class="volume-value">${formatNumber(coin.volume)} USDT</span>
                </li>`;
        });

        resultHTML += '</ul></div>';
        resultsContainer.innerHTML = resultHTML;
    } else {
        resultsContainer.innerHTML = '<div class="info">Không có coin nào có khối lượng giao dịch cao trong 24h</div>';
    }
}