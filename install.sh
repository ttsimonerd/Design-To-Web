#!/bin/bash

set -e

echo ""
echo "====================================="
echo "  Rest Express - Project Installer"
echo "====================================="
echo ""

# ─── Helpers ──────────────────────────────────────────────────────────────────

ask_install() {
  local name="$1"
  read -p "  '$name' is not installed. Install it automatically? [y/N]: " answer
  case "$answer" in
    [yY][eE][sS]|[yY]) return 0 ;;
    *) return 1 ;;
  esac
}

detect_os() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macos"
  elif [[ -f /etc/debian_version ]]; then
    echo "debian"
  elif [[ -f /etc/redhat-release ]]; then
    echo "redhat"
  else
    echo "unknown"
  fi
}

OS=$(detect_os)

# ─── Install Node.js ──────────────────────────────────────────────────────────

install_node() {
  echo ""
  echo "  Installing Node.js..."

  if [[ "$OS" == "macos" ]]; then
    if ! command -v brew &> /dev/null; then
      echo "  Installing Homebrew first..."
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install node

  elif [[ "$OS" == "debian" ]]; then
    echo "  Using NodeSource to install the latest Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs

  elif [[ "$OS" == "redhat" ]]; then
    curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
    sudo yum install -y nodejs

  else
    echo ""
    echo "  Could not auto-install Node.js on your system."
    echo "  Please install it manually from: https://nodejs.org"
    exit 1
  fi

  echo "  Node.js installed successfully."
}

# ─── Install Git ──────────────────────────────────────────────────────────────

install_git() {
  echo ""
  echo "  Installing Git..."

  if [[ "$OS" == "macos" ]]; then
    if ! command -v brew &> /dev/null; then
      echo "  Installing Homebrew first..."
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install git

  elif [[ "$OS" == "debian" ]]; then
    sudo apt-get update -qq
    sudo apt-get install -y git

  elif [[ "$OS" == "redhat" ]]; then
    sudo yum install -y git

  else
    echo ""
    echo "  Could not auto-install Git on your system."
    echo "  Please install it manually from: https://git-scm.com"
    exit 1
  fi

  echo "  Git installed successfully."
}

# ─── Check Git ────────────────────────────────────────────────────────────────

echo "Checking dependencies..."
echo ""

if ! command -v git &> /dev/null; then
  echo "  Git: NOT FOUND"
  if ask_install "git"; then
    install_git
  else
    echo "  Skipping Git. You can install it later from: https://git-scm.com"
  fi
else
  echo "  Git $(git --version | awk '{print $3}'): OK"
fi

# ─── Check Node.js ────────────────────────────────────────────────────────────

if ! command -v node &> /dev/null; then
  echo "  Node.js: NOT FOUND"
  if ask_install "node"; then
    install_node
  else
    echo ""
    echo "ERROR: Node.js is required to run this app."
    echo "Install it from https://nodejs.org and re-run this script."
    exit 1
  fi
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 18 ]; then
  echo "  Node.js $(node -v): OUTDATED (v18+ required)"
  if ask_install "node (latest)"; then
    install_node
  else
    echo ""
    echo "ERROR: Node.js v18 or later is required. Please upgrade and re-run this script."
    exit 1
  fi
else
  echo "  Node.js $(node -v): OK"
fi

# ─── Check npm ────────────────────────────────────────────────────────────────

if ! command -v npm &> /dev/null; then
  echo "  npm: NOT FOUND"
  if ask_install "npm"; then
    echo "  npm comes bundled with Node.js. Reinstalling Node.js..."
    install_node
  else
    echo ""
    echo "ERROR: npm is required. It is included with Node.js — install from https://nodejs.org"
    exit 1
  fi
else
  echo "  npm $(npm -v): OK"
fi

echo ""

# ─── Install project dependencies ─────────────────────────────────────────────

echo "Installing project dependencies..."
npm install
echo "Done."
echo ""

# ─── Set up .env ──────────────────────────────────────────────────────────────

if [ ! -f .env ]; then
  echo "Setting up environment..."
  echo ""
  read -p "Enter your PostgreSQL DATABASE_URL (or press Enter to skip): " DB_URL

  if [ -n "$DB_URL" ]; then
    echo "DATABASE_URL=$DB_URL" > .env
    echo ".env file created."
  else
    echo "DATABASE_URL=" > .env
    echo "WARNING: No database URL provided. Edit .env and add your DATABASE_URL before starting the app."
  fi
else
  echo ".env file already exists, skipping."
fi

echo ""

# ─── Set up database ──────────────────────────────────────────────────────────

if grep -q "DATABASE_URL=." .env 2>/dev/null; then
  echo "Setting up database..."
  npm run db:push
  echo "Database ready."
else
  echo "Skipping database setup (no DATABASE_URL set)."
fi

echo ""
echo "====================================="
echo "  Installation complete!"
echo "====================================="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The app will be available at http://localhost:5000"
echo ""
