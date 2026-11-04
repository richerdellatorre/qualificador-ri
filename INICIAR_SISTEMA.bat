@echo off
title Qualificador Registral - CRI Rondonia
cd /d "%~dp0"

echo ========================================================
echo        QUALIFICADOR REGISTRAL - CRI RONDONIA
echo ========================================================
echo.
echo Iniciando o servidor...
echo Abrindo seu navegador em http://localhost:3000
echo.
echo Para encerrar o sistema, basta fechar esta janela.
echo ========================================================
echo.

start "" "http://localhost:3000"
call npm run dev