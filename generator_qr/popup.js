const dark = document.querySelector(".dark");
const light = document.querySelector(".light");
const qrContainer = document.querySelector("#qr-code");
const qrText = document.querySelector(".qr-text");
const downloadBtn = document.querySelector(".download-btn");
const shareBtn = document.querySelector(".share-btn");
const sizes = document.querySelector(".sizes");

let colorLight = "#fff";
let colorDark = "#000";
let text = "";
let size = 300;

dark.addEventListener("input", (e) => {
    colorDark = e.target.value;
    generateQRCode();
});

light.addEventListener("input", (e) => {
    colorLight = e.target.value;
    generateQRCode();
});

qrText.addEventListener("input", (e) => {
    text = e.target.value || "https://example.com";
    generateQRCode();
});

sizes.addEventListener("change", (e) => {
    size = parseInt(e.target.value);
    generateQRCode();
});

downloadBtn.addEventListener("click", async () => {
    const canvas = document.querySelector("#qr-code canvas");
    if (canvas) {
        const link = document.createElement("a");
        link.download = "codigo-qr.png";
        link.href = canvas.toDataURL();
        link.click();
    }
});

shareBtn.addEventListener("click", async () => {
    try {
        const canvas = document.querySelector("#qr-code canvas");
        if (canvas) {
            const blob = await new Promise(resolve => canvas.toBlob(resolve));
            const file = new File([blob], "codigo-qr.png", { type: "image/png" });
            await navigator.share({
                files: [file],
                title: text || "Código QR"
            });
        }
    } catch (error) {
        alert("Tu navegador no soporta la función de compartir.");
    }
});

function generateQRCode() {
    qrContainer.innerHTML = "";
    if (text) {
        new QRCode("qr-code", {
            text,
            width: size,
            height: size,
            colorDark,
            colorLight
        });
    }
}

// Generar QR inicial
text = "https://example.com";
generateQRCode();