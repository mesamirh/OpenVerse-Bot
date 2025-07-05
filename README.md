# 🚀 OpenVerse Automation Bot

An automated bot for interacting with the OpenVerse platform to perform daily tasks, claim rewards, and manage multiple wallet accounts efficiently.

## ✨ Features

- **Multi-Wallet Support**: Process multiple crypto wallets simultaneously
- **Automated Daily Check-ins**: Automatically perform daily sign-ins to earn points
- **tBTG Token Claiming**: Automatically claim test BitGold (tBTG) tokens
- **Session Management**: Handles authentication and session cookies automatically
- **Real-time Status Display**: Beautiful console output with color-coded status updates
- **Error Handling**: Robust error handling with detailed logging
- **Referral Support**: Built-in referral code system

## 📋 Prerequisites

- ~~Node.js (v16 or higher)~~ **Now auto-installed if missing!**
- ~~npm or yarn package manager~~ **Comes with Node.js**
- Valid Ethereum wallet private key(s)

## 🛠️ Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/mesamirh/OpenVerse-Bot.git
   cd OpenVerse-Bot
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy the `.env.example` file to `.env`
   - Add your wallet private keys and referral code

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Paste your wallet private key here.
# Do NOT include the '0x' prefix.
# If you have multiple keys, separate them with a comma, e.g., key1,key2
PRIVATE_KEYS=your_private_key_without_0x_prefix

# The referral code to use for new accounts.
REFERRAL_CODE=TTK5I6LN
```

### Important Security Notes:

- ⚠️ **Never share your private keys**
- ⚠️ **Keep your `.env` file secure and never commit it to version control**
- ⚠️ **Remove the `0x` prefix from your private keys**
- ⚠️ **Use comma separation for multiple private keys**

## 🚀 Quick Start (One-Click Run)

### For Windows Users:

1. **Right-click** on `run.bat` → **"Run as administrator"** (recommended)
   OR
   **Double-click** `run.bat` directly

### For macOS Users:

1. **First time only**: Open Terminal and run:
   ```bash
   chmod +x run.sh
   ```
2. **Then double-click** `run.sh` in Finder
   OR
   **Right-click** → **"Open with Terminal"**

### For Linux Users:

1. **First time only**: Open Terminal and run:
   ```bash
   chmod +x run.sh
   ```
2. **Then double-click** `run.sh` in your file manager
   OR
   **Run in terminal**:
   ```bash
   ./run.sh
   ```

The script will automatically:

- **🔍 Detect if Node.js is installed**
- **📦 Auto-install Node.js if missing** (latest LTS version)
- **🔧 Install all required dependencies**
- **⚙️ Verify your `.env` configuration**
- **🚀 Start the bot**

### Supported Installation Methods:

- **Windows**: Direct MSI installer download
- **macOS**: Homebrew (auto-installs Homebrew if needed)
- **Linux**:
  - Debian/Ubuntu: `apt-get`
  - Red Hat/CentOS/Fedora: `yum`/`dnf`
  - Arch Linux: `pacman`

## 🛠️ Manual Installation (Alternative)

If you prefer manual installation or if the one-click scripts don't work for you:

1. **Install Node.js**:

   - Download and install from [Node.js official website](https://nodejs.org/)

2. **Clone the repository**:

   ```bash
   git clone https://github.com/mesamirh/OpenVerse-Bot.git
   cd OpenVerse-Bot
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Configure environment variables**:
   - Copy the `.env.example` file to `.env`
   - Add your wallet private keys and referral code

## 🚀 Usage

### Option 1: One-Click Run (Recommended)

- **macOS/Linux**: Run `./run.sh`
- **Windows**: Double-click `run.bat`

### Option 2: Manual Run

```bash
node bot.js
```

The bot will:

1. Load all configured wallet accounts
2. For each account:
   - Authenticate with the OpenVerse platform
   - Display initial account status (points, tBTG balance)
   - Perform daily check-in
   - Claim tBTG tokens
   - Display final account status
3. Process all accounts with appropriate delays between operations

## 📊 Bot Activities

The bot performs the following automated tasks:

| Task               | Description                   | Reward      |
| ------------------ | ----------------------------- | ----------- |
| **Daily Check-in** | Signs in daily to earn points | Points      |
| **tBTG Claiming**  | Claims test BitGold tokens    | tBTG tokens |

## 🎨 Console Output

The bot provides colorful, real-time console output showing:

- 🔒 Authentication status
- ✍️ Message signing progress
- ✅ Successful operations
- ⚠️ Warnings and already completed tasks
- ❌ Errors and failures
- 👤 Account status with points and token balances

## 📁 Project Structure

```
openverse-bot/
├── bot.js              # Main bot application
├── run.sh              # Auto-setup script for macOS/Linux
├── run.bat             # Auto-setup script for Windows
├── package.json        # Node.js dependencies and scripts
├── .env               # Environment configuration (not tracked)
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🔧 Dependencies

- **ethers**: Ethereum wallet and signing functionality
- **axios**: HTTP client for API requests
- **axios-cookiejar-support**: Cookie jar support for session management
- **tough-cookie**: Cookie parsing and management
- **chalk**: Terminal text styling and colors
- **dotenv**: Environment variable management

## 🐛 Troubleshooting

### Common Issues:

1. **Script opens in text editor instead of running**

   **Windows:**

   - Right-click `run.bat` → **"Open with" → "Command Prompt"**
   - OR run as administrator

   **macOS/Linux:**

   ```bash
   chmod +x run.sh
   ./run.sh
   ```

2. **"Permission denied" error (macOS/Linux)**

   ```bash
   chmod +x run.sh
   ```

3. **Windows: "This app can't run on your PC"**

   - Right-click `run.bat` → **"Run as administrator"**
   - OR disable Windows Defender temporarily

4. **macOS: "Cannot be opened because it is from an unidentified developer"**

   - Right-click `run.sh` → **"Open"** → **"Open"** (confirm)
   - OR run in Terminal: `./run.sh`

5. **Node.js auto-installation fails**

   - **Windows**: Run as Administrator
   - **macOS/Linux**: Ensure you have sudo privileges
   - **Fallback**: Manual install from https://nodejs.org/

6. **Linux: "sudo command not found"**

   - Switch to root user: `su -`
   - Or install sudo: `apt-get install sudo` (Debian/Ubuntu)

7. **macOS: Homebrew installation fails**

   - Check internet connection
   - Try manual Node.js installation from https://nodejs.org/

8. **"No private keys found"**

   - Ensure your `.env` file exists and contains valid `PRIVATE_KEYS`
   - Check that private keys don't include the `0x` prefix

9. **Login failures**

   - Verify your private keys are valid
   - Check your internet connection
   - Ensure the OpenVerse platform is accessible

10. **Module import errors**

- Run `npm install` to ensure all dependencies are installed
- Check Node.js version compatibility

## 🔐 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use separate wallets** for automation (don't use your main wallet)
3. **Keep private keys secure** and never share them
4. **Regularly update dependencies** for security patches
5. **Monitor bot activity** and stop if unusual behavior occurs
