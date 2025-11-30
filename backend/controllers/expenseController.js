import Expense from '../models/Expense.js';

// Add new expense
export const addExpense = async (req, res) => {
    try {
        const { amount, category, date, notes, type } = req.body;

        const expense = new Expense({
            amount,
            category,
            type: type || 'DEBIT',
            date: date || new Date(),
            notes
        });

        await expense.save();

        res.status(201).json({
            success: true,
            data: expense,
            message: 'Expense added successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all expenses
export const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find()
            .sort({ date: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get daily summary
export const getDailySummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dailyExpenses = await Expense.find({
            date: { $gte: today, $lt: tomorrow }
        });

        let totalCredit = 0;
        let totalDebit = 0;

        dailyExpenses.forEach(exp => {
            if (exp.type === 'CREDIT') {
                totalCredit += exp.amount;
            } else {
                totalDebit += exp.amount;
            }
        });

        const total = totalDebit - totalCredit; // Net expense

        const byCategory = dailyExpenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                total,
                totalCredit,
                totalDebit,
                count: dailyExpenses.length,
                byCategory,
                expenses: dailyExpenses
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get weekly summary
export const getWeeklySummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const weeklyExpenses = await Expense.find({
            date: { $gte: weekAgo, $lt: tomorrow }
        }).sort({ date: 1 });

        let totalCredit = 0;
        let totalDebit = 0;

        weeklyExpenses.forEach(exp => {
            if (exp.type === 'CREDIT') {
                totalCredit += exp.amount;
            } else {
                totalDebit += exp.amount;
            }
        });

        const total = totalDebit - totalCredit; // Net expense

        // Group by day
        const byDay = {};
        weeklyExpenses.forEach(exp => {
            const day = exp.date.toISOString().split('T')[0];
            if (!byDay[day]) {
                byDay[day] = { total: 0, expenses: [] };
            }
            byDay[day].total += exp.amount;
            byDay[day].expenses.push(exp);
        });

        // Group by category
        const byCategory = weeklyExpenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                total,
                totalCredit,
                totalDebit,
                count: weeklyExpenses.length,
                byDay,
                byCategory,
                expenses: weeklyExpenses
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get monthly summary
export const getMonthlySummary = async (req, res) => {
    try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        const monthlyExpenses = await Expense.find({
            date: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth }
        }).sort({ date: 1 });

        let totalCredit = 0;
        let totalDebit = 0;

        monthlyExpenses.forEach(exp => {
            if (exp.type === 'CREDIT') {
                totalCredit += exp.amount;
            } else {
                totalDebit += exp.amount;
            }
        });

        const total = totalDebit - totalCredit; // Net expense

        // Group by category
        const byCategory = monthlyExpenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        // Group by week
        const byWeek = {};
        monthlyExpenses.forEach(exp => {
            const weekNum = Math.ceil(exp.date.getDate() / 7);
            if (!byWeek[`Week ${weekNum}`]) {
                byWeek[`Week ${weekNum}`] = { total: 0, expenses: [] };
            }
            byWeek[`Week ${weekNum}`].total += exp.amount;
            byWeek[`Week ${weekNum}`].expenses.push(exp);
        });

        res.status(200).json({
            success: true,
            data: {
                total,
                totalCredit,
                totalDebit,
                count: monthlyExpenses.length,
                byCategory,
                byWeek,
                expenses: monthlyExpenses
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
