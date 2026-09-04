#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Memulai Update Otomatis GoLearn..."
echo "=========================================="

# 1. Tarik kode terbaru dari GitHub
echo "📦 1/4 Menarik update dari GitHub..."
cd ~/go-learning
git pull origin main

# 2. Build ulang Backend Go
echo "🔨 2/4 Meng-compile Go Backend..."
cd ~/go-learning/backend
go build -o server ./cmd/server
chmod +x server

# 3. Build ulang Frontend Next.js
echo "⚛️ 3/4 Meng-compile Next.js Frontend..."
cd ~/go-learning/frontend
npm install --legacy-peer-deps
npm run build

# 4. Restart PM2 tanpa downtime
echo "🔄 4/4 Me-reload proses PM2..."
cd ~/go-learning
pm2 restart ecosystem.config.js
pm2 save

echo "=========================================="
echo "✅ SUKSES! GoLearn sudah update ke versi terbaru."
echo "🌐 URL: https://golearn.duckdns.org"
echo "=========================================="
