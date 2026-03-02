const pickBtn = document.getElementById("pick-btn");
const fileInput = document.getElementById("file");
const image = document.getElementById("image");
const hexInput = document.getElementById("hex-input");
const rgbInput = document.getElementById("rgb-input");
const pickedColor = document.getElementById("picked-color");
const result = document.getElementById("result");
const themeToggle = document.getElementById("theme-toggle");
const container = document.querySelector(".container");

const initEyeDropper = () => {
    if ("EyeDropper" in window) {
        const eyeDropper = new EyeDropper();
        pickBtn.addEventListener("click", async () => {
            try {
                const colorValue = await eyeDropper.open();
                const hexValue = colorValue.sRGBHex.toLowerCase();
                const rgbValue = hexToRgb(hexValue);
                result.style.display = "grid";
                hexInput.value = hexValue;
                rgbInput.value = rgbValue;
                pickedColor.style.backgroundColor = hexValue;
            } catch {
                console.warn("EyeDropper API not supported");
                showMessage("Tu navegador no soporta la API EyeDropper");
            }
        });
    } else {
        console.warn("EyeDropper API not available");
        showMessage("Tu navegador no soporta la API EyeDropper");
    }
};

fileInput.addEventListener("change", () => {
    const reader = new FileReader();
    reader.onload = () => image.setAttribute("src", reader.result);
    reader.readAsDataURL(fileInput.files[0]);
});

const copyToClipboard = (textId) => {
    const textElement = document.getElementById(textId);
    textElement.select();
    document.execCommand("copy");
};

const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
};

themeToggle.addEventListener("click", () => {
    container.classList.toggle("dark");
    const icon = themeToggle.querySelector("i");
    const isDark = container.classList.contains("dark");
    if (isDark) {
        icon.className = "fi fi-br-moon";
        localStorage.setItem("darkMode", "true");
    } else {
        icon.className = "fi fi-br-sun";
        localStorage.setItem("darkMode", "false");
    }
});

const showMessage = (message) => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#f44336;color:white;padding:10px;border-radius:4px;z-index:1000';
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
};

window.onload = () => {
    initEyeDropper();
    if (localStorage.getItem("darkMode") === "true") {
        container.classList.add("dark");
        themeToggle.querySelector("i").className = "fi fi-br-moon";
    }
};