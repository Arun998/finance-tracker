import express from 'express';
import multer from 'multer';
import {
    parseStatement,
    bulkImportTransactions,
    getImportHistory,
    deleteImportBatch
} from '../controllers/statementController.js';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
    dest: 'uploads/statements/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Only allow PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Routes - Statement specific endpoints
router.post('/expenses/parse-statement', upload.single('file'), parseStatement);
router.post('/expenses/bulk-import', bulkImportTransactions);
router.get('/expenses/imports/history', getImportHistory);
router.delete('/expenses/imports/:batchId', deleteImportBatch);

export default router;
