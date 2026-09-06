@echo off
REM Run backend and frontend servers in separate windows (Windows .bat)
SET ROOT_DIR=%~dp0
echo Starting Financial Worldmap backend and frontend...

REM Start backend (run server.py directly; server.py uses debug=True for auto-reload)
REM Ensure Python requirements are installed before starting servers
echo Installing Python requirements from requirements.txt (this may take a moment)...
cd /d "%ROOT_DIR%"
python -m pip install -r requirements.txt

REM Start backend (run server.py directly; server.py uses debug=True for auto-reload)
start "Financial Worldmap - Backend" cmd /k "cd /d "%ROOT_DIR%backend" && python server.py"

REM Small delay to allow backend to start
timeout /t 2 >nul

REM Start frontend dev server (uses livereload if installed, otherwise fallback)
start "Financial Worldmap - Frontend" cmd /k "cd /d "%ROOT_DIR%frontend" && python dev_server.py"

REM Open default browser to frontend
start "" "http://localhost:8000"

echo Done. Two windows opened. Close them to stop the servers.
exit /b 0
