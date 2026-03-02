// DOM Elements
const elements = {
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    translateFrom: document.getElementById('translateFrom'),
    translateTo: document.getElementById('translateTo'),
    translateBtn: document.getElementById('translateBtn'),
    speakBtn: document.getElementById('speakBtn'),
    copyBtn: document.getElementById('copyBtn'),
    clearBtn: document.getElementById('clearBtn'),
    swapBtn: document.getElementById('swapLangs'),
    themeToggle: document.getElementById('themeToggle'),
    historyBtn: document.getElementById('historyBtn'),
    charCount: document.getElementById('charCount'),
    loading: document.getElementById('loading'),
    voiceSelect: document.getElementById('voiceSelect')
};

// Speech state
let isSpeaking = false;
let availableVoices = [];

// Generate options for language selectors
const generateOptions = () => {
    let options = '';
    for (let code in countries) {
        const name = countries[code].replace(/[<>"'&]/g, (match) => {
            const escapeMap = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
            return escapeMap[match];
        });
        options += `<option value="${code}">${name}</option>`;
    }
    return options;
};

// Initialize language selectors
const initializeSelectors = () => {
    const optionsHTML = generateOptions();
    elements.translateFrom.innerHTML = optionsHTML;
    elements.translateTo.innerHTML = optionsHTML;
    elements.translateFrom.value = "en";
    elements.translateTo.value = "es";
};

// Character counter
const updateCharCount = () => {
    const count = elements.inputText.value.length;
    elements.charCount.textContent = count;
    elements.charCount.style.color = count > 450 ? '#e74c3c' : count > 400 ? '#f39c12' : '#666';
};

// Show/hide loading
const toggleLoading = (show) => {
    elements.loading.style.display = show ? 'flex' : 'none';
};

// Initialize app
initializeSelectors();

// Event Listeners
elements.inputText.addEventListener('input', updateCharCount);
elements.inputText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        handleTranslate();
    }
});

elements.translateBtn.addEventListener('click', handleTranslate);

// Handle translation
function handleTranslate() {
    const text = elements.inputText.value.trim();
    const fromLang = elements.translateFrom.value;
    const toLang = elements.translateTo.value;
    
    if (!text) {
        showMessage("Por favor, ingresa texto para traducir.", 'warning');
        return;
    }
    
    if (text.length > 500) {
        showMessage("El texto es demasiado largo (máximo 500 caracteres).", 'error');
        return;
    }
    
    if (fromLang === toLang) {
        showMessage("Selecciona idiomas diferentes.", 'warning');
        return;
    }
    
    translateText(text, fromLang, toLang);
}

// Translation function
function translateText(inputText, fromLang, toLang) {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${fromLang}|${toLang}`;
    
    toggleLoading(true);
    elements.translateBtn.disabled = true;
    elements.speakBtn.disabled = true;
    elements.copyBtn.disabled = true;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.responseData && data.responseData.translatedText) {
                const translatedText = data.responseData.translatedText;
                const formattedText = removeQuestionMarks(translatedText);
                elements.outputText.innerText = formattedText;
                elements.speakBtn.disabled = false;
                elements.copyBtn.disabled = false;
                elements.voiceSelect.disabled = false;
                populateVoices();
                
                // Save to history
                const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
                history.push({
                    input: inputText,
                    output: formattedText,
                    from: fromLang,
                    to: toLang,
                    timestamp: Date.now()
                });
                if (history.length > 10) history.shift(); // Keep only last 10
                localStorage.setItem('translationHistory', JSON.stringify(history));
                
                showMessage("Traducción completada", 'success');
            } else {
                throw new Error('No translation data received');
            }
        })
        .catch(error => {
            console.warn('Translation error:', error);
            showMessage("Error al traducir. Inténtalo de nuevo.", 'error');
            elements.outputText.innerText = "";
        })
        .finally(() => {
            toggleLoading(false);
            elements.translateBtn.disabled = false;
        });
}

// Show message function
function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#f39c12'};
    `;
    
    document.body.appendChild(messageEl);
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, 3000);
}

function removeQuestionMarks(text) {
    return text.replace(/^¿+|¿+$/g, '').trim();
}

