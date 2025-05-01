// Hàm định dạng số
export function formatNumber(num, decimals = 2) {
    if (num >= 1000) {
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    return num.toFixed(decimals);
}

// Hàm tìm kiếm coin
export function filterCoins(searchTerm) {
    const coinCards = document.querySelectorAll('.coin-card');

    coinCards.forEach(card => {
        const coinName = card.getAttribute('data-coin');
        if (coinName.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}