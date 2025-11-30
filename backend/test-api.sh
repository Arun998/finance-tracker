#!/bin/bash

# API Test Script
# Tests the backend API endpoints

echo "═══════════════════════════════════════════════════════════"
echo "🧪 BACKEND API TESTS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 1: Check if server is running
echo "📝 Test 1: Server Health Check"
echo "─────────────────────────────────────────────────────────"
HEALTH=$(curl -s http://localhost:5000/health)

if [ $? -eq 0 ]; then
    echo "✅ Server is running"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
else
    echo "❌ Server is not running"
    echo "⚠️  Start the server with: cd backend && npm start"
    exit 1
fi

echo ""

# Test 2: Test parse-statement endpoint (expect error without file)
echo "📝 Test 2: Parse Statement Endpoint"
echo "─────────────────────────────────────────────────────────"
PARSE_RESULT=$(curl -s -X POST http://localhost:5000/api/expenses/parse-statement)
echo "$PARSE_RESULT" | python3 -m json.tool 2>/dev/null || echo "$PARSE_RESULT"

echo ""

# Test 3: Test bulk import with sample data
echo "📝 Test 3: Bulk Import Endpoint"
echo "─────────────────────────────────────────────────────────"
IMPORT_RESULT=$(curl -s -X POST http://localhost:5000/api/expenses/bulk-import \
  -H "Content-Type: application/json" \
  -d '{
    "batchName": "Test Batch",
    "transactions": [
      {
        "date": "2025-11-23",
        "merchant": "SWIGGY",
        "amount": 580,
        "type": "DEBIT",
        "description": "Food delivery",
        "categoryInfo": {
          "category": "Food",
          "confidence": 100
        }
      }
    ]
  }')

echo "$IMPORT_RESULT" | python3 -m json.tool 2>/dev/null || echo "$IMPORT_RESULT"

echo ""

# Test 4: Get import history
echo "📝 Test 4: Import History Endpoint"
echo "─────────────────────────────────────────────────────────"
HISTORY_RESULT=$(curl -s http://localhost:5000/api/expenses/imports/history)
echo "$HISTORY_RESULT" | python3 -m json.tool 2>/dev/null || echo "$HISTORY_RESULT"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ API TESTS COMPLETED"
echo "═══════════════════════════════════════════════════════════"
