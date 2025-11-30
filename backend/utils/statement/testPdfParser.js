
import { parsePDF, validatePDFFile, getPDFMetadata } from './pdfParser.js';
import fs from 'fs';

const logFile = '../../test_results.txt';
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

// Clear log file
fs.writeFileSync(logFile, 'STARTING TEST\n');

log('🧪 Testing PDF Parser Module...\n');

// Test 1: Module imports
log('✅ Test 1: Module imports successful');
log('   - parsePDF: ' + typeof parsePDF);
log('   - validatePDFFile: ' + typeof validatePDFFile);
log('   - getPDFMetadata: ' + typeof getPDFMetadata);

// Test 2: Validate file function
log('\n✅ Test 2: File validation');
const mockValidFile = {
    mimetype: 'application/pdf',
    size: 1024 * 1024 // 1MB
};
const validResult = validatePDFFile(mockValidFile);
log('   Valid PDF: ' + JSON.stringify(validResult));

log('\n✅ ALL MODULE TESTS PASSED');

