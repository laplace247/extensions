document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar el motor de compresión
    await squoosh_png.default();
    const encodePng = squoosh_png.encode;

    // Referencias a los elementos del DOM
    const fileInput = document.getElementById('fileInput');
    const compressBtn = document.getElementById('compressBtn');
    const statusDiv = document.getElementById('status');
    const colorsSlider = document.getElementById('colorsSlider');
    const colorsValue = document.getElementById('colorsValue');
    let selectedFiles = [];

    // Actualizar el valor de colores cuando se mueve el slider
    colorsSlider.addEventListener('input', () => {
        colorsValue.textContent = colorsSlider.value;
    });

    // Manejar la selección de archivos
    fileInput.addEventListener('change', (event) => {
        selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            compressBtn.disabled = false;
            statusDiv.textContent = `${selectedFiles.length} archivo(s) seleccionado(s).`;
        } else {
            compressBtn.disabled = true;
            statusDiv.textContent = '';
        }
    });

    // Manejar el clic en el botón de compresión
    compressBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        compressBtn.disabled = true;
        statusDiv.textContent = 'Comprimiendo...';
        
        const colors = parseInt(colorsSlider.value, 10);
        
        // Si es un solo archivo, lo descarga directamente
        if (selectedFiles.length === 1) {
            const file = selectedFiles[0];
            try {
                const compressedData = await compressImage(file, colors);
                const blob = new Blob([compressedData], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                chrome.downloads.download({
                    url: url,
                    filename: getNewFileName(file.name)
                });
                statusDiv.textContent = '¡Compresión completada!';
            } catch (e) {
                statusDiv.textContent = 'Error al comprimir.';
                console.error(e);
            }
        // Si son múltiples archivos, los comprime en un ZIP
        } else {
            const zip = new JSZip();
            let processed = 0;

            for (const file of selectedFiles) {
                try {
                    const compressedData = await compressImage(file, colors);
                    zip.file(getNewFileName(file.name), compressedData);
                    processed++;
                    statusDiv.textContent = `Comprimiendo ${processed}/${selectedFiles.length}...`;
                } catch (e) {
                    console.error(`Error con el archivo ${file.name}:`, e);
                }
            }

            statusDiv.textContent = 'Generando archivo .zip...';
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            chrome.downloads.download({
                url: url,
                filename: 'imagenes-comprimidas.zip'
            });
            statusDiv.textContent = '¡Compresión completada!';
        }
        
        compressBtn.disabled = false;
        selectedFiles = [];
        fileInput.value = ''; // Limpiar selección
    });

    /**
     * Comprime una sola imagen usando el motor WASM de Squoosh/pngquant
     * @param {File} file - El archivo de imagen a comprimir.
     * @param {number} colors - El número de colores para la cuantización.
     * @returns {Promise<Uint8Array>} Los datos de la imagen comprimida.
     */
    async function compressImage(file, colors) {
        const fileBuffer = await file.arrayBuffer();
        const imageData = new Uint8Array(fileBuffer);
        // La opción "level: 2" es para el esfuerzo de cuantización (más lento, mejor calidad)
        return await encodePng(imageData, { quant: { enabled: true, numColors: colors, dither: 1, level: 2 } });
    }

    /**
     * Genera un nuevo nombre de archivo. Ej: "foto.png" -> "foto-comprimido.png"
     * @param {string} originalName 
     */
    function getNewFileName(originalName) {
        const nameWithoutExtension = originalName.split('.').slice(0, -1).join('.');
        return `${nameWithoutExtension}-comprimido.png`;
    }
});