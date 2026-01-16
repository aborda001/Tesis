# 🎬 Instalar ffmpeg en Windows

## ⚡ Opción 1: Chocolatey (MÁS RÁPIDO)

Si tienes Chocolatey instalado:
```powershell
choco install ffmpeg -y
```

## ⚡ Opción 2: winget (Windows 10/11)

```powershell
winget install ffmpeg
```

## ⚡ Opción 3: scoop

```powershell
scoop install ffmpeg
```

## 📦 Opción 4: Descarga Manual

1. Ve a: https://www.gyan.dev/ffmpeg/builds/
2. Descarga: **ffmpeg-release-essentials.zip**
3. Extrae el archivo
4. Copia la ruta de la carpeta `bin` (ejemplo: `C:\ffmpeg\bin`)
5. Agrega al PATH:
   - Presiona `Win + X` → System → Advanced system settings
   - Environment Variables → Path → Edit → New
   - Pega la ruta: `C:\ffmpeg\bin`
   - OK → OK → OK
6. **IMPORTANTE: Cierra y reabre todas las terminales**

## ✅ Verificar la instalación

Después de instalar, cierra y reabre la terminal, luego ejecuta:
```powershell
ffmpeg -version
```

Deberías ver la versión de ffmpeg instalada.

## 🔄 Después de instalar

1. **Reinicia el servicio Python:**
   - Presiona `Ctrl + C` en la terminal donde corre Python
   - Ejecuta: `python emotion_service.py`

2. **Prueba la grabación** en el frontend

## 💡 ¿Por qué necesitamos ffmpeg?

ffmpeg es necesario para que Python pueda convertir archivos de audio webm (formato del navegador) a WAV (formato que librosa puede analizar).
