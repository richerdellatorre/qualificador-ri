@echo off
title Qualificador Registral - CRI Rondonia
cd /d "%~dp0"

echo ========================================================
echo        QUALIFICADOR REGISTRAL - CRI RONDONIA
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ========================================================
    echo [ATENCAO] O Node.js NAO esta instalado neste computador!
    echo ========================================================
    echo.
    echo COMO RESOLVER EM 1 MINUTO:
    echo 1. Va na pasta deste programa.
    echo 2. De dois cliques no arquivo:
    echo    1_INSTALAR_PRIMEIRO_node-v22-x64.msi
    echo 3. Clique em Next e Avancar ate concluir a instalacao.
    echo 4. Feche esta janela preta e abra o INICIAR_SISTEMA.bat de novo.
    echo.
    echo ========================================================
    pause
    exit /b
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O comando npm nao foi encontrado.
    echo Por favor, instale o arquivo: 1_INSTALAR_PRIMEIRO_node-v22-x64.msi
    echo.
    pause
    exit /b
)

echo [OK] Node.js detectado com sucesso.
echo Iniciando o servidor...
echo Abrindo seu navegador em http://localhost:3000 ...
echo.
echo ========================================================
echo ATENCAO: Mantenha esta janela aberta enquanto usar!
echo Para encerrar o sistema, basta fechar esta janela.
echo ========================================================
echo.

start "" "http://localhost:3000"
call npm run dev

echo.
echo Servidor encerrado.
pause