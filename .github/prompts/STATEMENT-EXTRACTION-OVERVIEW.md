# Statement Extraction Feature - High Level Overview

## Goal
Let users upload bank statement PDFs and automatically extract transactions into the Finance Tracker app.

---

## What Users Will Do

### 1. Upload PDF 
- User navigates to "Import Statements" section
- Clicks upload or drags PDF file
- Supports bank statements from HDFC, ICICI, SBI, Axis, Kotak, etc.

### 2. Preview Extracted Data
- App automatically extracts transactions from PDF
- Shows table with: Date, Merchant, Amount, Type (DEBIT/CREDIT)
- Displays auto-detected category (Food, Transport, etc.)

### 3. Review & Correct
- User can edit any field (date, amount, merchant, category)
- Delete rows they don't want
- Bulk reassign categories (e.g., select all as "Food")

### 4. Import to Database
- Click "Import" button
- All transactions saved to MongoDB
- Automatically shows in monthly statistics

### 5. View in App
- Imported transactions appear in expense list
- Monthly summaries update with new data
- Can filter by date, category, source (manual vs imported)

---

## Technical Architecture

```
Frontend (React)
├─ StatementUploader component
│  ├─ File upload with drag-drop
│  ├─ Loading indicator while processing
│  └─ Error handling
│
├─ TransactionPreview component
│  ├─ Editable table of extracted transactions
│  ├─ Category selector
│  └─ Bulk edit options
│
└─ ImportSummary component
   └─ Success/error results

        ↕ API Calls

Backend (Express + Node.js)
├─ PDF Parser Service
│  ├─ Extract text from PDF using pdf-parse
│  └─ Fallback to tesseract.js OCR if needed
│
├─ Transaction Extractor
│  ├─ Parse text into structured data
│  └─ Extract: date, amount, merchant, type
│
├─ Category Mapper
│  ├─ Match merchant → category
│  └─ Keyword matching (Swiggy→Food, Uber→Transport)
│
└─ Import API Endpoints
   ├─ POST /api/expenses/parse-statement (upload & preview)
   ├─ POST /api/expenses/bulk-import (save transactions)
   ├─ GET /api/expenses/imports/history (list batches)
   └─ DELETE /api/expenses/imports/:batchId (delete batch)

        ↕ Database

MongoDB
├─ Expense collection (updated with new fields)
│  ├─ sourceType: 'manual' | 'statement'
│  ├─ merchant: extracted merchant name
│  ├─ transactionId: bank transaction ID
│  ├─ uploadBatchId: group imported transactions
│  └─ importedAt: timestamp
```

---

## Key Features

✅ **Automatic Extraction**
- PDF → Text extraction (pdf-parse)
- Text → Transactions (parsing logic)
- Transactions → Categories (merchant mapping)

✅ **User Control**
- Edit any extracted field
- Correct auto-detected categories
- Delete unwanted transactions before saving

✅ **Batch Operations**
- Import 30+ transactions at once
- Group by batch for easy management
- Delete entire batch if needed

✅ **Smart Categorization**
- Auto-detect based on merchant name
- 80%+ accuracy for common merchants
- Users can override

✅ **Duplicate Prevention**
- Check if transaction already exists
- Show warnings before import

✅ **Integration**
- Works with existing expense tracking
- Updates monthly statistics
- Searchable and filterable

---

## Implementation Phases

### Phase 1 (Week 1): Tesseract.js + pdf-parse
**Free OCR + Text Extraction**

- Install packages: `pdf-parse`, `tesseract.js`, `multer`
- Build PDF text extraction
- Create transaction parser
- Build category mapper
- Create API endpoints
- Build React UI for upload & preview

**Packages to install:**
```bash
npm install pdf-parse tesseract.js multer papaparse
```

### Phase 2 (Future): Upgrade to Gemini AI
**Better accuracy with LLM**

- Switch to Gemini API for better accuracy (95%+)
- No UI/database changes needed
- Just swap the parsing backend

---

## User Benefits

💰 **Save Time**: Import 30 transactions in < 1 minute instead of manually entering each one

📊 **Accurate Tracking**: Automatic categorization reduces manual errors

📱 **Multi-Bank Support**: Works with all Indian banks

🔒 **Privacy**: PDFs deleted immediately after processing, no data stored

---

## Implementation Timeline

- **Day 1-2**: Backend - PDF extraction + transaction parsing
- **Day 3**: Backend - Auto-categorization + API endpoints
- **Day 4**: Frontend - Upload UI + preview table
- **Day 5**: Testing + error handling + deployment

---

## Example Workflow

```
1. User: "I'll import my Nov 2025 HDFC statement"
   ↓
2. System: Extracts 28 transactions from PDF
   ↓
3. Preview shows:
   - Nov 23: YOUSTA (Debit ₹1,298) → Auto-categorized: Food
   - Nov 22: Attibele Electronic City (Debit ₹25) → Auto: Shopping
   - Nov 22: Shailesh-idexcel (Debit ₹2,000) → Auto: Other
   ↓
4. User: Changes "Attibele Electronic City" to "Bills" (corrects auto-category)
   ↓
5. User: Clicks "Import 28 Transactions"
   ↓
6. System: Saves to DB, updates statistics
   ↓
7. User: Sees November summary now shows all imported transactions
```

---

## Package Selection (Phase 1)

### Required Packages

| Package | Purpose | Why? |
|---------|---------|------|
| **pdf-parse** | Extract text from PDFs | Fast, reliable, 5M+ downloads |
| **tesseract.js** | OCR for scanned PDFs | Free fallback, 85%+ accuracy |
| **multer** | Handle file uploads | Industry standard, secure |
| **papaparse** | Parse structured data | Handle CSV if needed |

### Installation Command
```bash
cd /Users/arun.k/Desktop/finance/backend
npm install pdf-parse tesseract.js multer papaparse
```

---

## Database Schema Updates

**Add these fields to Expense model:**
```javascript
sourceType: {
  type: String,
  enum: ['manual', 'statement'],
  default: 'manual'
}
transactionId: String        // From bank statement
merchant: String             // Extracted merchant name
rawDescription: String       // Original from statement
importedAt: Date            // When imported
uploadBatchId: String       // Group transactions from same upload
```

---

## API Endpoints (Phase 1)

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/expenses/parse-statement` | Upload & preview | PDF file | Array of transactions with preview |
| POST | `/api/expenses/bulk-import` | Save transactions | Validated transactions array | Import summary (count, duplicates) |
| GET | `/api/expenses/imports/history` | List imports | - | List of import batches |
| DELETE | `/api/expenses/imports/:batchId` | Delete batch | Batch ID | Success confirmation |

---

## Next Steps

1. ✅ Understand high-level feature (done)
2. Install dependencies
3. Create PDF parser utility
4. Build transaction extraction logic
5. Implement category mapping
6. Create API endpoints
7. Build React UI components
8. Test end-to-end

---

**Status:** Ready to implement Phase 1
**Estimated Time:** 5 days
**Complexity:** Medium
**Cost:** Free (no paid APIs)
