@echo off
cd /d "%~dp0"
echo.
echo Iniciando IGS Restaurant PRO local...
start "IGS Restaurant PRO - Local" "%~dp0rodar_local.bat"
echo.
echo Aguarde alguns segundos para o sistema iniciar.
timeout /t 5 /nobreak >nul
echo.
echo Abrindo tunel publico pelo localhost.run...
echo.
echo Se perguntar "Are you sure you want to continue connecting?", digite yes e aperte ENTER.
echo.
ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -R 80:127.0.0.1:8000 nokey@localhost.run
pause
