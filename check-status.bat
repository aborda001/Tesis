@echo off
echo ========================================
echo   Estado de los Servicios
echo ========================================
echo.

REM Verificar Python (puerto 5000)
echo [1] Servicio Python (puerto 5000):
netstat -ano | findstr :5000 | findstr LISTENING >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Corriendo
    curl -s http://localhost:5000/health >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] Respondiendo correctamente
    ) else (
        echo    [!] Puerto abierto pero no responde
    )
) else (
    echo    [X] No esta corriendo
)

echo.
echo [2] Backend Node.js (puerto 3100):
netstat -ano | findstr :3100 | findstr LISTENING >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Corriendo
    curl -s http://localhost:3100/ >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] Respondiendo correctamente
    ) else (
        echo    [!] Puerto abierto pero no responde
    )
) else (
    echo    [X] No esta corriendo
)

echo.
echo [3] Frontend Next.js (puerto 3000):
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Corriendo
    curl -s http://localhost:3000/ >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] Respondiendo correctamente
    ) else (
        echo    [!] Puerto abierto pero no responde
    )
) else (
    echo    [X] No esta corriendo
)

echo.
echo ========================================
echo   Verificando Requisitos
echo ========================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python instalado
    python --version
) else (
    echo [X] Python NO instalado
)

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js instalado
    node --version
) else (
    echo [X] Node.js NO instalado
)

where ffmpeg >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] ffmpeg instalado
    ffmpeg -version | findstr "version"
) else (
    echo [X] ffmpeg NO instalado - El analisis de audio NO funcionara
)

echo.
echo ========================================
pause
