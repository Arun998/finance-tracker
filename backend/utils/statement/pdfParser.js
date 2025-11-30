import { createRequire } from 'module';
import Tesseract from 'tesseract.js';
import fs from 'fs';

// pdf-parse is a CommonJS module, so we need to use createRequire
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');


/**
 * Parse PDF and extract text
 * Tries pdf-parse first (for digital PDFs)
 * Falls back to Tesseract OCR if needed
 */
export const parsePDF = async (filePath) => {
    try {
        // Try direct PDF text extraction first
        const textContent = await extractTextFromPDF(filePath);

        if (textContent && textContent.trim().length > 100) {
            console.log('✅ Text extracted successfully from PDF');
            return {
                success: true,
                text: textContent,
                method: 'direct',
                confidence: 'high'
            };
        }

        // If PDF has no text, try OCR fallback
        console.log('⚠️ PDF has no text layer, trying OCR...');
        const ocrText = await extractTextWithOCR(filePath);

        return {
            success: true,
            text: ocrText,
            method: 'ocr',
            confidence: 'medium'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            method: null,
            confidence: 'none'
        };
    }
};

/**
 * Extract text directly from PDF using pdf-parse
 */
const extractTextFromPDF = async (filePath) => {
    try {
        const pdfBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(pdfBuffer);

        // Extract text from PDF
        const fullText = data.text || '';

        console.log(`📄 Extracted ${fullText.length} characters from PDF`);
        return fullText;
    } catch (error) {
        console.error('Error extracting text from PDF:', error.message);
        throw error;
    }
};

/**
 * Extract text using Tesseract OCR (for scanned PDFs)
 * Note: This requires converting PDF to images first
 */
const extractTextWithOCR = async (filePath) => {
    try {
        console.log('🔍 Starting OCR with Tesseract.js...');

        // For now, assuming filePath is an image or we need to convert PDF
        // In production, convert PDF pages to images first
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');

        console.log(`🎯 OCR extracted ${text.length} characters`);
        return text;
    } catch (error) {
        console.error('Error with OCR:', error.message);
        throw new Error('Failed to extract text using OCR');
    }
};

/**
 * Validate PDF file
 */
export const validatePDFFile = (file) => {
    const errors = [];

    // Check file type
    if (!file || file.mimetype !== 'application/pdf') {
        errors.push('File must be a PDF');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file && file.size > maxSize) {
        errors.push(`File size must be less than 10MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Get PDF metadata (number of pages, file size, etc.)
 */
export const getPDFMetadata = async (filePath) => {
    try {
        const { readFileSync, statSync } = await import('fs');
        const stats = statSync(filePath);
        const pdfBuffer = readFileSync(filePath);
        const data = await pdfParse(pdfBuffer);

        return {
            filename: filePath.split('/').pop(),
            pages: data.numpages || 1,
            size: stats.size,
            sizeReadable: `${(stats.size / 1024).toFixed(2)} KB`,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
        };
    } catch (error) {
        console.error('Error getting PDF metadata:', error.message);
        return null;
    }
};