// Speech synthesis function with pause/resume
function speakText(text) {
    try {
        if (!text || text.trim() === '') {
            showMessage('No hay texto para reproducir.', 'warning');
            return;
        }
        
        const speechSynthesis = window.speechSynthesis;
        if (!speechSynthesis) {
            showMessage('Síntesis de voz no disponible.', 'error');
            return;
        }
        
        // If currently speaking, pause/resume
        if (isSpeaking) {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
                elements.speakBtn.innerHTML = '<i class="fi fi-br-pause"></i>';
                return;
            } else {
                speechSynthesis.pause();
                elements.speakBtn.innerHTML = '<i class="fi fi-br-play"></i>';
                return;
            }
        }
        
        // Stop any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = elements.translateTo.value;
        
        // Set language
        utterance.lang = targetLang;
        
        // Use selected voice or find best available
        const selectedVoiceIndex = elements.voiceSelect.value;
        if (selectedVoiceIndex !== '' && availableVoices[selectedVoiceIndex]) {
            utterance.voice = availableVoices[selectedVoiceIndex];
            console.log('Using selected voice:', availableVoices[selectedVoiceIndex].name);
        } else {
            // Get available voices and select the best one
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.lang.startsWith(targetLang) && voice.localService
            ) || voices.find(voice => 
                voice.lang.startsWith(targetLang)
            ) || voices.find(voice => 
                voice.lang.startsWith(targetLang.split('-')[0])
            );
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
                console.log('Using default voice:', preferredVoice.name);
            }
        }
        
        // Optimize speech settings
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        
        utterance.onstart = () => {
            isSpeaking = true;
            elements.speakBtn.innerHTML = '<i class="fi fi-br-pause"></i>';
            elements.speakBtn.style.background = 'rgba(34, 197, 94, 0.1)';
            elements.speakBtn.style.color = '#22c55e';
        };
        
        utterance.onend = () => {
            isSpeaking = false;
            elements.speakBtn.innerHTML = '<i class="fi fi-br-volume"></i>';
            elements.speakBtn.style.background = 'rgba(79, 70, 229, 0.1)';
            elements.speakBtn.style.color = '#4f46e5';
        };
        
        utterance.onerror = () => {
            isSpeaking = false;
            showMessage('Error al reproducir el audio.', 'error');
            elements.speakBtn.innerHTML = '<i class="fi fi-br-volume"></i>';
            elements.speakBtn.style.background = 'rgba(79, 70, 229, 0.1)';
            elements.speakBtn.style.color = '#4f46e5';
        };
        
        // Ensure voice is set before speaking
        setTimeout(() => {
            // Force voice setting again just before speaking
            if (selectedVoiceIndex !== '' && availableVoices[selectedVoiceIndex]) {
                utterance.voice = availableVoices[selectedVoiceIndex];
            }
            speechSynthesis.speak(utterance);
        }, 150);
        
    } catch (error) {
        console.warn('Speech synthesis error:', error);
        showMessage('Error al reproducir el audio.', 'error');
    }
}

// Stop speech function
function stopSpeech() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        elements.speakBtn.innerHTML = '<i class="fi fi-br-volume"></i>';
        elements.speakBtn.style.background = 'rgba(79, 70, 229, 0.1)';
        elements.speakBtn.style.color = '#4f46e5';
    }
}

// Populate voice selector
function populateVoices() {
    const targetLang = elements.translateTo.value;
    const allVoices = window.speechSynthesis.getVoices();
    
    // Get voices for target language and similar languages
    availableVoices = allVoices.filter(voice => {
        const voiceLang = voice.lang.toLowerCase();
        const target = targetLang.toLowerCase();
        const targetBase = target.split('-')[0];
        
        return voiceLang.startsWith(target) || 
               voiceLang.startsWith(targetBase) ||
               (targetBase === 'en' && voiceLang.includes('en')) ||
               (targetBase === 'es' && voiceLang.includes('es')) ||
               (targetBase === 'fr' && voiceLang.includes('fr')) ||
               (targetBase === 'de' && voiceLang.includes('de')) ||
               (targetBase === 'it' && voiceLang.includes('it')) ||
               (targetBase === 'pt' && voiceLang.includes('pt'));
    });
    
    // If no specific voices found, add some common ones
    if (availableVoices.length === 0) {
        availableVoices = allVoices.slice(0, 10); // First 10 voices as fallback
    }
    
    elements.voiceSelect.innerHTML = '<option value="">Voz por defecto</option>';
    
    availableVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        const voiceName = voice.name.length > 25 ? voice.name.substring(0, 25) + '...' : voice.name;
        option.textContent = `${voiceName} (${voice.lang})`;
        elements.voiceSelect.appendChild(option);
    });
}

