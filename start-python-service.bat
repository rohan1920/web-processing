@echo off
echo ========================================
echo Starting Python Document Processing Service
echo ========================================
echo.

cd python-service

REM Check if dependencies are installed
python -c "import fastapi" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Dependencies not found! Installing...
    echo.
    pip install fastapi uvicorn[standard] pdfplumber pydantic
    echo.
)

echo Starting service on http://localhost:8000
echo Press Ctrl+C to stop
echo.
python api.py
