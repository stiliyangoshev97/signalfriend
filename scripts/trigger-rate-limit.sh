#!/bin/bash

# Script to trigger API rate limiting for testing
# Usage: ./trigger-rate-limit.sh
#
# This will send 110 requests rapidly to hit the 100 request limit
# Run this while on the signal purchase page to test the retry logic

API_URL="http://localhost:3001/api/signals"
TOTAL_REQUESTS=110

echo "🚀 Starting rate limit test..."
echo "📡 Target: $API_URL"
echo "📊 Sending $TOTAL_REQUESTS requests to trigger rate limit (limit is 100)"
echo ""
echo "⏳ Starting in 3 seconds... Open the signal purchase page NOW!"
sleep 3

for i in $(seq 1 $TOTAL_REQUESTS); do
  response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")
  
  if [ "$response" == "429" ]; then
    echo "🚫 Request $i: RATE LIMITED (429)"
  else
    echo "✅ Request $i: OK ($response)"
  fi
  
  # Small delay to avoid overwhelming completely
  sleep 0.05
done

echo ""
echo "✅ Done! Rate limit should now be active."
echo "🧪 Try purchasing a signal now - the blockchain tx should succeed"
echo "   but API calls will fail. The retry logic should recover."
echo ""
echo "⏰ Rate limit will reset in ~15 minutes (or restart the backend)"
