@echo off
chcp 65001 > nul
title Qualificador Registral - CRI Rondônia
color 0B

echo ====================================================================
echo           QUALIFICADOR REGISTRAL - CARTÓRIO DE IMÓVEIS
echo ====================================================================
echo.

:: Descobre o IP local da máquina
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0.*0.0.0.0 ^| findstr /v "255.255.255.255"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip

echo [1/3] Verificando ambiente...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] O Node.js não foi encontrado neste computador!
    echo Para rodar localmente, instale o Node.js baixando de:
    echo https://nodejs.org (versão LTS recomendada).
    echo.
    pause
    exit /b
)

echo [2/3] Verificando compilação do sistema...
if not exist ".next" (
    echo Compilando o sistema pela primeira vez... Isso leva cerca de 1 minuto.
    call npm run build
)

echo [3/3] Iniciando o servidor na rede local...
echo.
echo ====================================================================
echo   SISTEMA PRONTO E RODANDO!
echo.
echo   * Para usar NESTE computador, abra:
echo     http://localhost:3000
echo.
if defined LOCAL_IP (
    echo   * Para colegas usarem em OUTROS computadores da rede:
    echo     http://%LOCAL_IP%:3000
)
echo ====================================================================
echo.
echo (Não feche esta janela enquanto estiver usando o sistema)
echo.

:: Abre o navegador automaticamente após 2 segundos
start "" http://localhost:3000

:: Roda o servidor Next.js escutando em todas as interfaces de rede (0.0.0.0)
call npx next start -H 0.0.0.0 -p 3000

pause
