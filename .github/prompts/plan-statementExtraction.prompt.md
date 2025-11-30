# Feature Plan: Extract & Parse Bank Statement Transactions

## Overview
Build a statement parser that lets users upload bank statements (PDF/CSV/image), automatically extracts transaction details (date, amount, merchant, type), intelligently categorizes them, and stores in database—with manual entry fallback for corrections or additional expenses.

## Implementation Steps

### Step 1: Add Statement Upload Endpoint
- Create file upload endpoint with `multer` middleware in Express backend
- Support file types: CSV, PDF, images
- Validate file size (max 10MB) and format
- Return extracted data preview before saving

**Endpoint:** `POST /api/expenses/upload-statement`
- Input: multipart/form-data with file
- Output: Array of extracted transactions with fields (date, amount, merchant, type, rawLine)

### Step 2: Implement Transaction Parser
- Parse different statement formats:
  - **CSV format:** Headers (Date, Description, Amount, Type, etc.)
  - **PDF format:** Extract text and parse line-by-line
  - **Image format:** Use OCR to convert to text, then parse

**Parser Library Options:**
- CSV: Built-in `fs` + CSV parsing
- PDF: `pdf-parse` library
- OCR (images): `tesseract.js` for client-side or `pdf2image` + `tesseract` server-side

**Output Format:**
```javascript
{
  date: "2025-11-23",
  merchant: "YOUSTA",
  amount: 1298,
  type: "DEBIT",
  description: "Paid to YOUSTA",
  transactionId: "T2511231921303058257592",
  rawData: {...}
}
```

### Step 3: Build Auto-Categorization Logic
Map merchant names to expense categories using:
- **Keyword matching:** "Swiggy/Zomato" → Food, "Uber/Ola" → Transport
- **Pattern matching:** Keywords in merchant description
- **Fallback to "Other"** for unmapped merchants

**Category Mapping:**
```javascript
const merchantCategoryMap = {
  'food': ['swiggy', 'zomato', 'dominos', 'mcd', 'restaurant', 'cafe'],
  'transport': ['uber', 'ola', 'rapido', 'metro', 'bus', 'railway'],
  'entertainment': ['netflix', 'amazon prime', 'game', 'cinema'],
  'shopping': ['amazon', 'flipkart', 'mall', 'store'],
  'bills': ['electricity', 'water', 'internet', 'phone'],
  'health': ['pharmacy', 'hospital', 'doctor'],
}
```

### Step 4: Create Bulk Import API
**Endpoint:** `POST /api/expenses/bulk-import`
- Input: Array of extracted transactions with user-selected categories
- Features:
  - Validate each transaction
  - Detect duplicates (by date + amount + merchant within 5 min window)
  - Store all transactions in single MongoDB operation
  - Return summary (total imported, skipped, duplicates)

**Response:**
```javascript
{
  success: true,
  data: {
    imported: 28,
    duplicates: 2,
    errors: 0,
    transactions: [...]
  }
}
```

### Step 5: Add Statement Upload UI
**React Component: `StatementUploader.jsx`**
- File input with drag-and-drop support
- Show parsed transactions in preview table
- Allow category selection/correction for each row
- Bulk category assignment (select all as "Food", etc.)
- Preview total amount before importing
- Confirm and submit button

**Features:**
- Display extracted data in table format
- Editable cells for date, amount, merchant, category
- Color-coded by category
- Delete individual rows before import
- Show duplicate warnings

### Step 6: Allow Manual Corrections
- Edit transaction details before saving:
  - Date picker for transaction date
  - Amount field (numeric validation)
  - Merchant/description text field
  - Category dropdown selector
  - Optional notes field
- Visual feedback for invalid entries
- Save as draft or import immediately

## Technical Considerations

### Option A: CSV Only (Recommended for MVP)
- **Pros:** Fast implementation (2-3 days), no OCR complexity, most banks provide CSV
- **Cons:** Limited to CSV format, requires manual export from bank
- **Implementation:** Use `papaparse` or built-in parsing

### Option B: CSV + PDF Support
- **Pros:** Support more statement formats, better UX
- **Cons:** More complex (4-5 days), requires OCR for scanned PDFs
- **Implementation:** Add `pdf-parse` + `tesseract.js`

### Merchant-to-Category Mapping
- **Option A:** Basic hardcoded merchant list (fast, limited accuracy)
- **Option B:** ML-based categorization with user feedback loop (better accuracy, needs model training)
- **Recommended:** Start with Option A, evolve to Option B based on user corrections

### Duplicate Detection Strategy
Match transactions by:
1. Exact match: (date, amount, merchant)
2. Fuzzy match: Same date + amount, similar merchant name
3. Transaction ID if available (most reliable)
4. User-friendly warning: "Similar transaction found on [date], amount ₹[amount]"

### Security & Privacy
- **File Handling:**
  - Store uploaded files temporarily in `/tmp` or memory
  - Delete files immediately after processing
  - No permanent storage of raw statement files
  
- **Data Protection:**
  - Don't log transaction details in production
  - Validate all input before processing
  - Use HTTPS for file uploads
  - Consider end-to-end encryption for sensitive data

- **User Notification:**
  - Inform users: "We extract and delete your statement immediately"
  - Show what data is extracted and stored
  - Provide option to delete all imported transactions

## Database Schema Updates

**Expense Model Addition:**
```javascript
const expenseSchema = new mongoose.Schema({
  // ... existing fields
  sourceType: {
    type: String,
    enum: ['manual', 'statement'],
    default: 'manual'
  },
  transactionId: String,  // From bank statement
  merchant: String,       // Extracted merchant name
  rawDescription: String, // Original description from statement
  importedAt: Date,       // When this was bulk imported
  uploadBatchId: String   // To group transactions from same upload
});
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/expenses/upload-statement` | Parse and preview statement file |
| POST | `/api/expenses/bulk-import` | Save extracted transactions to DB |
| GET | `/api/expenses/imports/history` | List all import batches |
| DELETE | `/api/expenses/imports/:batchId` | Delete all transactions from batch |

