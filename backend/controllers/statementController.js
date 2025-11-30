import fs from 'fs';
import path from 'path';
import { parsePDF, validatePDFFile, getPDFMetadata } from '../utils/statement/pdfParser.js';
import { extractTransactions, validateTransactions } from '../utils/statement/transactionExtractor.js';
import { categorizeTransactions, analyzeCategorizationAccuracy } from '../utils/statement/categoryMapper.js';
import Expense from '../models/Expense.js';

/**
 * POST /api/expenses/parse-statement
 * Upload and parse a bank statement PDF
 * Returns preview of extracted transactions
 */
export const parseStatement = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please provide a PDF file.'
            });
        }

        console.log(`📤 Processing uploaded file: ${req.file.originalname}`);

        // Validate PDF file
        const validation = validatePDFFile(req.file);
        if (!validation.valid) {
            // Delete temporary file
            if (req.file.path) fs.unlinkSync(req.file.path);

            return res.status(400).json({
                success: false,
                message: 'Invalid file',
                errors: validation.errors
            });
        }

        // Get PDF metadata
        const metadata = await getPDFMetadata(req.file.path);

        // Parse PDF to extract text
        const pdfResult = await parsePDF(req.file.path);

        if (!pdfResult.success) {
            // Delete temporary file
            if (req.file.path) fs.unlinkSync(req.file.path);

            return res.status(400).json({
                success: false,
                message: 'Failed to extract text from PDF',
                error: pdfResult.error,
                tips: [
                    'Ensure the PDF file is not password protected',
                    'Check that the PDF has a readable text layer',
                    'Try a different bank statement'
                ]
            });
        }

        console.log(`✅ Text extracted: ${pdfResult.method} method (${pdfResult.confidence} confidence)`);

        // Extract transactions from text
        const extractResult = extractTransactions(pdfResult.text);

        if (!extractResult.success || extractResult.count === 0) {
            // Delete temporary file
            if (req.file.path) fs.unlinkSync(req.file.path);

            return res.status(400).json({
                success: false,
                message: 'No transactions found in the PDF',
                error: extractResult.error,
                tips: [
                    'Ensure the statement contains transaction details',
                    'The PDF might be in an unsupported format',
                    'Try uploading a recent bank statement'
                ]
            });
        }

        console.log(`✅ Extracted ${extractResult.count} transactions`);

        // Validate transactions
        const validationResult = validateTransactions(extractResult.transactions);

        const validTransactions = validationResult.valid;
        console.log(`✅ Validated: ${validTransactions.length} valid, ${validationResult.invalid.length} invalid`);

        // Categorize transactions
        const categorized = categorizeTransactions(validTransactions);

        // Analyze accuracy
        const accuracy = analyzeCategorizationAccuracy(categorized);

        // Delete temporary file after processing
        if (req.file.path) fs.unlinkSync(req.file.path);

        // Return preview
        return res.status(200).json({
            success: true,
            data: {
                file: {
                    name: req.file.originalname,
                    size: req.file.size,
                    sizeReadable: `${(req.file.size / 1024).toFixed(2)} KB`,
                    uploadedAt: new Date().toISOString()
                },
                metadata: metadata,
                transactions: categorized,
                extraction: {
                    method: pdfResult.method,
                    confidence: pdfResult.confidence,
                    textLength: pdfResult.text.length
                },
                stats: {
                    total: categorized.length,
                    valid: validTransactions.length,
                    invalid: validationResult.invalid.length,
                    totalAmount: categorized.reduce((sum, tx) => sum + tx.amount, 0),
                    dateRange: {
                        earliest: categorized.length > 0 ?
                            [...categorized].sort((a, b) => new Date(a.date) - new Date(b.date))[0].date : null,
                        latest: categorized.length > 0 ?
                            [...categorized].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null
                    }
                },
                categorization: accuracy
            },
            message: `Successfully extracted ${categorized.length} transactions from your bank statement`
        });

    } catch (error) {
        console.error('Error in parseStatement:', error);

        // Clean up temporary file
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('Failed to delete temp file:', e);
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Error processing statement',
            error: error.message
        });
    }
};

/**
 * POST /api/expenses/bulk-import
 * Save extracted and validated transactions to database
 */
