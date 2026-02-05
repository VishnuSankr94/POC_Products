@echo off
title Reply Maker
cd /d "%~dp0"

REM Kill any existing node/electron processes
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1

REM Wait a moment for processes to close
timeout /t 1 /nobreak >nul

REM Launch the app
npm run electron
