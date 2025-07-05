@echo off
REM OpenVerse Bot Auto-Setup & Run Script

title OpenVerse Bot - Auto Setup & Run
color 0A
cls

echo.
echo 🚀 OpenVerse Bot - Auto Setup ^& Run
echo ==================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo 📦 Auto-installing Node.js...
    echo.
    
    REM Create temp directory
    if not exist "%TEMP%\nodejs-installer" mkdir "%TEMP%\nodejs-installer"
    
    REM Download Node.js installer
    echo 📥 Downloading Node.js installer...
    powershell -Command "& {try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi' -OutFile '%TEMP%\nodejs-installer\nodejs.msi'; Write-Host 'Download completed successfully' } catch { Write-Host 'Download failed:' $_.Exception.Message; exit 1 }}"
    
    if %errorlevel% neq 0 (
        echo ❌ Failed to download Node.js installer!
        echo Please install Node.js manually from https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
    
    REM Install Node.js silently
    echo 🔧 Installing Node.js...
    echo Please wait, this may take a few minutes...
    msiexec /i "%TEMP%\nodejs-installer\nodejs.msi" /quiet /norestart
    
    if %errorlevel% neq 0 (
        echo ❌ Node.js installation failed!
        echo Please install Node.js manually from https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
    
    REM Clean up
    if exist "%TEMP%\nodejs-installer" rmdir /s /q "%TEMP%\nodejs-installer"
    
    REM Refresh PATH environment variable
    echo 🔄 Refreshing environment variables...
    call :RefreshEnvironment
    
    REM Check if installation was successful
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Node.js installation completed but not accessible!
        echo Please restart your computer and try again.
        echo Or install Node.js manually from https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
    
    echo ✅ Node.js installed successfully!
    echo.
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed!
    echo Please install npm (usually comes with Node.js)
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version
echo ✅ npm version: 
npm --version
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo Please create a .env file with your configuration.
    echo You can copy .env.example to .env and edit it.
    echo.
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found!
    echo Please make sure you're in the correct directory.
    echo.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if installation was successful
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    echo.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.

REM Run the bot
echo 🤖 Starting OpenVerse Bot...
echo Press Ctrl+C to stop the bot
echo.
node bot.js

REM Wait for user input before closing
echo.
echo Bot finished. Press any key to exit...
pause >nul
goto :eof

REM Function to refresh environment variables
:RefreshEnvironment
for /f "usebackq tokens=2,*" %%A in (`reg query HKCU\Environment /v PATH 2^>nul`) do set UserPath=%%B
for /f "usebackq tokens=2,*" %%A in (`reg query HKLM\SYSTEM\CurrentControlSet\Control\Session` Manager\Environment /v PATH 2^>nul`) do set SystemPath=%%B
if defined UserPath (
    if defined SystemPath (
        set "PATH=%SystemPath%;%UserPath%"
    ) else (
        set "PATH=%UserPath%"
    )
) else (
    if defined SystemPath (
        set "PATH=%SystemPath%"
    )
)
goto :eof