/**
 * Parse extracted text into structured transactions
 * Handles different bank statement formats
 */

export const extractTransactions = (text) => {
    try {
        const transactions = [];
        
        // Split text into lines
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        console.log(`📋 Processing ${lines.length} lines of text...`);
        console.log(`📊 Total text length: ${text.length} characters`);
        console.log(`📊 First 500 chars of text: ${text.substring(0, 500)}`);
        console.log(`📊 Text contains PhonePe: ${text.includes('PhonePe')}`);
        console.log(`📊 Text contains UPI: ${text.includes('UPI')}`);
        console.log(`📊 Text contains Merchant: ${text.includes('Merchant')}`);
        console.log(`📊 Text contains Status: ${text.includes('Status')}`);
        console.log(`📊 Text contains ₹: ${text.includes('₹')}`);
        console.log(`📊 Text contains DEBIT: ${text.includes('DEBIT')}`);
        
        // Try to detect and parse different statement formats
        const format = detectStatementFormat(text);
        console.log(`📊 Detected format: ${format}`);
        
        // Parse based on detected format
        switch (format) {
            case 'tabular':
                return parseTabularFormat(lines);
            case 'narrative':
                return parseNarrativeFormat(lines);
            case 'structured':
                return parseStructuredFormat(lines);
            case 'phonepeupi':
                return parsePhonePeFormat(lines);
            default:
                return parseGenericFormat(lines);
        }
    } catch (error) {
        console.error('Error extracting transactions:', error.message);
        return {
            success: false,
            transactions: [],
            error: error.message,
            count: 0
        };
    }
};

/**
 * Detect statement format by analyzing text patterns
 */
const detectStatementFormat = (text) => {
    console.log(`🔍 Analyzing text for format detection (${text.length} chars)`);
    
    // Check for PhonePe/UPI format - look for PhonePe indicators
    if (text.includes('PhonePe') || text.includes('UPI') || 
        (text.includes('Merchant') && text.includes('Status')) ||
        (text.includes('DEBIT') && text.includes('Merchant'))) {
        console.log('✓ Detected as PhonePe/UPI format');
        return 'phonepeupi';
    }
    
    // Check for common patterns
    if (text.includes('Transaction Date') || text.includes('Value Date')) {
        console.log('✓ Detected as tabular format');
        return 'tabular';
    }
    if (text.includes('Description') && text.includes('Amount')) {
        console.log('✓ Detected as narrative format');
        return 'narrative';
    }
    if (text.includes('Date') && text.includes('Debit') && text.includes('Credit')) {
        console.log('✓ Detected as structured format');
        return 'structured';
    }
    
    // Check if text contains date and amount patterns (fallback)
    const hasDatePattern = /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/.test(text);
    const hasAmountPattern = /₹\s*[\d,]+/.test(text);
    if (hasDatePattern && hasAmountPattern) {
        console.log('✓ Detected date and amount patterns, trying generic format');
        return 'generic';
    }
    
    console.log('⚠ Could not detect format, defaulting to generic');
    return 'generic';
};

/**
 * Parse tabular format (columns: Date | Debit | Credit | Description)
 */
const parseTabularFormat = (lines) => {
    const transactions = [];
    
    // Regex patterns for common Indian bank formats
    const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/;
    const amountPattern = /([₹]?\s*[\d,]+\.?\d{0,2})/;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip header rows
        if (line.includes('Date') || line.includes('Particulars') || line.length < 5) {
            continue;
        }
        
        // Try to match transaction pattern
        const dateMatch = line.match(datePattern);
        if (dateMatch) {
            const transaction = parseTransactionLine(line, dateMatch[1]);
            if (transaction) {
                transactions.push(transaction);
            }
        }
    }
    
    console.log(`✅ Extracted ${transactions.length} transactions (tabular format)`);
    
    return {
        success: transactions.length > 0,
        transactions,
        count: transactions.length,
        format: 'tabular'
    };
};

/**
 * Parse narrative format (each transaction spread across multiple lines)
 */
