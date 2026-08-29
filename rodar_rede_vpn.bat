@echo off
cd /d "%~dp0"
if not exist .venv (
  python -m venv .venv
)
call .venv\Scripts\activate.bat
pip install -r requirements.txt
echo.
echo IGS Restaurant PRO rodando para rede/VPN.
echo Acesse neste computador: http://127.0.0.1:8000/
echo Acesse pela VPN/Rede usando o IP deste computador, exemplo:
echo http://26.87.10.70:8000/
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000
