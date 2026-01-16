# 🚀 Sistema de Análisis de Emociones

Sistema educativo para análisis de emociones en audio con reconocimiento prosódico.

## 🎯 Inicio Ultra Rápido (1 Clic)

```bash
# Ejecuta desde la carpeta principal
start-services.bat
```

¡Eso es todo! El script:
- ✅ Verifica requisitos
- ✅ Instala dependencias
- ✅ Inicia todos los servicios
- ✅ Abre el navegador

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| **start-services.bat** | 🚀 Inicia todo el sistema |
| **stop-services.bat** | 🛑 Detiene todos los servicios |
| **check-status.bat** | 🔍 Verifica estado del sistema |
| **install-dependencies.bat** | 📦 Solo instala dependencias |

Ver [GUIA_SCRIPTS.md](GUIA_SCRIPTS.md) para más detalles.

## 📋 Requisitos Previos

- **Python 3.8+**: [Descargar](https://www.python.org/downloads/)
- **Node.js 14+**: [Descargar](https://nodejs.org/)
- **ffmpeg**: Necesario para análisis de audio
  - `winget install ffmpeg`
  - `choco install ffmpeg -y`
  - `scoop install ffmpeg`

## ⚡ Inicio Rápido

### 🎯 Recomendado: Script Automático

```bash
# Ejecutar desde la carpeta principal (Rocio/)
start-services.bat
```

Este script hace **TODO automáticamente**:
- ✅ Verifica que Python, Node.js y ffmpeg estén instalados
- ✅ Instala todas las dependencias si hacen falta
- ✅ Crea archivos de configuración necesarios
- ✅ Inicia los 3 servicios (Python, Backend, Frontend)
- ✅ Abre el navegador en http://localhost:3000

**¡Solo ejecuta el script y listo!**

---

### 🛠️ Otros Scripts Útiles

```bash
# Detener todos los servicios
stop-services.bat

# Verificar estado del sistema
check-status.bat

# Solo instalar dependencias (sin iniciar)
install-dependencies.bat
```

Ver [GUIA_SCRIPTS.md](GUIA_SCRIPTS.md) para documentación completa de scripts.

---

### Opción 2: Manual (Avanzado)

**Terminal 1 - Servicio Python:**
```bash
cd Backend
pip install -r requirements.txt
python emotion_service.py
```

**Terminal 2 - Backend Node.js:**
```bash
cd Backend
npm install
npm start
```

**Terminal 3 - Frontend Next.js:**
```bash
cd Frontend
npm install
npm run dev
```

## 🛑 Detener Servicios

```bash
# Ejecutar desde la carpeta principal
stop-services.bat
```

O cierra las ventanas de consola manualmente.

## 🌐 URLs de los Servicios

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3100
- **Servicio Python**: http://localhost:5000

## 📁 Estructura del Proyecto

```
Rocio/
├── 🚀 start-services.bat         # ⭐ INICIAR TODO
├── 🛑 stop-services.bat          # Detener servicios
├── 🔍 check-status.bat           # Verificar estado
├── 📦 install-dependencies.bat   # Instalar dependencias
├── 📖 README.md                  # Este archivo
├── 📘 GUIA_SCRIPTS.md           # Guía de scripts
├── Backend/
│   ├── emotion_service.py       # 🐍 Servicio Python análisis
│   ├── server.js                # 🟢 API Node.js
│   ├── requirements.txt         # Dependencias Python
│   ├── package.json             # Dependencias Node.js
│   ├── .env                     # Configuración
│   ├── 📖 README_EMOTION_SERVICE.md
│   ├── 📖 SISTEMA_PUNTUACION.md
│   └── 📖 INSTALAR_FFMPEG.md
└── Frontend/
    ├── app/                     # ⚛️ Aplicación Next.js
    └── package.json             # Dependencias Frontend
```

## 🎯 Características

### Análisis de Emociones en Tiempo Real

El sistema analiza características prosódicas del audio:
- **Pitch (Altura tonal)**: Frecuencia fundamental de la voz
- **Energía**: Intensidad del audio
- **Tempo**: Velocidad del habla
- **Variabilidad**: Expresividad vocal
- **Brillo espectral**: Timbre de la voz

### Actividades Disponibles

1. **Habla como un personaje** - Práctica de emociones vocales
2. **Narrador** - Lectura expresiva
3. **Puntuación** - Colocación de signos
4. **Conectores** - Coherencia textual
5. **Sintaxis** - Construcción de oraciones
6. Y más...

## 🐛 Solución de Problemas

### Error: "Python no encontrado"
Instala Python desde https://www.python.org/downloads/

### Error: "Node.js no encontrado"
Instala Node.js desde https://nodejs.org/

### Error: "ffmpeg no encontrado"
```bash
winget install ffmpeg
# O
choco install ffmpeg -y
# O
scoop install ffmpeg
```
Después reinicia las terminales.

### Error: "Port already in use"
Usa `stop-services.bat` para detener servicios previos.

### Error en análisis de audio
1. Verifica que ffmpeg esté instalado
2. Reinicia el servicio Python
3. Revisa los logs en la consola de Python

## 📖 Documentación Adicional

- [SISTEMA_PUNTUACION.md](Backend/SISTEMA_PUNTUACION.md) - Cómo funciona el sistema de evaluación
- [README_EMOTION_SERVICE.md](Backend/README_EMOTION_SERVICE.md) - Detalles técnicos del análisis
- [INSTALAR_FFMPEG.md](Backend/INSTALAR_FFMPEG.md) - Guía de instalación de ffmpeg

## 🔧 Variables de Entorno

El archivo `Backend/.env` contiene:
```env
MONGODB_URI=mongodb://localhost:27017/sistema_educativo
JWT_SECRET=un_secreto_largo_y_seguro
PORT=3100
PYTHON_SERVICE_URL=http://localhost:5000
```

## 📝 Notas

- El análisis de emociones requiere **ffmpeg** instalado
- Las grabaciones se procesan en tiempo real
- Los puntajes son basados en características prosódicas reales
- El sistema está calibrado para voces infantiles (edad escolar)

## 🤝 Soporte

Para problemas o dudas:
1. Revisa la documentación en `/Backend`
2. Verifica los logs en las consolas
3. Ejecuta `python Backend/test_services.py` para diagnóstico
