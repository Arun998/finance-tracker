import express from 'express';
import { body } from 'express-validator';
import {
    addExpense,
    getAllExpenses,
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary
} from '../controllers/expenseController.js';

const router = express.Router();

// Validation middleware
const expenseValidation = [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').isIn(['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'])
        .withMessage('Invalid category'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
];

// Routes
router.post('/expenses', expenseValidation, addExpense);
router.get('/expenses', getAllExpenses);
router.get('/expenses/summary/daily', getDailySummary);
router.get('/expenses/summary/weekly', getWeeklySummary);
router.get('/expenses/summary/monthly', getMonthlySummary);

export default router;
