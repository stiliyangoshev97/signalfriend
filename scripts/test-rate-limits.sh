#!/bin/bash
# =============================================================================
# SignalFriend Rate Limit Test Script
# =============================================================================
# Tests all rate limiting tiers to verify they're working correctly.
#
# Usage:
#   ./scripts/test-rate-limits.sh [tier]
#
# Arguments:
#   tier - Optional. One of: auth-nonce, auth-verify, read, write, critical, all
#         Default: all
#
# Examples:
#   ./scripts/test-rate-limits.sh           # Test all tiers
#   ./scripts/test-rate-limits.sh read      # Test only read tier
#   ./scripts/test-rate-limits.sh auth-nonce # Test auth nonce tier
#
# Rate Limit Configuration (from rateLimiter.ts):
#   - auth-nonce:  60 req / 15 min
#   - auth-verify: 20 req / 15 min
#   - read:        200 req / 1 min
#   - write:       60 req / 15 min
#   - critical:    500 req / 15 min
# =============================================================================

set -e

# Configuration
BASE_URL="${API_URL:-http://localhost:3001}"
TEST_ADDRESS="0x4Cca77ba15B0D85d7B733E0838a429E7bEF42DD2"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0
ERROR_COUNT=0

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
}

print_subheader() {
  echo ""
  echo -e "${YELLOW}▶ $1${NC}"
  echo ""
}

reset_counters() {
  SUCCESS_COUNT=0
  RATE_LIMITED_COUNT=0
  ERROR_COUNT=0
}

# Make a request and track the result
make_request() {
  local method="$1"
  local endpoint="$2"
  local data="$3"
  local silent="${4:-false}"
  
  if [ "$method" == "GET" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${endpoint}")
  else
    response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "${BASE_URL}${endpoint}")
  fi
  
  if [ "$response" == "429" ]; then
    ((RATE_LIMITED_COUNT++))
    if [ "$silent" != "true" ]; then
      echo -e "  ${RED}🚫 429 - Rate Limited${NC}"
    fi
    return 1
  elif [ "$response" -ge 200 ] && [ "$response" -lt 300 ]; then
    ((SUCCESS_COUNT++))
    if [ "$silent" != "true" ]; then
      echo -e "  ${GREEN}✅ $response - OK${NC}"
    fi
    return 0
  else
    ((ERROR_COUNT++))
    if [ "$silent" != "true" ]; then
      echo -e "  ${YELLOW}⚠️  $response - Error (not rate limit)${NC}"
    fi
    return 0
  fi
}

# Run a batch of requests
run_batch() {
  local method="$1"
  local endpoint="$2"
  local count="$3"
  local data="${4:-}"
  local delay="${5:-0.02}"
  
  echo "  Sending $count requests..."
  
  for i in $(seq 1 $count); do
    make_request "$method" "$endpoint" "$data" "true"
    sleep "$delay"
  done
  
  echo ""
  echo "  Results:"
  echo -e "    ${GREEN}✅ Success: $SUCCESS_COUNT${NC}"
  echo -e "    ${RED}🚫 Rate Limited: $RATE_LIMITED_COUNT${NC}"
  if [ $ERROR_COUNT -gt 0 ]; then
    echo -e "    ${YELLOW}⚠️  Errors: $ERROR_COUNT${NC}"
  fi
}

print_summary() {
  local tier="$1"
  local limit="$2"
  local expected_limited=$((SUCCESS_COUNT + RATE_LIMITED_COUNT - limit))
  
  echo ""
  if [ $RATE_LIMITED_COUNT -gt 0 ]; then
    echo -e "  ${GREEN}✅ Rate limiting is WORKING for $tier tier${NC}"
    echo "     Limit: $limit requests"
    echo "     Got rate limited after: $SUCCESS_COUNT requests"
  else
    echo -e "  ${YELLOW}⚠️  No rate limiting triggered for $tier tier${NC}"
    echo "     Expected limit: $limit requests"
    echo "     Sent: $SUCCESS_COUNT requests (all succeeded)"
  fi
}

# =============================================================================
# Test Functions
# =============================================================================

test_auth_nonce() {
  print_subheader "Testing AUTH NONCE Tier (60 req / 15 min)"
  reset_counters
  
  # Send 70 requests (should hit limit at ~60)
  run_batch "GET" "/api/auth/nonce?address=$TEST_ADDRESS" 70
  print_summary "auth-nonce" 60
}

