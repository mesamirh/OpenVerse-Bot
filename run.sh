#!/bin/bash

clear
echo "🚀 OpenVerse Bot - Auto Setup & Run"
echo "=================================="

# Function to install Node.js on macOS
install_nodejs_macos() {
    echo "📦 Auto-installing Node.js on macOS..."
    
    # Check if Homebrew is installed
    if command -v brew &> /dev/null; then
        echo "🍺 Using Homebrew to install Node.js..."
        brew install node
    else
        echo "🍺 Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for this session
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            export PATH="/opt/homebrew/bin:$PATH"
        elif [[ -f "/usr/local/bin/brew" ]]; then
            export PATH="/usr/local/bin:$PATH"
        fi
        
        echo "🍺 Installing Node.js with Homebrew..."
        brew install node
    fi
}

# Function to install Node.js on Linux
install_nodejs_linux() {
    echo "📦 Auto-installing Node.js on Linux..."
    
    # Detect Linux distribution
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        echo "🐧 Detected Debian/Ubuntu - using apt-get..."
        sudo apt-get update
        sudo apt-get install -y curl
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        # Red Hat/CentOS/Fedora
        echo "🐧 Detected Red Hat/CentOS/Fedora - using yum..."
        sudo yum install -y curl
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
        sudo yum install -y nodejs
    elif command -v dnf &> /dev/null; then
        # Fedora with dnf
        echo "🐧 Detected Fedora - using dnf..."
        sudo dnf install -y curl
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
        sudo dnf install -y nodejs
    elif command -v pacman &> /dev/null; then
        # Arch Linux
        echo "🐧 Detected Arch Linux - using pacman..."
        sudo pacman -S --noconfirm nodejs npm
    else
        echo "❌ Unsupported Linux distribution!"
        echo "Please install Node.js manually from https://nodejs.org/"
        echo "Press Enter to exit..."
        read
        exit 1
    fi
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "🔍 Detecting operating system..."
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        install_nodejs_macos
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        install_nodejs_linux
    else
        echo "❌ Unsupported operating system: $OSTYPE"
        echo "Please install Node.js manually from https://nodejs.org/"
        echo "Press Enter to exit..."
        read
        exit 1
    fi
    
    # Verify installation
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js installation failed!"
        echo "Please install Node.js manually from https://nodejs.org/"
        echo "Press Enter to exit..."
        read
        exit 1
    fi
    
    echo "✅ Node.js installed successfully!"
    echo ""
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    echo "Please install npm (usually comes with Node.js)"
    echo "Press Enter to exit..."
    read
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Please create a .env file with your configuration."
    echo "You can copy .env.example to .env and edit it."
    echo ""
    echo "Press Enter to exit..."
    read
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    echo "Please make sure you're in the correct directory."
    echo "Press Enter to exit..."
    read
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    echo "Press Enter to exit..."
    read
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo ""

# Run the bot
echo "🤖 Starting OpenVerse Bot..."
echo "Press Ctrl+C to stop the bot"
echo ""
node bot.js

# Wait for user input before closing
echo ""
echo "Bot finished. Press Enter to exit..."
read