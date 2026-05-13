@echo off
setlocal

cd /d "%~dp0"

echo ==========================================
echo  Sistema Activos FISEI - Sprint 1
echo ==========================================
echo.
echo Verificando dependencias...

where npm >nul 2>nul
if errorlevel 1 (
    echo No se encontro npm. Instala Node.js antes de continuar.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Instalando dependencias con npm install...
    call npm install
    if errorlevel 1 (
        echo.
        echo Error instalando dependencias.
        pause
        exit /b 1
    )
)

echo.
echo Iniciando backend en http://localhost:3000
start "Backend - Sistema Activos FISEI" cmd /k "cd /d "%~dp0" && npm run dev"

timeout /t 3 /nobreak >nul

echo Iniciando frontend en http://localhost:5173
start "Frontend - Sistema Activos FISEI" cmd /k "cd /d "%~dp0" && npm run frontend"

echo.
echo Esperando a que el frontend termine de iniciar...
timeout /t 5 /nobreak >nul

echo Abriendo navegador...
start "" "http://localhost:5173"

echo.
echo Todo listo.
echo http://localhost:5173
echo.
echo Usuario de prueba:
echo andrew.lara@uta.edu.ec
echo.
pause
