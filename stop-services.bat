@echo off
echo ========================================
echo   Deteniendo todos los servicios
echo ========================================
echo.

REM Detener procesos de Node.js en puertos 3000 y 3100
echo Deteniendo Frontend (puerto 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo Deteniendo Backend (puerto 3100)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3100 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo Deteniendo Servicio Python (puerto 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo.
echo [OK] Todos los servicios han sido detenidos
echo.
pause