## Implementation Timeline

- **Day 1:** Backend file upload + CSV parser
- **Day 2:** Auto-categorization logic + bulk import API
- **Day 3:** React UI for statement upload + preview
- **Day 4:** Manual corrections + error handling
- **Day 5:** Testing + integration with existing features

## Success Criteria

✅ Users can upload CSV statement files  
✅ System extracts date, amount, merchant, type automatically  
✅ Transactions are auto-categorized with 80%+ accuracy  
✅ Users can correct categories before saving  
✅ Bulk import saves 30+ transactions in < 5 seconds  
✅ Duplicate detection prevents double-counting  
✅ Monthly statistics reflect imported transactions  
✅ No sensitive data stored permanently  

## Implementation Phases

### Phase 1: Tesseract.js (Current - 3-4 days)
**Free OCR solution for images and scanned PDFs**

- ✅ Zero cost
- ✅ Works offline (client or server-side)
- ✅ 85-90% accuracy on clear documents
- ✅ Easy setup (npm install tesseract.js)
- ⚠️ Slower processing (3-5 sec per image)
- ⚠️ Requires text parsing after OCR

**Tesseract Implementation:**
```javascript
import Tesseract from 'tesseract.js';

// Extract text from image/PDF
const { data: { text } } = await Tesseract.recognize(imageFile);

// Parse extracted text into transactions
const transactions = parseTransactionText(text);

// Auto-categorize and return
return categorizeTransactions(transactions);
```

**Supported Formats in Phase 1:**
- PDF files (scanned or digital bank statements)
- Supports common Indian bank formats (HDFC, ICICI, SBI, Axis, Kotak, etc.)
- Both text-based and image-based PDFs (via Tesseract OCR)

**Limitations:**
- Handwritten entries: 60-70% accuracy
- Poor quality images: Lower accuracy
- 15 calls/minute if rate-limited

### Phase 2: Gemini API (Future - when needed)
**Free AI model for better accuracy**

- ✅ 95%+ accuracy on financial documents
- ✅ Understands context and structure
- ✅ No monthly costs (free tier)
- ✅ Faster (1-2 sec per statement)
- ✅ Better handwriting recognition
- ⚠️ Requires internet connection
- ⚠️ API key setup needed

**Migration Path from Phase 1 to Phase 2:**
1. Create abstraction layer: `StatementParser` interface
2. Implement `TesseractParser` class in Phase 1
3. In Phase 2, implement `GeminiParser` class
4. Switch via environment variable: `PARSER_TYPE=tesseract|gemini`
5. No UI/database changes needed

**Gemini Implementation Preview:**
```javascript
// Future Phase 2
const response = await genAI.generateContent([
    { inlineData: { data: imageBase64, mimeType: "image/jpeg" } },
    { text: "Extract transactions as JSON..." }
]);
const transactions = JSON.parse(response.response.text());
```

---

## Phase 1: Detailed Implementation Plan

### Step 1: Backend Setup & Dependencies
```bash
npm install tesseract.js pdf-parse multer papaparse
```

**Why these libraries?**
- `pdf-parse`: Extract text from PDF files (handles both text & scanned)
- `tesseract.js`: OCR for scanned PDFs (fallback if pdf-parse can't extract)
- `multer`: Handle PDF file uploads
- `papaparse`: Parse structured text data

**Files to create:**
- `backend/utils/pdfParser.js` - Extract text from PDF using pdf-parse
- `backend/utils/statementParser.js` - Parse PDF text into transactions
- `backend/utils/transactionExtractor.js` - Extract transaction fields
- `backend/utils/categoryMapper.js` - Auto-categorize merchants
- `backend/controllers/statementController.js` - API endpoints
- `backend/routes/statementRoutes.js` - Route definitions

### Step 2: Database Schema Updates
Add fields to Expense model:
```javascript
sourceType: { type: String, enum: ['manual', 'statement'], default: 'manual' }
transactionId: String
merchant: String
rawDescription: String
importedAt: Date
uploadBatchId: String
```

### Step 3: API Endpoints
1. `POST /api/expenses/parse-statement` - Upload file, extract & preview
2. `POST /api/expenses/bulk-import` - Save validated transactions
3. `GET /api/expenses/imports/history` - List import batches
4. `DELETE /api/expenses/imports/:batchId` - Delete batch

### Step 4: React Components
1. `StatementUploader.jsx` - File upload with drag-drop
2. `TransactionPreview.jsx` - Preview table with editable rows
3. `CategorySelector.jsx` - Category dropdown for each row
4. `ImportSummary.jsx` - Success/error summary

### Step 5: End-to-End Flow
User uploads statement image → Tesseract extracts text → Parse to transactions → Auto-categorize → Preview in UI → User corrects → Bulk import to DB → Update statistics

---

## Timeline

- **Day 1:** Tesseract setup + statement parser + transaction extractor
- **Day 2:** Category mapper + bulk import API + duplicate detection
- **Day 3:** React UI components + preview interface
- **Day 4:** Manual corrections + error handling + testing
- **Day 5 (Optional):** Phase 2 planning + Gemini abstraction layer

---

## Next Steps

1. ✅ Confirm Phase 1 with Tesseract.js
2. Install dependencies
3. Create statement parser utility
4. Build transaction extraction logic
5. Implement category mapping
6. Create API endpoints
7. Build React UI components
