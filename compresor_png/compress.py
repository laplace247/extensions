import os
from PIL import Image
import sys

# -----------------------------------------------------------------------------
# --- CONFIGURACIÓN ---
# Edita estas tres variables para que coincidan con tus carpetas.
# -----------------------------------------------------------------------------

# 1. Carpeta de entrada: La carpeta donde están tus imágenes PNG originales.
#    Ejemplo Windows: 'C:\\Users\\TuUsuario\\Desktop\\Imagenes Originales'
INPUT_FOLDER = 'C:\\Users\\HP\\Downloads\\compresor png\\input' # <-- ¡Asegúrate de que esta ruta sea correcta!

# 2. Carpeta de salida: Donde se guardarán las imágenes comprimidas.
#    Ejemplo Windows: 'C:\\Users\\TuUsuario\\Desktop\\Imagenes Comprimidas'
OUTPUT_FOLDER = 'C:\\Users\\HP\\Downloads\\compresor png\\output' # <-- ¡Y que esta también lo sea!

# 3. Número de colores: El factor clave de la compresión.
#    - 256: Calidad muy alta, buena compresión. (Recomendado)
#    - 128: Buena calidad, gran compresión.
NUMBER_OF_COLORS = 256

# --- FIN DE LA CONFIGURACIÓN ---
# No necesitas editar nada debajo de esta línea.
# -----------------------------------------------------------------------------

# Variable global para mostrar el aviso de fallback solo una vez.
_fallback_warning_shown = False

def compress_png(input_path, output_path, colors):
    """Comprime una sola imagen PNG usando cuantización de color."""
    global _fallback_warning_shown
    try:
        original_image = Image.open(input_path)
        if original_image.mode != 'RGBA':
            original_image = original_image.convert('RGBA')

        # --- LÓGICA MEJORADA CON FALLBACK ---
        try:
            # 1. Intentar el método de MÁXIMA calidad primero.
            quantize_method = Image.Quantize.LIBIMAGEQUANT
            compressed_image = original_image.quantize(
                colors=colors,
                method=quantize_method,
                dither=Image.Dither.FLOYDSTEINBERG
            )
        except ValueError as e:
            # 2. Si falla por la dependencia, usar el método alternativo.
            if "dependency 'libimagequant' not available" in str(e) or "was not enabled at compile time" in str(e):
                if not _fallback_warning_shown:
                    print("\n⚠️ AVISO: El compresor de alta calidad (libimagequant) no está disponible.")
                    print("   Cambiando a método alternativo. La compresión seguirá funcionando.")
                    _fallback_warning_shown = True
                
                quantize_method = Image.Quantize.FASTOCTREE
                compressed_image = original_image.quantize(
                    colors=colors,
                    method=quantize_method,
                    dither=Image.Dither.FLOYDSTEINBERG
                )
            else:
                # Si es otro error, lo mostramos.
                raise e

        compressed_image.save(output_path, "PNG", optimize=True)
        return True
    except Exception as e:
        print(f"\n❌ Error al procesar '{os.path.basename(input_path)}': {e}")
        return False

def main():
    """Función principal que ejecuta todo el proceso."""
    print("--- Compresor de PNG por Script (v2) ---")

    if not os.path.isdir(INPUT_FOLDER):
        print(f"❌ ERROR: La carpeta de entrada no existe: '{INPUT_FOLDER}'")
        print("Por favor, revisa la variable INPUT_FOLDER en el script.")
        sys.exit(1)

    if not os.path.exists(OUTPUT_FOLDER):
        print(f"📂 Creando carpeta de salida: '{OUTPUT_FOLDER}'")
        os.makedirs(OUTPUT_FOLDER)

    png_files = [f for f in os.listdir(INPUT_FOLDER) if f.lower().endswith('.png')]

    if not png_files:
        print(f"🤷 No se encontraron archivos .png en '{INPUT_FOLDER}'.")
        return

    print(f"🔎 Se encontraron {len(png_files)} imágenes PNG para comprimir.")
    total_reduction = 0
    files_processed = 0

    for i, filename in enumerate(png_files):
        input_file_path = os.path.join(INPUT_FOLDER, filename)
        output_file_path = os.path.join(OUTPUT_FOLDER, filename)

        try:
            original_size = os.path.getsize(input_file_path)
        except FileNotFoundError:
            print(f"❌ No se pudo encontrar el archivo: {filename}")
            continue

        print(f"\n[{i+1}/{len(png_files)}] Procesando '{filename}' ({original_size / 1024:.1f} KB)...")

        if compress_png(input_file_path, output_file_path, NUMBER_OF_COLORS):
            compressed_size = os.path.getsize(output_file_path)
            if original_size > 0:
                reduction_percent = 100 * (original_size - compressed_size) / original_size
                total_reduction += original_size - compressed_size
                files_processed += 1
                print(f"✅ Guardado ({compressed_size / 1024:.1f} KB) | Reducción: {reduction_percent:.1f}%")
            else:
                print("✅ Guardado (archivo original estaba vacío).")

    if files_processed > 0:
        print("\n--- ¡Proceso completado! ---")
        print(f"✨ Se procesaron {files_processed} de {len(png_files)} archivos.")
        print(f"📉 Reducción total de espacio: {total_reduction / (1024 * 1024):.2f} MB")
    else:
        print("\n--- No se procesaron archivos con éxito. ---")

if __name__ == "__main__":
    main()