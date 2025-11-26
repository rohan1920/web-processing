@echo off
echo ========================================
echo Python Service Setup and Start
echo ========================================
echo.
cd python-service

echo Step 1: Installing dependencies...
pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Make sure pip is installed and Python is in your PATH
    pause
    exit /b 1
)

echo.
echo Step 2: Starting Python service...
echo.
python api.py

pause

