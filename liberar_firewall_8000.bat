@echo off
netsh advfirewall firewall add rule name="IGS Restaurant PRO 8000" dir=in action=allow protocol=TCP localport=8000
echo.
echo Porta 8000 liberada no Firewall do Windows.
pause
