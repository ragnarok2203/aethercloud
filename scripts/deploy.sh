#!/bin/bash
# ====================================================================
# CloudOps Platform - Automated Linux Deployment & Smoke Test Script
# ====================================================================

echo "🚀 Starting CloudOps Multi-Cloud Infrastructure Deployment..."

# Step 1: Check required commands
for cmd in docker kubectl terraform node; do
    if ! command -v $cmd &> /dev/null; then
        echo "⚠️ Warning: Command '$cmd' is not installed in system PATH."
    fi
done

# Step 2: Initialize Docker Compose stack
echo "📦 Spinning up local container stack via Docker Compose..."
docker-compose up -d --build

# Step 3: Wait for server readiness
echo "⏳ Waiting for CloudOps server to respond..."
sleep 3

# Step 4: Execute health check script
chmod +x ./scripts/health_check.sh
./scripts/health_check.sh

echo "🎉 Deployment successfully completed!"
