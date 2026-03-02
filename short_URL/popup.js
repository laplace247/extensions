document.addEventListener('DOMContentLoaded', function() {
    const shortenCustomBtn = document.getElementById('shorten-custom-btn');
    const customUrlInput = document.getElementById('custom-url');
    const shortUrlInput = document.getElementById('short-url');
    const statusDiv = document.getElementById('status');

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = type;
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = '';
        }, 3000);
    }

    function shortenUrl(url, button) {
        if (!url.startsWith('http')) {
            showStatus('URL no válida', 'error');
            return;
        }

        button.disabled = true;
        showStatus('Acortando...', '');

        fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url))
            .then(response => response.text())
            .then(shortUrl => {
                shortUrlInput.value = shortUrl;
                navigator.clipboard.writeText(shortUrl);
                showStatus('¡Copiado al portapapeles!', 'success');
            })
            .catch(() => {
                showStatus('Error al acortar URL', 'error');
            })
            .finally(() => {
                button.disabled = false;
            });
    }

    shortenCustomBtn.addEventListener('click', function() {
        const url = customUrlInput.value.trim();
        if (!url) {
            showStatus('Ingresa una URL', 'error');
            return;
        }
        shortenUrl(url, shortenCustomBtn);
    });

    const copyBtn = document.getElementById('copy-btn');

    function copyToClipboard() {
        if (shortUrlInput.value) {
            navigator.clipboard.writeText(shortUrlInput.value);
            showStatus('¡Copiado!', 'success');
        }
    }

    shortUrlInput.addEventListener('click', copyToClipboard);
    copyBtn.addEventListener('click', copyToClipboard);
});