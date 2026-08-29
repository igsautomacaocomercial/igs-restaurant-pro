@echo off
echo.
echo Abrindo tunel publico pelo localhost.run...
echo.
echo Antes de usar este arquivo, deixe o sistema rodando em outra janela:
echo C:\IGS\RestaurantPRO\rodar_local.bat
echo.
echo Se perguntar "Are you sure you want to continue connecting?", digite yes e aperte ENTER.
echo.
ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -R 80:127.0.0.1:8000 nokey@localhost.run
pause
