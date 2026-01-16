# Servicio de Análisis de Emociones - Instrucciones de Instalación

## 📋 Requisitos Previos

- Python 3.8 o superior
- Node.js 14 o superior
- npm o pnpm

## 🚀 Instalación

### 1. Instalar dependencias de Node.js

```bash
cd Backend
npm install
```

### 2. Instalar dependencias de Python

```bash
# Opción 1: Crear un entorno virtual (recomendado)
python -m venv venv
.\venv\Scripts\activate  # En Windows
source venv/bin/activate  # En Linux/Mac

# Opción 2: Instalar globalmente
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en el directorio `Backend`:

```env
PORT=3100
MONGODB_URI=mongodb://localhost:27017/sistema_educativo
PYTHON_SERVICE_URL=http://localhost:5000
```

## 🎯 Iniciar los Servicios

### Terminal 1: Servicio Python (Análisis de Emociones)

```bash
cd Backend
python emotion_service.py
```

El servicio estará disponible en `http://localhost:5000`

### Terminal 2: Backend Node.js

```bash
cd Backend
npm start
```

El backend estará disponible en `http://localhost:3100`

### Terminal 3: Frontend Next.js

```bash
cd Frontend
npm run dev
# o
pnpm dev
```

El frontend estará disponible en `http://localhost:3000`

## 🔧 Cómo Funciona

### Análisis de Emociones

El servicio Python utiliza **librosa** para extraer características prosódicas del audio:

1. **Pitch (Altura Tonal)**: Frecuencia fundamental de la voz
   - Feliz: Pitch alto (>190 Hz)
   - Triste: Pitch bajo (<170 Hz)
   - Enojado: Pitch alto y variable (>200 Hz)

2. **Energía (RMS)**: Intensidad del audio
   - Feliz: Energía alta (>0.08)
   - Triste: Energía baja (<0.08)
   - Enojado: Energía muy alta (>0.12)

3. **Tempo**: Velocidad del habla
   - Feliz: Rápido (>110 BPM)
   - Triste: Lento (<95 BPM)
   - Enojado: Muy rápido (>120 BPM)

4. **Variabilidad del Pitch**: Monotonía vs expresividad
   - Feliz: Alta variación (>20 Hz std)
   - Triste: Baja variación (<25 Hz std)
   - Enojado: Muy alta variación (>30 Hz std)

5. **Spectral Centroid**: Brillo del sonido
   - Feliz: Sonido brillante (>1500 Hz)
   - Triste: Sonido apagado (<1500 Hz)
   - Enojado: Sonido brillante (>1800 Hz)

### Flujo de Datos

```
Frontend (Next.js)
    ↓ Graba audio (WebRTC)
    ↓ Envía audio.webm
Backend Node.js (Express)
    ↓ Recibe audio
    ↓ Reenvía a Python
Servicio Python (Flask + librosa)
    ↓ Extrae características
    ↓ Calcula puntuación
    ↓ Retorna accuracy (0-100)
Backend Node.js
    ↓ Retorna resultado
Frontend
    ↓ Muestra puntuación
```

## 🐛 Solución de Problemas

### Error: "No module named 'librosa'"
```bash
pip install librosa soundfile numpy
```

### Error: "Could not find ffmpeg"
En Windows:
```bash
# Descargar ffmpeg desde https://ffmpeg.org/download.html
# Agregar al PATH del sistema
```

### Error: "Connection refused to localhost:5000"
- Verifica que el servicio Python esté corriendo
- Revisa los logs del servicio Python para errores

### Error: "MediaRecorder not supported"
- Usa un navegador moderno (Chrome, Firefox, Edge)
- Asegúrate de estar usando HTTPS o localhost

## 📊 Mejoras Futuras

1. **Machine Learning**: Entrenar un modelo con TensorFlow/PyTorch para mejor precisión
2. **Más Emociones**: Agregar sorpresa, miedo, disgusto
3. **Análisis de Texto**: Combinar con speech-to-text para analizar contenido
4. **Feedback Visual**: Mostrar gráficos de pitch y energía en tiempo real
5. **Base de Datos**: Guardar grabaciones para entrenar modelos personalizados

## 📝 Notas

- El análisis es heurístico basado en estudios de prosodia emocional
- La precisión puede variar según la calidad del micrófono
- Los rangos están calibrados para voces infantiles (edad escolar)
- El puntaje mínimo es 40% para mantener la motivación del estudiante