export const bulkImportTransactions = async (req, res) => {
    try {
        const { transactions, batchName } = req.body;

        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction data. Please provide an array of transactions.'
            });
        }

        console.log(`📋 Bulk importing ${transactions.length} transactions...`);

        // Validate transactions
        const validationResult = validateTransactions(transactions);

        if (validationResult.invalid.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some transactions are invalid',
                invalidCount: validationResult.invalid.length,
                invalidDetails: validationResult.invalid.slice(0, 5) // Show first 5 errors
            });
        }

        const uploadBatchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const importedAt = new Date();

        // Prepare transactions for database
        const expensesToInsert = transactions.map(tx => ({
            amount: tx.amount,
            category: tx.categoryInfo?.category || 'Other',
            date: new Date(tx.date),
            notes: tx.merchant,
            sourceType: 'statement',
            transactionId: tx.transactionId || null,
            merchant: tx.merchant,
            rawDescription: tx.description,
            importedAt: importedAt,
            uploadBatchId: uploadBatchId
        }));

        // Check for duplicates before saving
        const duplicateCheck = await checkDuplicateTransactions(expensesToInsert);

        console.log(`🔍 Duplicate check: ${duplicateCheck.duplicates.length} potential duplicates found`);

        // Filter out exact duplicates
        const uniqueTransactions = expensesToInsert.filter((tx, idx) => {
            // Check if this exact transaction exists
            return !duplicateCheck.duplicates.some(dup => {
                const dupDate = dup.new.date instanceof Date ? dup.new.date : new Date(dup.new.date);
                const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
                return dupDate.getTime() === txDate.getTime() &&
                    dup.new.amount === tx.amount &&
                    dup.new.merchant === tx.merchant;
            });
        });

        console.log(`💾 Saving ${uniqueTransactions.length} unique transactions to database...`);

        // Bulk insert to database
        const result = await Expense.insertMany(uniqueTransactions);

        console.log(`✅ Successfully saved ${result.length} transactions`);

        // Prepare response
        const response = {
            success: true,
            data: {
                batchId: uploadBatchId,
                imported: result.length,
                skipped: expensesToInsert.length - uniqueTransactions.length,
                duplicates: duplicateCheck.duplicates.length,
                totalProcessed: expensesToInsert.length,
                transactions: result,
                summary: {
                    totalAmount: result.reduce((sum, tx) => sum + tx.amount, 0),
                    byCategory: result.reduce((acc, tx) => {
                        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                        return acc;
                    }, {}),
                    dateRange: {
                        earliest: result.length > 0 ?
                            [...result].sort((a, b) => a.date - b.date)[0].date : null,
                        latest: result.length > 0 ?
                            [...result].sort((a, b) => b.date - a.date)[0].date : null
                    }
                }
            },
            message: `Successfully imported ${result.length} transactions`
        };

        if (duplicateCheck.duplicates.length > 0) {
            response.warning = `${duplicateCheck.duplicates.length} duplicate transactions were skipped`;
            response.warnings = duplicateCheck.duplicates.slice(0, 5);
        }

        return res.status(201).json(response);

    } catch (error) {
        console.error('Error in bulkImportTransactions:', error);

        return res.status(500).json({
            success: false,
            message: 'Error importing transactions',
            error: error.message
        });
    }
};

/**
 * GET /api/expenses/imports/history
 * Get history of import batches
 */
export const getImportHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get unique batches
        const batches = await Expense.aggregate([
            {
                $match: { sourceType: 'statement' }
            },
            {
                $group: {
                    _id: '$uploadBatchId',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    importedAt: { $first: '$importedAt' },
                    categories: { $addToSet: '$category' }
                }
            },
            {
                $sort: { importedAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);

        const total = await Expense.countDocuments({
            sourceType: 'statement',
            uploadBatchId: { $exists: true }
        });

        return res.status(200).json({
            success: true,
            data: {
                batches: batches,
                pagination: {
                    page,
                    limit,
                    total: total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error in getImportHistory:', error);

        return res.status(500).json({
            success: false,
            message: 'Error retrieving import history',
            error: error.message
        });
    }
};

/**
 * DELETE /api/expenses/imports/:batchId
 * Delete all transactions from a specific batch
 */
export const deleteImportBatch = async (req, res) => {
    try {
        const { batchId } = req.params;

        const result = await Expense.deleteMany({
            uploadBatchId: batchId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No transactions found for this batch'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                batchId,
                deletedCount: result.deletedCount
            },
            message: `Successfully deleted ${result.deletedCount} transactions from batch`
        });

    } catch (error) {
        console.error('Error in deleteImportBatch:', error);

        return res.status(500).json({
            success: false,
            message: 'Error deleting import batch',
            error: error.message
        });
    }
};

/**
 * Helper: Check for duplicate transactions
 */
const checkDuplicateTransactions = async (newTransactions) => {
    const duplicates = [];

    for (const newTx of newTransactions) {
        // Check for similar transactions (same date, amount, merchant)
        const txDate = newTx.date instanceof Date ? newTx.date.getTime() : new Date(newTx.date).getTime();
        const existing = await Expense.findOne({
            date: {
                $gte: new Date(txDate - 5 * 60000), // 5 min window
                $lte: new Date(txDate + 5 * 60000)
            },
            amount: newTx.amount,
            merchant: new RegExp(newTx.merchant, 'i')
        });

        if (existing) {
            duplicates.push({
                existing: existing,
                new: newTx,
                message: `Similar transaction found on ${existing.date}`
            });
        }
    }

    return { duplicates };
};
