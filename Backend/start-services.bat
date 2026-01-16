@echo off
echo ========================================
echo Iniciando Sistema de Analisis de Emociones
echo ========================================
echo.

REM Verificar si ffmpeg esta instalado
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] ffmpeg no encontrado en el PATH
    echo.
    echo Por favor instala ffmpeg para mejor compatibilidad:
    echo 1. Descarga desde: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
    echo 2. Extrae el archivo
    echo 3. Agrega la carpeta 'bin' al PATH del sistema
    echo.
    echo Alternativa: Instala con Chocolatey
    echo    choco install ffmpeg
    echo.
    pause
)

REM Verificar Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python no encontrado
    echo Por favor instala Python 3.8 o superior
    pause
    exit /b 1
)

echo [OK] Python encontrado
python --version

REM Verificar e instalar dependencias de Python
echo.
echo Verificando dependencias de Python...
pip show flask >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Instalando dependencias de Python...
    pip install -r requirements.txt
)

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no encontrado
    echo Por favor instala Node.js 14 o superior
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version

REM Verificar e instalar dependencias de Node.js
echo.
echo Verificando dependencias de Node.js...
if not exist "node_modules" (
    echo Instalando dependencias de Node.js...
    call npm install
)

REM Crear carpeta uploads si no existe
if not exist "uploads" mkdir uploads

echo.
echo ========================================
echo Iniciando servicios...
echo ========================================
echo.

REM Iniciar servicio Python en una nueva ventana
echo Iniciando servicio Python (puerto 5000)...
start "Emotion Analysis Service" cmd /k "python emotion_service.py"
timeout /t 3 /nobreak >nul

REM Iniciar servidor Node.js en una nueva ventana
echo Iniciando backend Node.js (puerto 3100)...
start "Backend Node.js" cmd /k "npm start"

echo.
echo ========================================
echo Servicios iniciados
echo ========================================
echo.
echo - Servicio Python: http://localhost:5000
echo - Backend Node.js: http://localhost:3100
echo - Frontend (iniciar manualmente): http://localhost:3000
echo.
echo Para iniciar el frontend:
echo   cd ..\Frontend
echo   npm run dev
echo.
echo Presiona cualquier tecla para salir...
pause >nul
