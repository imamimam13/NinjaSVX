#!/usr/bin/env bash
# ==============================================================================
#  🥷 NINJASVX - Automated Installer for Raspberry Pi & Ubuntu/Debian Server
#  Built for SvxLink (Tobias Blomberg / SM0SVX)
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "=========================================================="
echo "      🥷  NINJASVX TACTICAL WEB CONTROLLER INSTALLER     "
echo "=========================================================="
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this script as root or using sudo: sudo bash scripts/install.sh${NC}"
  exit 1
fi

CURRENT_USER=${SUDO_USER:-$USER}
INSTALL_DIR=$(pwd)

echo -e "${GREEN}[1/6] Updating system packages & installing build dependencies...${NC}"
apt-get update -y
apt-get install -y \
  git cmake make gcc g++ \
  libsigc++-2.0-dev libgsm1-dev libpopt-dev tcl-dev libgcrypt20-dev \
  libspeex-dev libasound2-dev libopus-dev alsa-utils curl \
  curl ca-certificates gnupg

# Install Node.js if not present
if ! command -v node &> /dev/null; then
  echo -e "${GREEN}[2/6] Installing Node.js LTS...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo -e "${CYAN}[2/6] Node.js is already installed: $(node -v)${NC}"
fi

SVXLINK_REPO=${1:-"https://github.com/sm0svx/svxlink.git"}

# Clone and compile SvxLink
if ! command -v svxlink &> /dev/null; then
  echo -e "${GREEN}[3/6] SvxLink not found. Cloning and building from ${SVXLINK_REPO}...${NC}"
  BUILD_DIR="/tmp/svxlink-build"
  rm -rf "$BUILD_DIR"
  git clone --depth 1 "$SVXLINK_REPO" "$BUILD_DIR"
  mkdir -p "$BUILD_DIR/src/build"
  cd "$BUILD_DIR/src/build"

  cmake -DUSE_QT=OFF \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DSYSCONF_INSTALL_DIR=/etc \
        -DLOCAL_STATE_DIR=/var \
        ..

  make -j$(nproc)
  make install
  ldconfig

  # Create svxlink system user if missing
  if ! id "svxlink" &>/dev/null; then
    useradd -r -s /bin/false -G audio,daemon,dialout,gpio svxlink || true
  fi

  # Install sound files if needed
  echo -e "${GREEN}Installing standard SvxLink sound clips (en_US)...${NC}"
  mkdir -p /usr/share/svxlink/sounds/en_US
  cd /tmp
  curl -sSL -o sounds.tar.bz2 "https://github.com/sm0svx/svxlink-sounds-en_US-heather/releases/download/19.09.99/svxlink-sounds-en_US-heather-16k-19.09.99.tar.bz2" || true
  if [ -f sounds.tar.bz2 ]; then
    tar -xjf sounds.tar.bz2 -C /usr/share/svxlink/sounds/en_US --strip-components=1 || true
    rm -f sounds.tar.bz2
  fi
  cd "$INSTALL_DIR"
else
  echo -e "${CYAN}[3/6] SvxLink binary is already present at $(which svxlink)${NC}"
fi

# Setup PTY files and permissions
echo -e "${GREEN}[4/6] Configuring NinjaSVX PTY pipes and permissions...${NC}"
mkdir -p /etc/svxlink
mkdir -p /var/log
touch /var/log/svxlink
chmod 666 /var/log/svxlink

# Copy sample configuration if svxlink.conf does not exist
if [ ! -f /etc/svxlink/svxlink.conf ]; then
  echo -e "${YELLOW}Deploying optimized NinjaSVX config template to /etc/svxlink/svxlink.conf...${NC}"
  cp "$INSTALL_DIR/scripts/svxlink-ninja.conf" /etc/svxlink/svxlink.conf
  chmod 644 /etc/svxlink/svxlink.conf
fi

echo -e "${GREEN}[5/6] Building NinjaSVX Tactical Frontend & Backend...${NC}"
# Backend dependencies
cd "$INSTALL_DIR/backend"
npm install --production=false

# Frontend build
cd "$INSTALL_DIR/frontend"
npm install
npm run build

# Setup Systemd Service
echo -e "${GREEN}[6/6] Installing NinjaSVX systemd service...${NC}"
cat <<EOF > /etc/systemd/system/ninjasvx.service
[Unit]
Description=NinjaSVX Tactical Radio Controller Web Interface
After=network.target svxlink.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ninjasvx.service
systemctl restart ninjasvx.service

# Detect local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo -e "\n${CYAN}==========================================================${NC}"
echo -e "${GREEN}  🥷  NINJASVX INSTALLATION COMPLETED SUCCESSFULLY!       ${NC}"
echo -e "${CYAN}==========================================================${NC}"
echo -e "Access the Tactical Web Interface at:"
echo -e "  👉 ${YELLOW}http://${LOCAL_IP}:5000${NC} (or http://localhost:5000)"
echo -e ""
echo -e "Service Commands:"
echo -e "  sudo systemctl status ninjasvx"
echo -e "  sudo systemctl restart ninjasvx"
echo -e "  sudo journalctl -u ninjasvx -f"
echo -e "${CYAN}==========================================================${NC}"
