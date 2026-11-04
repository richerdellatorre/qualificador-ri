@echo off
chcp 65001 > nul
title Instalador - Qualificador Registral
cd /d "%~dp0"

echo ========================================================
echo   INSTALAÇÃO DOS COMPONENTES - QUALIFICADOR REGISTRAL
echo ========================================================
echo.
echo Baixando e preparando as bibliotecas do sistema...
echo Isso pode levar de 1 a 2 minutos na primeira vez.
echo.
call npm install
echo.
echo ========================================================
echo   Instalação concluída com sucesso!
echo   Para abrir o programa agora, execute: INICIAR_SISTEMA.bat
echo ========================================================
echo.
pause