const parseNarrativeFormat = (lines) => {
    const transactions = [];
    let currentTransaction = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect transaction start (usually contains date)
        if (isDateLine(line)) {
            if (currentTransaction && currentTransaction.date && currentTransaction.amount) {
                transactions.push(currentTransaction);
            }
            currentTransaction = parseTransactionLine(line, extractDate(line));
        } else if (currentTransaction) {
            // Add details to current transaction
            if (isAmountLine(line)) {
                const { amount, type } = parseAmount(line);
                currentTransaction.amount = amount;
                currentTransaction.type = type;
            } else if (line.length > 5) {
                // Add to description
                currentTransaction.description = (currentTransaction.description || '') + ' ' + line;
            }
        }
    }
    
    // Don't forget last transaction
    if (currentTransaction && currentTransaction.date && currentTransaction.amount) {
        transactions.push(currentTransaction);
    }
    
    console.log(`✅ Extracted ${transactions.length} transactions (narrative format)`);
    
    return {
        success: transactions.length > 0,
        transactions,
        count: transactions.length,
        format: 'narrative'
    };
};

/**
 * Parse structured CSV-like format
 */
const parseStructuredFormat = (lines) => {
    const transactions = [];
    
    // Find header row
    let headerIndex = -1;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
        if (lines[i].includes('Date') && (lines[i].includes('Debit') || lines[i].includes('Credit'))) {
            headerIndex = i;
            break;
        }
    }
    
    if (headerIndex === -1) headerIndex = 0;
    
    // Parse data rows
    for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().length < 5) continue;
        
        const parts = line.split(/[\s,]+/).filter(p => p.length > 0);
        if (parts.length < 3) continue;
        
        const transaction = {
            date: normalizeDate(parts[0]),
            merchant: parts.slice(1, -2).join(' '),
            amount: parseFloat(parts[parts.length - 2].replace(/[₹,]/g, '')),
            type: parts[parts.length - 1].toUpperCase().includes('DEBIT') ? 'DEBIT' : 'CREDIT',
            description: parts.slice(1, -2).join(' ')
        };
        
        if (transaction.date && transaction.amount > 0) {
            transactions.push(transaction);
        }
    }
    
    console.log(`✅ Extracted ${transactions.length} transactions (structured format)`);
    
    return {
        success: transactions.length > 0,
        transactions,
        count: transactions.length,
        format: 'structured'
    };
};

/**
 * Parse PhonePe/UPI transaction format
 */
