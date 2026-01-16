@echo off
echo ========================================
echo   Sistema de Analisis de Emociones
echo   Iniciando todos los servicios
echo ========================================
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

REM ==========================================
REM VERIFICAR REQUISITOS
REM ==========================================

echo [1/7] Verificando requisitos previos...
echo.

REM Verificar Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python no encontrado
    echo Por favor instala Python 3.8 o superior desde: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python encontrado
call python --version

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no encontrado
    echo Por favor instala Node.js 14 o superior desde: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js encontrado
call node --version

REM Verificar npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm no encontrado
    pause
    exit /b 1
)
echo [OK] npm encontrado
call npm --version

REM Verificar ffmpeg
echo.
echo Verificando ffmpeg...
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] ffmpeg no encontrado - el analisis de audio NO funcionara
    echo Instala con: winget install ffmpeg
) else (
    echo [OK] ffmpeg encontrado
)

echo.
echo ========================================
echo [2/7] Instalando dependencias Backend
echo ========================================
cd Backend

if not exist "node_modules\" (
    echo Instalando dependencias de Node.js...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Fallo la instalacion de dependencias del backend
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias del backend ya instaladas
)

echo.
echo Verificando dependencias Python...
pip show flask >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Instalando dependencias de Python...
    pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Fallo la instalacion de dependencias de Python
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias de Python ya instaladas
)

REM Crear carpeta uploads si no existe
if not exist "uploads\" mkdir uploads

echo.
echo ========================================
echo [3/7] Instalando dependencias Frontend
echo ========================================
cd ..\Frontend

if not exist "node_modules\" (
    echo Instalando dependencias del frontend...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Fallo la instalacion de dependencias del frontend
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias del frontend ya instaladas
)

cd ..

echo.
echo ========================================
echo [4/7] Verificando archivos de configuracion
echo ========================================

if not exist "Backend\.env" (
    echo Creando archivo .env...
    (
        echo MONGODB_URI=mongodb://localhost:27017/sistema_educativo
        echo JWT_SECRET=un_secreto_largo_y_seguro
        echo PORT=3100
        echo PYTHON_SERVICE_URL=http://localhost:5000
    ) > Backend\.env
    echo [OK] Archivo .env creado
) else (
    echo [OK] Archivo .env existe
)

echo.
echo ========================================
echo [5/7] Iniciando Servicio Python
echo ========================================
echo Puerto: 5000
echo.

start "Python - Analisis de Emociones" cmd /k "cd /d "%~dp0Backend" && python emotion_service.py"
timeout /t 3 /nobreak >nul

echo [OK] Servicio Python iniciado
echo.

echo ========================================
echo [6/7] Iniciando Backend Node.js
echo ========================================
echo Puerto: 3100
echo.

start "Node.js - Backend API" cmd /k "cd /d "%~dp0Backend" && npm start"
timeout /t 3 /nobreak >nul

echo [OK] Backend Node.js iniciado
echo.

echo ========================================
echo [7/7] Iniciando Frontend Next.js
echo ========================================
echo Puerto: 3000
echo.

start "Next.js - Frontend" cmd /k "cd /d "%~dp0Frontend" && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   SERVICIOS INICIADOS CORRECTAMENTE
echo ========================================
echo.
echo Servicios corriendo:
echo   [1] Servicio Python:  http://localhost:5000
echo   [2] Backend Node.js:  http://localhost:3100
echo   [3] Frontend Next.js: http://localhost:3000
echo.
echo Abriendo el navegador...
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo.
echo ========================================
echo Para detener los servicios:
echo   Cierra las 3 ventanas de consola
echo   O presiona Ctrl+C en cada una
echo ========================================
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
