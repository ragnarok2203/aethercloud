#!/bin/bash
# ====================================================================
# CloudOps Platform - API Endpoint Health Checker
# ====================================================================

URL="http://localhost:5000/api/cloud/overview"

echo "🔍 Probing endpoint: $URL"

HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" $URL)

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ SUCCESS: CloudOps API is healthy (HTTP $HTTP_STATUS)!"
    exit 0
else
    echo "❌ FAILURE: Health check failed with status HTTP $HTTP_STATUS."
    exit 1
fi
