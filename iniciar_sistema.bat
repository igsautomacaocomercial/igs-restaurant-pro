@echo off
:: Garante que o script roda no diretório atual
cd /d "%~dp0"

:: Verifica se a pasta do ambiente virtual NÃO existe
if not exist .venv (
    echo [INFO] Criando ambiente virtual .venv...
    python -m venv .venv
    
    echo [INFO] Ativando ambiente virtual...
    call .venv\Scripts\activate.bat
    
    echo [INFO] Instalando dependencias pela primeira vez...
    pip install --upgrade pip
    pip install -r requirements.txt
) else (
    echo [INFO] Ambiente virtual ja existe. Ativando...
    call .venv\Scripts\activate.bat
)

:: Inicia o servidor local com recarregamento automatico (--reload)
echo [INFO] Iniciando o servidor Uvicorn...
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
