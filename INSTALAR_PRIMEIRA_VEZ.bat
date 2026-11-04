@echo off
title Instalador - Qualificador Registral
cd /d "%~dp0"

echo ========================================================
echo   INSTALACAO DOS COMPONENTES - QUALIFICADOR REGISTRAL
echo ========================================================
echo.
echo Baixando e instalando as bibliotecas do sistema...
echo Por favor, aguarde alguns instantes.
echo.
call npm install
echo.
echo ========================================================
echo   Instalacao concluida com sucesso!
echo   Para abrir o programa agora, execute: INICIAR_SISTEMA.bat
echo ========================================================
echo.
pause