@echo off
setlocal enabledelayedexpansion

REM Define diretórios e variáveis
set "PROJECT_DIR=%~dp0"
set "COMPOSE_FILE=%PROJECT_DIR%docker-compose.yml"
set "MODEL_NAME=gemma2:2b"
set "MAX_RETRIES=60"
set "RETRY_DELAY=2"

REM Função para log
:log
echo [install_back] %*
goto :eof

REM Verifica se Docker está instalado e em execução
:check_docker
docker info >nul 2>&1
if %errorlevel% equ 0 (
    call :log Docker encontrado e em execução.
    goto :main
) else (
    call :log Docker não está acessível. Instale o Docker Desktop para Windows e tente novamente.
    echo.
    echo Download: https://www.docker.com/products/docker-desktop
    exit /b 1
)

REM Função principal
:main
cd /d "%PROJECT_DIR%"

if not exist "%COMPOSE_FILE%" (
    call :log Arquivo docker-compose.yml não encontrado em %PROJECT_DIR%
    exit /b 1
)

call :log Subindo banco, Redis e IA pela Docker Compose...
docker compose -f "%COMPOSE_FILE%" up -d db redis ia
if %errorlevel% neq 0 (
    call :log Erro ao iniciar os serviços.
    exit /b 1
)

call :wait_for_ollama

call :log Baixando o modelo %MODEL_NAME%...
docker compose -f "%COMPOSE_FILE%" exec -T ia ollama pull "%MODEL_NAME%"
if %errorlevel% neq 0 (
    call :log Erro ao baixar o modelo.
    exit /b 1
)

call :log Construindo e iniciando a API...
docker compose -f "%COMPOSE_FILE%" up -d --build backend_python
if %errorlevel% neq 0 (
    call :log Erro ao construir e iniciar a API.
    exit /b 1
)

call :log Concluído. API em execução na porta 8080 e Ollama na porta 11434.
exit /b 0

REM Função para aguardar o Ollama ficar pronto
:wait_for_ollama
call :log Aguardando o Ollama responder...
set "count=0"
:retry_ollama
docker compose -f "%COMPOSE_FILE%" exec -T ia ollama list >nul 2>&1
if %errorlevel% equ 0 (
    call :log Ollama está pronto.
    goto :eof
)

set /a count+=1
if %count% geq %MAX_RETRIES% (
    call :log Ollama não ficou pronto no tempo esperado.
    exit /b 1
)

timeout /t %RETRY_DELAY% /nobreak
goto :retry_ollama
