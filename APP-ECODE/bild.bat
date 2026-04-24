@echo off
:: Define o terminal para UTF-8 para exibir acentos corretamente
chcp 65001 >nul
setlocal

:: Evita execucao por colagem linha a linha no terminal
if /I not "%~x0"==".bat" if /I not "%~x0"==".cmd" (
    echo [Erro] Execute este arquivo .bat diretamente, nao cole o conteudo no terminal.
    echo Exemplo: clique duas vezes no arquivo ou rode: "bild (1).bat"
    echo.
    pause
    exit /b 1
)

:: Garante execucao na pasta do proprio script (raiz do projeto)
cd /d "%~dp0"

if not exist "package.json" (
    echo [Erro] package.json nao encontrado em "%CD%".
    echo Execute este script dentro da pasta do projeto APP-ECODE.
    echo.
    pause
    exit /b 1
)

echo ===================================================
echo   Construtor de Build Local - Expo (Android)
echo ===================================================
echo.

:: 1. Pergunta o tipo de build (APK ou AAB)
:ask_type
set /p BUILD_TYPE="Deseja gerar um APK ou AAB? (Digite apk ou aab): "
if /I "%BUILD_TYPE%"=="apk" goto ask_dest
if /I "%BUILD_TYPE%"=="aab" goto ask_dest
echo [Erro] Opcao invalida. Digite apenas 'apk' ou 'aab'.
echo.
goto ask_type

:: 2. Pergunta onde salvar o arquivo final
:ask_dest
echo.
set /p DESTINATION="Digite o caminho completo de onde deseja salvar (ex: C:\Users\Nome\Desktop): "
if not exist "%DESTINATION%" (
    echo [Erro] A pasta de destino "%DESTINATION%" nao existe. Verifique o caminho e tente novamente.
    echo.
    goto ask_dest
)

echo.
echo ===================================================
echo   Iniciando processo de build...
echo ===================================================

:: Pre-check do Java para evitar erro tardio no Gradle
where java >nul 2>&1
if errorlevel 1 (
    if not defined JAVA_HOME (
        echo [Erro] Java nao encontrado e JAVA_HOME nao esta definido.
        echo Instale o JDK 17 e configure as variaveis JAVA_HOME e PATH.
        echo Exemplo de JAVA_HOME: C:\Program Files\Java\jdk-17
        echo.
        pause
        exit /b 1
    )

    if not exist "%JAVA_HOME%\bin\java.exe" (
        echo [Erro] JAVA_HOME definido, mas java.exe nao foi encontrado:
        echo "%JAVA_HOME%\bin\java.exe"
        echo Corrija o valor de JAVA_HOME para a pasta do JDK.
        echo.
        pause
        exit /b 1
    )

    set "PATH=%JAVA_HOME%\bin;%PATH%"
)

:: 3. Instala dependências do Node (caso não estejam instaladas)
echo.
echo [1/4] Instalando pacotes (npm install)...
call npm install
if errorlevel 1 (
    echo [Erro] Falha no npm install.
    echo.
    pause
    exit /b 1
)

:: 4. Gera a pasta nativa do Android via Expo Prebuild
echo.
echo [2/4] Preparando o projeto nativo (expo prebuild)...
:: O parametro --clean garante que uma build anterior com falha nao atrapalhe
call npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo [Erro] Falha no expo prebuild.
    echo.
    pause
    exit /b 1
)

:: Entra na pasta nativa gerada
if not exist "android\gradlew.bat" (
    echo [Erro] gradlew.bat nao encontrado em "android".
    echo Verifique se o expo prebuild concluiu corretamente.
    echo.
    pause
    exit /b 1
)
cd /d android

:: 5. Executa o build via Gradle dependendo da escolha
echo.
echo [3/4] Compilando o aplicativo via Gradle (isso pode demorar varios minutos)...
if /I "%BUILD_TYPE%"=="apk" (
    call gradlew.bat assembleRelease
    set FILE_SOURCE=app\build\outputs\apk\release\app-release.apk
    set FILE_NAME=app-release.apk
) else (
    call gradlew.bat bundleRelease
    set FILE_SOURCE=app\build\outputs\bundle\release\app-release.aab
    set FILE_NAME=app-release.aab
)

if errorlevel 1 (
    cd /d ..
    echo.
    echo ===================================================
    echo   ERRO NO BUILD!
    echo   O Gradle retornou erro durante a compilacao.
    echo   Role o terminal para cima e verifique os detalhes.
    echo ===================================================
    echo.
    pause
    exit /b 1
)

:: Volta para a raiz do projeto
cd /d ..

:: 6. Verifica se o build deu certo e move para o destino
echo.
echo [4/4] Finalizando...
if exist "android\%FILE_SOURCE%" (
    echo Copiando arquivo para o destino selecionado...
    copy /Y "android\%FILE_SOURCE%" "%DESTINATION%\%FILE_NAME%" >nul
    echo.
    echo ===================================================
    echo   SUCESSO! 
    echo   Arquivo salvo em: "%DESTINATION%\%FILE_NAME%"
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo   ERRO NO BUILD!
    echo   O arquivo %BUILD_TYPE% nao foi gerado.
    echo   Role o terminal para cima e verifique os erros do Gradle.
    echo ===================================================
)

echo.
pause