import { useState } from 'react';
import API_URL from '../config';

const ExpenseForm = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'DEBIT',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'Food', icon: '🍔', color: 'from-orange-500 to-red-500' },
    { value: 'Transport', icon: '🚗', color: 'from-blue-500 to-cyan-500' },
    { value: 'Entertainment', icon: '🎮', color: 'from-purple-500 to-pink-500' },
    { value: 'Shopping', icon: '🛍️', color: 'from-pink-500 to-rose-500' },
    { value: 'Bills', icon: '📄', color: 'from-yellow-500 to-orange-500' },
    { value: 'Health', icon: '⚕️', color: 'from-green-500 to-emerald-500' },
    { value: 'Other', icon: '📦', color: 'from-gray-500 to-slate-500' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          amount: '',
          type: 'DEBIT',
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        onExpenseAdded();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-glow animate-slide-up">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Add New Expense</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">Type</label>
            <div className="flex bg-slate-800/50 p-1 rounded-xl border border-purple-500/20">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'DEBIT' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.type === 'DEBIT'
                    ? 'bg-red-500/20 text-red-400 shadow-lg border border-red-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Debit
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'CREDIT' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.type === 'CREDIT'
                    ? 'bg-green-500/20 text-green-400 shadow-lg border border-green-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Credit
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">₹</span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-10 pr-4 py-3 glass-dark rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-400"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  formData.category === cat.value
                    ? `bg-gradient-to-br ${cat.color} shadow-glow scale-105`
                    : 'glass-dark hover:scale-105'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 glass-dark rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 glass-dark rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-400 resize-none"
            rows="3"
            placeholder="Add a note..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 gradient-primary rounded-xl font-semibold text-white shadow-glow hover:shadow-glow-blue hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : '✨ Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