// Load voices when available
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        availableVoices = window.speechSynthesis.getVoices();
    };
}

// Copy to clipboard function
function copyToClipboard(text) {
    if (!text || text.trim() === '') {
        showMessage('No hay texto para copiar.', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showMessage('Texto copiado al portapapeles', 'success');
        elements.copyBtn.innerHTML = '<i class="fi fi-br-check"></i>';
        setTimeout(() => {
            elements.copyBtn.innerHTML = '<i class="fi fi-br-copy"></i>';
        }, 2000);
    }).catch(() => {
        showMessage('Error al copiar texto.', 'error');
    });
}

// Clear function
function clearAll() {
    elements.inputText.value = '';
    elements.outputText.innerText = '';
    elements.speakBtn.disabled = true;
    elements.copyBtn.disabled = true;
    elements.voiceSelect.disabled = true;
    updateCharCount();
    elements.inputText.focus();
}

// Swap languages function
function swapLanguages() {
    const fromValue = elements.translateFrom.value;
    const toValue = elements.translateTo.value;
    
    elements.translateFrom.value = toValue;
    elements.translateTo.value = fromValue;
    
    // If there's translated text, swap it with input
    const inputText = elements.inputText.value;
    const outputText = elements.outputText.innerText;
    
    if (inputText && outputText && !outputText.includes('Error')) {
        elements.inputText.value = outputText;
        elements.outputText.innerText = inputText;
        updateCharCount();
    }
}

// More event listeners
elements.speakBtn.addEventListener('click', () => {
    const text = elements.outputText.innerText;
    if (text && !text.includes('Error')) {
        speakText(text);
    } else {
        showMessage('Primero traduce un texto.', 'warning');
    }
});

elements.copyBtn.addEventListener('click', () => {
    copyToClipboard(elements.outputText.innerText);
});

elements.clearBtn.addEventListener('click', clearAll);

elements.swapBtn.addEventListener('click', swapLanguages);

elements.historyBtn.addEventListener('click', () => {
    const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
    if (history.length === 0) {
        showMessage('No hay historial de traducciones.', 'info');
        return;
    }
    const lastTranslation = history[history.length - 1];
    elements.inputText.value = lastTranslation.input;
    elements.translateFrom.value = lastTranslation.from;
    elements.translateTo.value = lastTranslation.to;
    elements.outputText.innerText = lastTranslation.output;
    updateCharCount();
    showMessage('Última traducción cargada.', 'success');
});

// Theme toggle functionality
elements.themeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDark);
    
    const icon = this.querySelector('.theme-icon');
    icon.className = isDark ? 'fi fi-br-moon theme-icon' : 'fi fi-br-sun theme-icon';
});

// Load saved theme and preferences
if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    document.querySelector('.theme-icon').className = 'fi fi-br-moon theme-icon';
}

// Load saved languages
const savedFromLang = localStorage.getItem('fromLang');
const savedToLang = localStorage.getItem('toLang');
if (savedFromLang) elements.translateFrom.value = savedFromLang;
if (savedToLang) elements.translateTo.value = savedToLang;

// Save language preferences
elements.translateFrom.addEventListener('change', () => {
    localStorage.setItem('fromLang', elements.translateFrom.value);
});

elements.translateTo.addEventListener('change', () => {
    localStorage.setItem('toLang', elements.translateTo.value);
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize character counter
updateCharCount();

// Focus input on load
elements.inputText.focus();

// Preload voices
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
}