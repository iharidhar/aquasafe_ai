@echo off
title AquaSafe AI - System Launcher
color 0A

echo =========================================================================
echo                   AQUASAFE AI SYSTEM LAUNCHER                             
echo       Outbreak Prevention, Water Security and XGBoost ML Platform          
echo =========================================================================
echo.

set BASE_DIR=%~dp0

echo [1/2] Launching Backend Express Server in separate terminal (Port 3001)...
start "AquaSafe AI - Backend Server" cmd /k "cd /d "%BASE_DIR%backend" && npm run dev"

echo.
echo [2/2] Launching Frontend React/Vite Dashboard in separate terminal (Port 3000)...
start "AquaSafe AI - Frontend App" cmd /k "cd /d "%BASE_DIR%frontend" && npm run dev"

echo.
echo =========================================================================
echo  AquaSafe AI system services started!
echo  -----------------------------------------------------------------------
echo  Backend Server API : http://localhost:3001
echo  Frontend Dashboard  : http://localhost:3000
echo =========================================================================
echo.
echo Press any key to exit launcher script (servers will continue running)...
pause > nul
