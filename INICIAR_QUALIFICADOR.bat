@echo off
cd /d "%~dp0"
title Qualificador Registral - CRI Rondonia
color 0b
cls

echo ====================================================================
echo           QUALIFICADOR REGISTRAL - CARTORIO DE IMOVEIS
echo ====================================================================
echo.

echo [1/2] Verificando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo.
    echo [ERRO] Node.js nao encontrado neste computador!
    echo Baixe e instale em: https://nodejs.org
    echo.
    pause
    exit /b
)

echo [2/2] Abrindo navegador e iniciando servidor...
echo.
echo ====================================================================
echo   SISTEMA RODANDO COM SUCESSO!
echo.
echo   * Acesse no navegador deste computador:
echo     http://localhost:3000
echo.
echo   * Para ver o IP deste computador para a rede do cartorio,
echo     abra outro terminal e digite: ipconfig
echo ====================================================================
echo.
echo (Mantenha esta janela aberta enquanto estiver usando o sistema)
echo.

start "" http://localhost:3000

call npx next start -H 0.0.0.0 -p 3000
if %errorlevel% neq 0 (
    echo Tentando iniciar em modo de desenvolvimento...
    call npm run dev
)

pause
