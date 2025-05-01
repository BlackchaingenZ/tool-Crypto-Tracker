// auth.js
export function initAuth(showMainCallback) {
    const KEY_LIST_URL = 'https://raw.githubusercontent.com/BlackchaingenZ/KEY_TOOL-CRYPTO-TRACKER/refs/heads/main/keys.json';
    const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');
    const keyInput = document.getElementById('key-input');
    const submitBtn = document.getElementById('submit-key');
    const errorMessage = document.getElementById('error-message');

    // Ẩn main content ban đầu
    mainContent.style.display = 'none';

    // Kiểm tra trạng thái đăng nhập
    chrome.storage.local.get(['isAuthenticated'], (result) => {
        if (result.isAuthenticated) {
            showMainContent();
        }
    });

    submitBtn.addEventListener('click', async () => {
        const userKey = keyInput.value.trim();
        try {
            const response = await fetch(KEY_LIST_URL);
            const validKeys = await response.json();

            if (validKeys.includes(userKey)) {
                chrome.storage.local.set({ isAuthenticated: true });
                showMainContent();
            } else {
                showError('Mã khóa không hợp lệ');
            }
        } catch (error) {
            showError('Lỗi kết nối đến server');
        }
    });

    function showMainContent() {
        loginContainer.style.display = 'none';
        mainContent.style.display = 'block';
        if (typeof showMainCallback === 'function') {
            showMainCallback();
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
}