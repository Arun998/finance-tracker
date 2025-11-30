import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'],
    default: 'Other'
  },
  type: {
    type: String,
    enum: ['DEBIT', 'CREDIT'],
    default: 'DEBIT',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Fields for statement imports
  sourceType: {
    type: String,
    enum: ['manual', 'statement'],
    default: 'manual',
    index: true
  },
  transactionId: {
    type: String,
    sparse: true
  },
  merchant: {
    type: String,
    sparse: true
  },
  rawDescription: {
    type: String,
    sparse: true
  },
  importedAt: {
    type: Date,
    sparse: true
  },
  uploadBatchId: {
    type: String,
    sparse: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient date-based queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ sourceType: 1, importedAt: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