const parsePhonePeFormat = (lines) => {
    const transactions = [];
    
    console.log(`📱 Trying PhonePe format parser on ${lines.length} lines`);
    
    // PhonePe format: Date on one line, then time, then DEBIT/CREDIT + Amount + Merchant
    // Pattern: "Nov 23, 2025" or "23 Nov, 2025" for dates
    // Amount pattern: ₹1,298 or ₹ 1,298
    // Merchant: "Paid to MERCHANT_NAME"
    
    const datePattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})|(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),?\s+(\d{4})/i;
    const amountPattern = /DEBIT.*?₹\s*([\d,]+(?:\.\d{2})?)|CREDIT.*?₹\s*([\d,]+(?:\.\d{2})?)/i;
    const merchantPattern = /Paid\s+(?:to|by)\s+([^\n]+?)(?:\n|Transaction|$)/i;
    
    let currentDate = null;
    let currentMerchant = null;
    let currentAmount = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) continue;
        
        // Check for date line (e.g., "Nov 23, 2025")
        if (datePattern.test(line)) {
            // If we have pending transaction from previous iteration, save it
            if (currentDate && currentAmount && currentMerchant) {
                transactions.push({
                    date: currentDate,
                    amount: currentAmount,
                    type: 'DEBIT',
                    merchant: currentMerchant,
                    description: currentMerchant,
                    transactionId: null
                });
            }
            
            // Parse new date
            const match = line.match(datePattern);
            if (match) {
                let month, day, year;
                if (match[1]) {
                    // Format: "Nov 23, 2025"
                    month = getMonthNumber(match[1]);
                    day = parseInt(match[2]);
                    year = parseInt(match[3]);
                } else {
                    // Format: "23 Nov, 2025"
                    day = parseInt(match[4]);
                    month = getMonthNumber(match[5]);
                    year = parseInt(match[6]);
                }
                // Create ISO date directly without timezone conversion
                currentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                console.log(`📅 PhonePe Date parsed: day=${day}, month=${month}, year=${year} → ${currentDate}`);
                currentMerchant = null;
                currentAmount = null;
            }
            continue;
        }
        
        // Check for amount and merchant in same line (e.g., "DEBIT₹1,298Paid to YOUSTA")
        if (currentDate && line.includes('DEBIT')) {
            const amountMatch = line.match(/DEBIT₹\s*([\d,]+(?:\.\d{2})?)/i);
            const merchantMatch = line.match(/Paid\s+(?:to|by)\s+([^\n]+?)(?:\s*$|Transaction)/i);
            
            if (amountMatch) {
                currentAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
            }
            
            if (merchantMatch) {
                currentMerchant = merchantMatch[1].trim().substring(0, 100);
            }
            
            // If we have both amount and merchant, save transaction
            if (currentDate && currentAmount && currentMerchant) {
                transactions.push({
                    date: currentDate,
                    amount: Math.abs(currentAmount),
                    type: 'DEBIT',
                    merchant: currentMerchant,
                    description: currentMerchant,
                    transactionId: null
                });
                currentAmount = null;
                currentMerchant = null;
            }
        }
    }
    
    // Save last transaction if exists
    if (currentDate && currentAmount && currentMerchant) {
        transactions.push({
            date: currentDate,
            amount: currentAmount,
            type: 'DEBIT',
            merchant: currentMerchant,
            description: currentMerchant,
            transactionId: null
        });
    }
    
    console.log(`✅ Extracted ${transactions.length} transactions (PhonePe/UPI format)`);
    
    return {
        success: transactions.length > 0,
        transactions,
        count: transactions.length,
        format: 'phonepeupi'
    };
};

/**
 * Helper function to convert month name to number
 */
const getMonthNumber = (monthName) => {
    const months = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    };
    return months[monthName.toLowerCase()] || 1;
};

/**
 * Generic fallback parser - more aggressive pattern matching
 */
const parseGenericFormat = (lines) => {
    const transactions = [];
    
    console.log(`🔍 Trying generic format parser on ${lines.length} lines`);
    
    // First pass: Look for lines that have both date and amount
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length < 10) continue;
        
        const dateMatch = extractDate(line);
        const amountMatch = extractAmount(line);
        
        if (dateMatch && amountMatch?.amount) {
            try {
                const merchant = line
                    .replace(dateMatch, '')
                    .replace(/[₹$]?\s*[\d,]+(?:\.\d{2})?/g, '')
                    .trim()
                    .substring(0, 100) || 'Transaction';
                
                transactions.push({
                    date: normalizeDate(dateMatch),
                    amount: Math.abs(amountMatch.amount),
                    type: amountMatch.type || 'DEBIT',
                    merchant: merchant,
                    description: merchant,
                    transactionId: null
                });
            } catch (e) {
                console.error(`Failed to parse line: ${line.substring(0, 50)}`);
                continue;
            }
        }
    }
    
    console.log(`✅ Extracted ${transactions.length} transactions (generic format)`);
    
    return {
        success: transactions.length > 0,
        transactions,
        count: transactions.length,
        format: 'generic'
    };
};

/**
 * Helper: Parse single transaction line
 */
const parseTransactionLine = (line, date) => {
    const { amount, type } = parseAmount(line);
    
    if (!amount || !date) return null;
    
    // Extract merchant/description (usually between date and amount)
    const dateIndex = line.indexOf(date);
    const amountIndex = line.lastIndexOf(amount.toString());
    const merchant = line
        .substring(dateIndex + date.length, amountIndex)
        .trim()
        .substring(0, 50);
    
    return {
        date: normalizeDate(date),
        amount,
        type,
        merchant: merchant || 'Unknown',
        description: merchant,
        transactionId: null
    };
};

/**
 * Helper: Extract and parse amount
 */
