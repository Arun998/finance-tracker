/**
 * API Test Script
 * Tests all statement extraction endpoints
 */

import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000';
const LOG_FILE = 'api-test-results.txt';

// Clear log file
fs.writeFileSync(LOG_FILE, '');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
};

log('═══════════════════════════════════════════════════════════');
log('🧪 API ENDPOINT TESTS');
log('═══════════════════════════════════════════════════════════\n');
log(`Testing API at: ${API_BASE}`);
log(`Timestamp: ${new Date().toISOString()}\n`);

// Test 1: Health Check
log('📝 Test 1: Health Check Endpoint');
log('─────────────────────────────────────────────────────────');

try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();

    if (response.ok) {
        log('✅ Health check passed');
        log(`   Status: ${data.status}`);
        log(`   Message: ${data.message}`);
        log(`   Timestamp: ${data.timestamp}`);
    } else {
        log('❌ Health check failed');
        log(`   Status: ${response.status}`);
    }
} catch (error) {
    log('❌ Health check error: ' + error.message);
    log('⚠️  Is the server running? Start with: npm start');
}

log('\n');

// Test 2: Parse Statement (without actual file - just check endpoint exists)
log('📝 Test 2: Parse Statement Endpoint Structure');
log('─────────────────────────────────────────────────────────');

try {
    const response = await fetch(`${API_BASE}/api/expenses/parse-statement`, {
        method: 'POST'
    });

    const data = await response.json();

    if (response.status === 400 && data.message && data.message.includes('No file')) {
        log('✅ Parse statement endpoint exists and validates file upload');
        log(`   Expected error message: "${data.message}"`);
    } else {
        log('⚠️  Unexpected response');
        log(`   Status: ${response.status}`);
        log(`   Data: ${JSON.stringify(data, null, 2)}`);
    }
} catch (error) {
    log('❌ Parse statement error: ' + error.message);
}

log('\n');

// Test 3: Bulk Import (with sample data)
log('📝 Test 3: Bulk Import Endpoint');
log('─────────────────────────────────────────────────────────');

const sampleTransactions = [
    {
        date: '2025-11-23',
        merchant: 'SWIGGY PAYMENT',
        amount: 580,
        type: 'DEBIT',
        description: 'Food delivery',
        categoryInfo: {
            category: 'Food',
            confidence: 100
        }
    },
    {
        date: '2025-11-22',
        merchant: 'UBER MOTO',
        amount: 150,
        type: 'DEBIT',
        description: 'Ride',
        categoryInfo: {
            category: 'Transport',
            confidence: 100
        }
    }
];

try {
    const response = await fetch(`${API_BASE}/api/expenses/bulk-import`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            batchName: 'API Test Batch',
            transactions: sampleTransactions
        })
    });

    const data = await response.json();

    if (response.ok) {
        log('✅ Bulk import successful');
        log(`   Batch ID: ${data.data.batchId}`);
        log(`   Imported: ${data.data.imported} transactions`);
        log(`   Duplicates: ${data.data.duplicates}`);
        log(`   Total Amount: ₹${data.data.summary.totalAmount}`);
    } else {
        log('❌ Bulk import failed');
        log(`   Status: ${response.status}`);
        log(`   Message: ${data.message}`);
    }
} catch (error) {
    log('❌ Bulk import error: ' + error.message);
}

log('\n');

// Test 4: Import History
log('📝 Test 4: Import History Endpoint');
log('─────────────────────────────────────────────────────────');

try {
    const response = await fetch(`${API_BASE}/api/expenses/imports/history`);
    const data = await response.json();

    if (response.ok) {
        log('✅ Import history retrieved');
        log(`   Total batches: ${data.data.batches.length}`);
        log(`   Page: ${data.data.pagination.page}/${data.data.pagination.pages}`);

        if (data.data.batches.length > 0) {
            log('\n   Recent batches:');
            data.data.batches.slice(0, 3).forEach((batch, idx) => {
                log(`   ${idx + 1}. Batch ID: ${batch._id}`);
                log(`      Transactions: ${batch.count}`);
                log(`      Amount: ₹${batch.totalAmount}`);
                log(`      Categories: ${batch.categories.join(', ')}`);
            });
        }
    } else {
        log('❌ Import history failed');
        log(`   Status: ${response.status}`);
    }
} catch (error) {
    log('❌ Import history error: ' + error.message);
}

log('\n');

// Test 5: Category Mapper (local test)
log('📝 Test 5: Category Mapper (Local)');
log('─────────────────────────────────────────────────────────');

try {
    const { categorizeMerchant } = await import('./utils/statement/categoryMapper.js');

    const testMerchants = [
        'SWIGGY',
        'UBER',
        'AMAZON',
        'NETFLIX',
        'ELECTRICITY BOARD'
    ];

    log('✅ Category mapper working:');
    testMerchants.forEach(merchant => {
        const result = categorizeMerchant(merchant);
        log(`   ${merchant.padEnd(20)} → ${result.emoji} ${result.category} (${result.confidence}%)`);
    });
} catch (error) {
    log('❌ Category mapper error: ' + error.message);
}

log('\n═══════════════════════════════════════════════════════════');
log('✅ API TESTS COMPLETED');
log('═══════════════════════════════════════════════════════════');
log(`\nResults saved to: ${LOG_FILE}`);
log(`Run: cat ${LOG_FILE}`);
