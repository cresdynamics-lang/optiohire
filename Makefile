SERVICE_NAME=optiohire
SERVICE_FILE=$(SERVICE_NAME).service
INSTALL_PATH=/etc/systemd/system/$(SERVICE_FILE)
APP_DIR=$(shell pwd)
USER=$(shell whoami)
NODE_PATH=$(shell which node)

.PHONY: all up install uninstall build reload restart stop logs status clean help

# Default target: Make then kaboooooom!
all: up

up: install
	@echo "🚀 KABOOOOOOM! Server is up and running."

build:
	@echo "🏗️ Building Monorepo..."
	npm install
	@echo "📦 Building Backend..."
	cd backend && npm install && npm run build
	@echo "📦 Building Frontend..."
	cd frontend && npm install && npm run build
	@echo "✅ Build complete."

install: build
	@echo "🛠️ Installing systemd service..."
	@sed "s|{{WORKING_DIR}}|$(APP_DIR)|g; s|{{USER}}|$(USER)|g; s|{{NODE_PATH}}|$(NODE_PATH)|g" $(SERVICE_NAME).service.template > $(SERVICE_FILE)
	sudo cp $(SERVICE_FILE) $(INSTALL_PATH)
	sudo systemctl daemon-reload
	sudo systemctl enable $(SERVICE_NAME)
	sudo systemctl start $(SERVICE_NAME)
	@echo "✅ Service installed and started."

uninstall:
	@echo "⚠️ Uninstalling systemd service..."
	sudo systemctl stop $(SERVICE_NAME) || true
	sudo systemctl disable $(SERVICE_NAME) || true
	sudo rm -f $(INSTALL_PATH)
	sudo rm -f $(SERVICE_FILE)
	sudo systemctl daemon-reload
	@echo "✅ Service removed."

reload: build
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
	@journalctl -u $(SERVICE_NAME) -f

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
