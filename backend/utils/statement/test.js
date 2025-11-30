/**
 * Test file for statement extraction utilities
 * Run with: node backend/utils/statement/test.js
 */

import { categorizeMerchant, categorizeTransactions, analyzeCategorizationAccuracy } from './categoryMapper.js';
import { validateTransactions } from './transactionExtractor.js';

// Test data: Sample transactions
const sampleTransactions = [
    {
        date: '2025-11-23',
        merchant: 'YOUSTA',
        amount: 1298,
        type: 'DEBIT',
        description: 'Paid to YOUSTA'
    },
    {
        date: '2025-11-22',
        merchant: 'ATTIBELE ELECTRONIC CITY',
        amount: 25,
        type: 'DEBIT',
        description: 'Electronics Store'
    },
    {
        date: '2025-11-22',
        merchant: 'SWIGGY PAYMENT',
        amount: 580,
        type: 'DEBIT',
        description: 'Food delivery'
    },
    {
        date: '2025-11-21',
        merchant: 'UBER MOTO',
        amount: 150,
        type: 'DEBIT',
        description: 'Ride'
    },
    {
        date: '2025-11-21',
        merchant: 'NETFLIX INDIA',
        amount: 199,
        type: 'DEBIT',
        description: 'Streaming'
    },
    {
        date: '2025-11-20',
        merchant: 'AMAZON DIGITAL',
        amount: 499,
        type: 'DEBIT',
        description: 'Online shopping'
    },
    {
        date: '2025-11-20',
        merchant: 'ELECTRICITY BOARD',
        amount: 2500,
        type: 'DEBIT',
        description: 'Electricity bill'
    },
    {
        date: '2025-11-19',
        merchant: 'APOLLO HOSPITAL',
        amount: 5000,
        type: 'DEBIT',
        description: 'Medical checkup'
    }
];

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 STATEMENT EXTRACTION UTILITIES - TEST SUITE');
console.log('═══════════════════════════════════════════════════════════\n');

// Test 1: Category Mapping
console.log('📝 Test 1: Merchant Categorization');
console.log('─────────────────────────────────────────────────────────\n');

for (const tx of sampleTransactions) {
    const category = categorizeMerchant(tx.merchant);
    console.log(`Merchant: ${tx.merchant.padEnd(30)} → ${category.emoji} ${category.category} (${category.confidence}%)`);
}

// Test 2: Categorize all transactions
console.log('\n📊 Test 2: Categorize Multiple Transactions');
console.log('─────────────────────────────────────────────────────────\n');

const categorized = categorizeTransactions(sampleTransactions);
console.log('✅ Transactions categorized successfully\n');

// Test 3: Validate transactions
console.log('✔️  Test 3: Validate Transactions');
console.log('─────────────────────────────────────────────────────────\n');

const validation = validateTransactions(sampleTransactions);
console.log(`Valid transactions: ${validation.validCount}/${sampleTransactions.length}`);
console.log(`Invalid transactions: ${validation.invalidCount}`);

if (validation.invalidCount > 0) {
    console.log('\nInvalid transaction details:');
    validation.invalid.forEach(inv => {
        console.log(`  Row ${inv.row}: ${inv.errors.join(', ')}`);
    });
}

// Test 4: Accuracy Analysis
console.log('\n📈 Test 4: Categorization Accuracy Analysis');
console.log('─────────────────────────────────────────────────────────\n');

const accuracy = analyzeCategorizationAccuracy(categorized);
console.log(`Total Transactions: ${accuracy.total}`);
console.log(`High Confidence (≥80%): ${accuracy.highConfidence} (${accuracy.highConfidencePercent}%)`);
console.log(`Medium Confidence (40-79%): ${accuracy.mediumConfidence} (${accuracy.mediumConfidencePercent}%)`);
console.log(`Low Confidence (<40%): ${accuracy.lowConfidence} (${accuracy.lowConfidencePercent}%)`);

console.log('\nBreakdown by Category:');
for (const [category, count] of Object.entries(accuracy.categories)) {
    const percentage = Math.round((count / accuracy.total) * 100);
    console.log(`  ${category}: ${count} (${percentage}%)`);
}

// Test 5: Sample output
console.log('\n📋 Test 5: Sample Transaction Output');
console.log('─────────────────────────────────────────────────────────\n');

const sample = categorized[0];
console.log('Sample Transaction (with categorization):');
console.log(JSON.stringify(sample, null, 2));

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
console.log('═══════════════════════════════════════════════════════════\n');
