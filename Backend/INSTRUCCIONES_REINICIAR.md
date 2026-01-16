# 🔄 Instrucciones para Reiniciar los Servicios

## ⚠️ IMPORTANTE: Debes reiniciar ambos servicios para que tomen los cambios

### 1. Reiniciar Servicio Python (Puerto 5000)

1. Ve a la terminal donde está corriendo `python emotion_service.py`
2. Presiona `Ctrl + C` para detenerlo
3. Ejecuta nuevamente:
   ```bash
   python emotion_service.py
   ```

### 2. Reiniciar Backend Node.js (Puerto 3100)

1. Ve a la terminal donde está corriendo `npm start`
2. Presiona `Ctrl + C` para detenerlo
3. Ejecuta nuevamente:
   ```bash
   npm start
   ```

### 3. NO necesitas reiniciar el Frontend

El frontend se recarga automáticamente con los cambios.

## 🔍 Verificar que todo funciona

Después de reiniciar, ejecuta:
```bash
python test_services.py
```

Deberías ver:
```
✓ Servicio Python está corriendo
✓ Backend Node.js está corriendo
```

## 🎤 Probar la Grabación

1. Ve al frontend en http://localhost:3000
2. Ve a la actividad "Habla como un personaje"
3. Selecciona una emoción
4. Graba un audio
5. Debería analizar y mostrar la puntuación

## 🐛 Si sigue dando error

Mira los logs en ambas terminales para ver el error exacto. Los errores más comunes son:

1. **"No module named 'X'"** → Ejecuta `pip install -r requirements.txt`
2. **"Cannot find module 'X'"** → Ejecuta `npm install`
3. **"ECONNREFUSED"** → El servicio Python no está corriendo
4. **"Error loading audio"** → Instala ffmpeg (ver abajo)

## 📦 Instalar ffmpeg (Opcional pero recomendado)

### Opción 1: Chocolatey (Recomendado para Windows)
```powershell
choco install ffmpeg
```

### Opción 2: Manual
1. Descarga desde: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
2. Extrae el archivo
3. Agrega la carpeta `bin` al PATH del sistema

### Opción 3: winget
```powershell
winget install ffmpeg
```

Después de instalar ffmpeg, reinicia las terminales para que reconozca el comando.
