SERVICE_NAME=optiohire
SERVICE_FILE=$(SERVICE_NAME).service
LOGROTATE_FILE=$(SERVICE_NAME).logrotate
INSTALL_PATH=/etc/systemd/system/$(SERVICE_FILE)
LOGROTATE_PATH=/etc/logrotate.d/$(SERVICE_NAME)
LOG_DIR=/var/log/$(SERVICE_NAME)
APP_DIR=$(shell pwd)
USER=$(shell whoami)
NODE_PATH=$(shell which node)

.PHONY: all up install uninstall build reload restart stop logs status clean help kill-ghosts

# Default target: Make then kaboooooom!
all: up

up: install
	@echo "🚀 KABOOOOOOM! Server is up and running."

kill-ghosts:
	@echo "👻 Killing lingering processes on ports 3000 and 3001..."
	-sudo fuser -k 3000/tcp 3001/tcp || true
	-sudo pkill -f "next-server" || true
	-sudo pkill -f "node dist/server.js" || true

build:
	@echo "🏗️ Building Monorepo..."
	npm install
	@echo "📦 Building Backend..."
	cd backend && npm install && npm run build
	@echo "📦 Building Frontend (Standalone)..."
	cd frontend && npm install && npm run build
	@echo "🎨 Preparing Standalone Assets..."
	cp -r frontend/public frontend/.next/standalone/frontend/ 2>/dev/null || true
	cp -r frontend/.next/static frontend/.next/standalone/frontend/.next/ 2>/dev/null || true
	@echo "✅ Build complete."

install: build kill-ghosts
	@echo "🛠️ Installing systemd service..."
	@sed "s|{{WORKING_DIR}}|$(APP_DIR)|g; s|{{USER}}|$(USER)|g; s|{{NODE_PATH}}|$(NODE_PATH)|g" $(SERVICE_NAME).service.template > $(SERVICE_FILE)
	sudo cp $(SERVICE_FILE) $(INSTALL_PATH)
	
	@echo "📁 Setting up log directory..."
	sudo mkdir -p $(LOG_DIR)
	sudo chown $(USER):$(USER) $(LOG_DIR)
	
	@echo "🔄 Installing logrotate config..."
	@sed "s|{{USER}}|$(USER)|g" $(SERVICE_NAME).logrotate.template > $(LOGROTATE_FILE)
	sudo cp $(LOGROTATE_FILE) $(LOGROTATE_PATH)
	
	sudo systemctl daemon-reload
	sudo systemctl enable $(SERVICE_NAME)
	sudo systemctl restart $(SERVICE_NAME)
	@echo "✅ Service installed and updated."

uninstall: kill-ghosts
	@echo "⚠️ Uninstalling systemd service..."
	sudo systemctl stop $(SERVICE_NAME) || true
	sudo systemctl disable $(SERVICE_NAME) || true
	sudo rm -f $(INSTALL_PATH)
	sudo rm -f $(SERVICE_FILE)
	sudo rm -f $(LOGROTATE_PATH)
	sudo rm -f $(LOGROTATE_FILE)
	sudo systemctl daemon-reload
	@echo "✅ Service removed."

reload: build kill-ghosts
	@echo "🔄 Reloading service (Build + Restart)..."
	sudo systemctl restart $(SERVICE_NAME)
	@echo "✅ Service reloaded."


restart:
	@echo "🔄 Restarting systemd service..."
	sudo systemctl restart $(SERVICE_NAME)
	@echo "✅ Service restarted."

stop:
	@echo "🛑 Stopping service..."
	sudo systemctl stop $(SERVICE_NAME)
	@echo "✅ Service stopped."

logs:
	@tail -f $(LOG_DIR)/optiohire.log

status:
	@systemctl status $(SERVICE_NAME)

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf backend/dist frontend/.next
	@echo "✅ Cleanup complete."

help:
	@echo "Usage:"
	@echo "  make          - Build and start the server (kaboom!)"
	@echo "  make reload   - Rebuild and restart the service"
	@echo "  make logs     - Follow the service logs"
	@echo "  make status   - Check service status"
	@echo "  make stop     - Stop the service"
	@echo "  make uninstall - Remove the service from systemd"