const parseAmount = (line) => {
    // Pattern: currency symbol followed by number
    const amountPattern = /[₹$]?\s*([\d,]+(?:\.\d{2})?)/g;
    let lastMatch = null;
    let match;
    
    while ((match = amountPattern.exec(line)) !== null) {
        lastMatch = match;
    }
    
    if (!lastMatch) return { amount: null, type: null };
    
    const amount = parseFloat(lastMatch[1].replace(/,/g, ''));
    
    // Determine if debit or credit
    const lowerLine = line.toLowerCase();
    const type = lowerLine.includes('debit') || lowerLine.includes('dr') ? 'DEBIT' : 'CREDIT';
    
    return { amount, type };
};

/**
 * Helper: Extract amount string
 */
const extractAmount = (line) => {
    const { amount, type } = parseAmount(line);
    return { amount, type };
};

/**
 * Helper: Check if line contains date
 */
const isDateLine = (line) => {
    return /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/.test(line);
};

/**
 * Helper: Check if line contains amount
 */
const isAmountLine = (line) => {
    return /[₹$]?[\d,]+\.?\d{0,2}/.test(line);
};

/**
 * Helper: Extract date from line
 */
const extractDate = (line) => {
    const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/;
    const match = line.match(datePattern);
    return match ? match[1] : null;
};

/**
 * Helper: Normalize date to ISO format (YYYY-MM-DD)
 */
const normalizeDate = (dateString) => {
    if (!dateString) return null;
    
    // Check if it's a text-based date format (e.g., "Nov 23, 2025")
    const textDateMatch = dateString.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/i);
    if (textDateMatch) {
        return normalizeTextDate(dateString);
    }
    
    // Check if it's numeric date format (e.g., "23-11-2025" or "23/11/2025")
    const parts = dateString.split(/[-\/]/);
    
    if (parts.length !== 3) return null;
    
    let day, month, year;
    
    // Assume DD-MM-YYYY or DD/MM/YYYY for Indian banks
    day = parseInt(parts[0]);
    month = parseInt(parts[1]);
    year = parseInt(parts[2]);
    
    // Handle 2-digit year
    if (year < 100) {
        year = year < 50 ? 2000 + year : 1900 + year;
    }
    
    // Validate
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }
    
    // Return ISO format directly without timezone conversion
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Helper: Parse text-based date format (e.g., "Nov 23, 2025")
 */
const normalizeTextDate = (dateString) => {
    const monthMap = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    };
    
    // Parse "Nov 23, 2025" or "23 Nov, 2025" format
    let match = dateString.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/i);
    
    if (match) {
        const month = monthMap[match[1].toLowerCase()];
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        // Create ISO date directly without timezone conversion
        const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        console.log(`📅 Parsed date: ${match[1]} ${day}, ${year} → ${isoDate}`);
        return isoDate;
    }
    
    // Try "23 Nov, 2025" format
    match = dateString.match(/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),?\s+(\d{4})/i);
    
    if (match) {
        const day = parseInt(match[1]);
        const month = monthMap[match[2].toLowerCase()];
        const year = parseInt(match[3]);
        // Create ISO date directly without timezone conversion
        const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        console.log(`📅 Parsed date: ${day} ${match[2]} ${year} → ${isoDate}`);
        return isoDate;
    }
    
    return null;
};

/**
 * Validate extracted transactions
 */
export const validateTransactions = (transactions) => {
    const validated = [];
    const errors = [];
    
    for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        const transactionErrors = [];
        
        // Validate date
        if (!tx.date || !isValidDate(tx.date)) {
            transactionErrors.push('Invalid or missing date');
        }
        
        // Validate amount
        if (!tx.amount || tx.amount <= 0) {
            transactionErrors.push('Invalid or missing amount');
        }
        
        // Validate type
        if (!tx.type || !['DEBIT', 'CREDIT'].includes(tx.type)) {
            transactionErrors.push('Invalid transaction type');
        }
        
        if (transactionErrors.length === 0) {
            validated.push(tx);
        } else {
            errors.push({
                row: i + 1,
                transaction: tx,
                errors: transactionErrors
            });
        }
    }
    
    return {
        valid: validated,
        invalid: errors,
        validCount: validated.length,
        invalidCount: errors.length
    };
};

/**
 * Helper: Check if valid ISO date
 */
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};
