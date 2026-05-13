@echo off
setlocal

cd /d "%~dp0"

echo ==========================================
echo  Instalar dependencias - Sistema Activos
echo ==========================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
    echo No se encontro npm. Instala Node.js antes de continuar.
    pause
    exit /b 1
)

echo Instalando dependencias del proyecto...
call npm install

if errorlevel 1 (
    echo.
    echo Error instalando dependencias.
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas correctamente.
echo Ya puedes ejecutar iniciar_proyecto.bat
echo.
pause
