// Motor de compresión PNG usando pngquant-wasm
let wasmModule = null;

const squoosh_png = {
    default: async function init() {
        if (wasmModule) return wasmModule;
        
        // Cargar el módulo WASM de pngquant
        try {
            const wasmUrl = chrome.runtime.getURL('lib/squoosh_png_bg.wasm');
            const wasmResponse = await fetch(wasmUrl);
            const wasmBytes = await wasmResponse.arrayBuffer();
            
            wasmModule = await WebAssembly.instantiate(wasmBytes, {
                env: {
                    memory: new WebAssembly.Memory({ initial: 256 }),
                    __wbindgen_throw: function(a, b) { throw new Error('WASM error'); }
                }
            });
            
            return wasmModule;
        } catch (error) {
            console.warn('WASM no disponible, usando fallback:', error);
            return null;
        }
    },
    
    encode: async function(imageData, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                const blob = new Blob([imageData], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Aplicar cuantización de colores
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const numColors = options.quant?.numColors || 256;
                    
                    if (numColors < 256) {
                        quantizeColors(imageData, numColors);
                        ctx.putImageData(imageData, 0, 0);
                    }
                    
                    canvas.toBlob((compressedBlob) => {
                        if (compressedBlob) {
                            const reader = new FileReader();
                            reader.onload = () => resolve(new Uint8Array(reader.result));
                            reader.readAsArrayBuffer(compressedBlob);
                        } else {
                            reject(new Error('Error al comprimir'));
                        }
                    }, 'image/png');
                    
                    URL.revokeObjectURL(url);
                };
                
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('Error al cargar imagen'));
                };
                
                img.src = url;
            } catch (error) {
                reject(error);
            }
        });
    }
};

// Cuantización simple de colores
function quantizeColors(imageData, numColors) {
    const data = imageData.data;
    const factor = 256 / numColors;
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.floor(data[i] / factor) * factor;     // R
        data[i + 1] = Math.floor(data[i + 1] / factor) * factor; // G
        data[i + 2] = Math.floor(data[i + 2] / factor) * factor; // B
    }
}

window.squoosh_png = squoosh_png;