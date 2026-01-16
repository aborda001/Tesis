@echo off
echo ========================================
echo   Instalacion de Dependencias
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Instalando dependencias Backend Node.js...
cd Backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo la instalacion
    pause
    exit /b 1
)
echo [OK] Dependencias Backend instaladas
echo.

echo [2/4] Instalando dependencias Python...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo la instalacion de Python
    pause
    exit /b 1
)
echo [OK] Dependencias Python instaladas
echo.

echo [3/4] Instalando dependencias Frontend...
cd ..\Frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo la instalacion del Frontend
    pause
    exit /b 1
)
echo [OK] Dependencias Frontend instaladas
echo.

echo [4/4] Creando archivos de configuracion...
cd ..
if not exist "Backend\.env" (
    (
        echo MONGODB_URI=mongodb://localhost:27017/sistema_educativo
        echo JWT_SECRET=un_secreto_largo_y_seguro
        echo PORT=3100
        echo PYTHON_SERVICE_URL=http://localhost:5000
    ) > Backend\.env
    echo [OK] Archivo .env creado
) else (
    echo [OK] Archivo .env ya existe
)

if not exist "Backend\uploads\" mkdir Backend\uploads
echo [OK] Carpeta uploads creada

echo.
echo ========================================
echo   INSTALACION COMPLETA
echo ========================================
echo.
echo Ahora puedes ejecutar:
echo   start-services.bat
echo.
pause
