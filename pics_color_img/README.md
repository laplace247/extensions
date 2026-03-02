# Color Picker Extension

Una extensión de navegador para seleccionar colores de imágenes con funcionalidades avanzadas de zoom y modo oscuro.

## Características

- 🎨 **Selector de colores**: Utiliza la API EyeDropper para seleccionar colores de cualquier parte de la imagen
- 🖼️ **Carga de imágenes**: Sube y visualiza imágenes desde tu dispositivo
- 🔍 **Zoom interactivo**: Haz zoom con la rueda del mouse para mayor precisión
- 🌙 **Modo oscuro/claro**: Alterna entre temas claro y oscuro
- 📋 **Copia al portapapeles**: Copia valores HEX y RGB con un clic
- 📱 **Interfaz responsive**: Diseño optimizado para popup de extensión

## Estructura del proyecto

```
extens/
├── img/                    # Iconos de la extensión
│   ├── icon16.png         # Icono 16x16
│   ├── icon48.png         # Icono 48x48
│   └── icon128.png        # Icono 128x128
├── popup.html             # Interfaz principal
├── popup.css              # Estilos y temas
├── popup.js               # Funcionalidad JavaScript
└── README.md              # Documentación
```

## Tecnologías utilizadas

- **HTML5**: Estructura de la interfaz
- **CSS3**: Estilos, flexbox, transiciones
- **JavaScript ES6**: Lógica de la aplicación
- **EyeDropper API**: Selección de colores nativa del navegador
- **FileReader API**: Carga de archivos de imagen
- **Font Awesome**: Iconos de copia
- **Flaticon**: Iconos de tema (sol/luna)
- **Google Fonts**: Tipografía Poppins

## Funcionalidades principales

### 1. Selector de colores
- Utiliza la API EyeDropper nativa del navegador
- Convierte automáticamente a formato HEX y RGB
- Muestra preview del color seleccionado

### 2. Zoom interactivo
- Botón toggle para activar/desactivar zoom
- Zoom con rueda del mouse (0.5x - 3x)
- Transiciones suaves con CSS

### 3. Modo oscuro
- Toggle entre tema claro y oscuro
- Iconos dinámicos (sol/luna)
- Estilos adaptados para todos los elementos

### 4. Gestión de imágenes
- Carga de archivos de imagen locales
- Preview automático
- Soporte para múltiples formatos

## Instalación

1. Clona o descarga el proyecto
2. Agrega los iconos reales en la carpeta `img/`
3. Carga la extensión en modo desarrollador en tu navegador
4. Configura el manifest.json según sea necesario

## Compatibilidad

- ✅ Chrome/Chromium (EyeDropper API nativa)
- ✅ Edge (EyeDropper API nativa)
- ⚠️ Firefox (requiere polyfill para EyeDropper)
- ⚠️ Safari (soporte limitado)

## Notas de desarrollo

- La extensión requiere la API EyeDropper para funcionar completamente
- Los navegadores sin soporte mostrarán una alerta informativa
- El zoom utiliza CSS transforms para mejor rendimiento
- Los estilos están optimizados para popup de 350x500px

## Mejoras futuras

- [ ] Historial de colores seleccionados
- [ ] Exportar paleta de colores
- [ ] Soporte para más formatos de color (HSL, CMYK)
- [ ] Integración con herramientas de diseño

## Licencia
Este proyecto está bajo la Licencia MIT.