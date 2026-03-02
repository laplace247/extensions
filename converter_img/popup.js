document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const convertBtn = document.getElementById('convertBtn');
    const statusDiv = document.getElementById('status');
    const themeToggle = document.getElementById('themeToggle');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    let selectedFiles = [];

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        document.body.classList.add('dark');
        themeToggle.innerHTML = '<i class="fi fi-br-moon"></i>';
    }

    // Toggle tema
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark');
        themeToggle.innerHTML = isDark ? '<i class="fi fi-br-moon"></i>' : '<i class="fi fi-br-sun"></i>';
        localStorage.setItem('darkMode', isDark);
    });

    fileInput.addEventListener('change', (event) => {
        selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            convertBtn.disabled = false;
            statusDiv.textContent = `${selectedFiles.length} archivo(s) seleccionado(s)`;
        } else {
            convertBtn.disabled = true;
            statusDiv.textContent = '';
        }
    });

    convertBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        convertBtn.disabled = true;
        statusDiv.textContent = 'Convirtiendo...';
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';

        const zip = new JSZip();
        const totalFiles = selectedFiles.length;
        let filesProcessed = 0;

        const conversionPromises = Array.from(selectedFiles).map(file => {
            return new Promise((resolve) => {
                if (!file.type.startsWith('image/')) {
                    filesProcessed++;
                    const progress = Math.round((filesProcessed / totalFiles) * 100);
                    progressBar.style.width = `${progress}%`;
                    statusDiv.textContent = `Convirtiendo... (${progress}%)`;
                    resolve();
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);

                        canvas.toBlob((blob) => {
                            const fileName = file.name.split('.').slice(0, -1).join('.') + '.png';
                            zip.file(fileName, blob);
                            
                            filesProcessed++;
                            const progress = Math.round((filesProcessed / totalFiles) * 100);
                            progressBar.style.width = `${progress}%`;
                            statusDiv.textContent = `Convirtiendo... (${progress}%)`;
                            
                            resolve();
                        }, 'image/png');
                    };
                    img.onerror = () => {
                        filesProcessed++;
                        const progress = Math.round((filesProcessed / totalFiles) * 100);
                        progressBar.style.width = `${progress}%`;
                        statusDiv.textContent = `Convirtiendo... (${progress}%)`;
                        resolve();
                    };
                    img.src = e.target.result;
                };
                reader.onerror = () => {
                    filesProcessed++;
                    const progress = Math.round((filesProcessed / totalFiles) * 100);
                    progressBar.style.width = `${progress}%`;
                    statusDiv.textContent = `Convirtiendo... (${progress}%)`;
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        });

        try {
            await Promise.all(conversionPromises);
            statusDiv.textContent = 'Generando zip...';
            progressBar.style.width = '100%';

            zip.generateAsync({ type: "blob" }).then((content) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "imgs-convertidas.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                statusDiv.textContent = '¡Descarga completada!';
                setTimeout(() => {
                    fileInput.value = '';
                    selectedFiles = [];
                    convertBtn.disabled = true;
                    statusDiv.textContent = '';
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                }, 2000);
            });
        } catch (error) {
            statusDiv.textContent = 'Error en conversión';
            progressContainer.style.display = 'none';
            convertBtn.disabled = false;
        }
    });
});