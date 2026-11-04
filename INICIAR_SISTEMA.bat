@echo off
chcp 65001 > nul
title Qualificador Registral - CRI Rondônia
cd /d "%~dp0"

echo ========================================================
echo        QUALIFICADOR REGISTRAL - CRI RONDÔNIA
echo ========================================================
echo.
echo [1/2] Iniciando o servidor do sistema...
echo [2/2] Abrindo seu navegador em http://localhost:3000...
echo.
echo Para fechar o sistema, basta fechar esta janela preta.
echo ========================================================
echo.

:: Aguarda 3 segundos para o servidor subir e abre o navegador automaticamente
start "" cmd /c "timeout /t 3 /nobreak > nul && start http://localhost:3000"

:: Inicia o sistema
call npm run dev
