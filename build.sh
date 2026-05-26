#!/bin/bash
# A convenience script to build the frontend and backend locally or in environments that don't use Docker.

set -e

echo "[*] Building React frontend..."
npm install
npm run build

echo "[*] Installing Python dependencies..."
pip install -r requirements.txt

echo "[*] Build complete. You can start the server with:"
echo "    uvicorn app.main:app --host 0.0.0.0 --port 8000"