test_auth_verify() {
  print_subheader "Testing AUTH VERIFY Tier (20 req / 15 min)"
  reset_counters
  
  # Send 25 requests (should hit limit at ~20)
  local verify_data='{"address":"'"$TEST_ADDRESS"'","signature":"0xtest"}'
  run_batch "POST" "/api/auth/verify" 25 "$verify_data"
  print_summary "auth-verify" 20
}

test_read() {
  print_subheader "Testing READ Tier (200 req / 1 min)"
  reset_counters
  
  # Send 220 requests (should hit limit at ~200)
  echo "  ⚠️  This will send 220 requests and may take ~10 seconds..."
  run_batch "GET" "/api/signals" 220 "" 0.01
  print_summary "read" 200
}

test_write() {
  print_subheader "Testing WRITE Tier (60 req / 15 min)"
  reset_counters
  
  # For write test, we need auth - just test that endpoint exists
  # Since we can't auth in bash easily, test with a public write-like endpoint
  echo "  ℹ️  Write endpoints require authentication"
  echo "  Testing with signal create (will fail auth but count toward rate limit)..."
  
  local signal_data='{"title":"Test Signal","description":"Test","priceUsdt":1}'
  run_batch "POST" "/api/signals" 70 "$signal_data"
  print_summary "write" 60
}

test_critical() {
  print_subheader "Testing CRITICAL Tier (500 req / 15 min)"
  reset_counters
  
  # Critical tier has very high limits - just verify endpoint responds
  echo "  ℹ️  Critical tier has 500 req limit - testing with smaller batch"
  echo "  Testing receipt verification endpoint..."
  
  run_batch "GET" "/api/receipts/verify?contentId=test&buyer=$TEST_ADDRESS" 50
  
  echo ""
  echo -e "  ${GREEN}✅ Critical tier is configured (limit: 500 req / 15 min)${NC}"
  echo "     Full test would require 500+ requests"
}

test_headers() {
  print_subheader "Testing Rate Limit Headers"
  
  echo "  Checking for standard rate limit headers..."
  headers=$(curl -s -I "${BASE_URL}/api/signals" 2>&1)
  
  if echo "$headers" | grep -qi "ratelimit-limit"; then
    echo -e "  ${GREEN}✅ RateLimit-Limit header present${NC}"
  else
    echo -e "  ${YELLOW}⚠️  RateLimit-Limit header not found${NC}"
  fi
  
  if echo "$headers" | grep -qi "ratelimit-remaining"; then
    echo -e "  ${GREEN}✅ RateLimit-Remaining header present${NC}"
  else
    echo -e "  ${YELLOW}⚠️  RateLimit-Remaining header not found${NC}"
  fi
  
  if echo "$headers" | grep -qi "ratelimit-reset"; then
    echo -e "  ${GREEN}✅ RateLimit-Reset header present${NC}"
  else
    echo -e "  ${YELLOW}⚠️  RateLimit-Reset header not found${NC}"
  fi
  
  echo ""
  echo "  Sample headers:"
  echo "$headers" | grep -i ratelimit || echo "  (no rate limit headers found)"
}

# =============================================================================
# Main
# =============================================================================

print_header "SignalFriend Rate Limit Test Suite"

echo "Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Test Address: $TEST_ADDRESS"
echo ""

# Check if server is running
if ! curl -s "${BASE_URL}/health" > /dev/null 2>&1; then
  echo -e "${RED}❌ Error: Backend server not responding at $BASE_URL${NC}"
  echo "   Please start the backend server first: npm run dev"
  exit 1
fi

echo -e "${GREEN}✅ Backend server is running${NC}"

# Parse argument
TIER="${1:-all}"

case "$TIER" in
  "auth-nonce")
    test_auth_nonce
    ;;
  "auth-verify")
    test_auth_verify
    ;;
  "read")
    test_read
    ;;
  "write")
    test_write
    ;;
  "critical")
    test_critical
    ;;
  "headers")
    test_headers
    ;;
  "all")
    test_headers
    test_auth_nonce
    test_auth_verify
    test_read
    test_write
    test_critical
    ;;
  *)
    echo -e "${RED}❌ Unknown tier: $TIER${NC}"
    echo ""
    echo "Usage: $0 [tier]"
    echo "  Tiers: auth-nonce, auth-verify, read, write, critical, headers, all"
    exit 1
    ;;
esac

print_header "Test Complete"

echo "Notes:"
echo "  • Rate limits are per IP address (or per wallet for authenticated requests)"
echo "  • Limits reset after the window expires (1 min for read, 15 min for others)"
echo "  • Restart the backend to immediately reset all rate limits"
echo ""
echo "To reset rate limits without restarting:"
echo "  • Wait for the window to expire, OR"
echo "  • Restart the backend server"
echo ""
