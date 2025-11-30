import { format, formatDistanceToNow } from 'date-fns';

const ExpenseList = ({ expenses }) => {
  const categoryColors = {
    Food: 'from-orange-500 to-red-500',
    Transport: 'from-blue-500 to-cyan-500',
    Entertainment: 'from-purple-500 to-pink-500',
    Shopping: 'from-pink-500 to-rose-500',
    Bills: 'from-yellow-500 to-orange-500',
    Health: 'from-green-500 to-emerald-500',
    Other: 'from-gray-500 to-slate-500'
  };

  const categoryIcons = {
    Food: '🍔',
    Transport: '🚗',
    Entertainment: '🎮',
    Shopping: '🛍️',
    Bills: '📄',
    Health: '⚕️',
    Other: '📦'
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">💸</div>
        <p className="text-gray-300">No expenses yet. Start tracking!</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Recent Expenses</h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {expenses.map((expense) => (
          <div
            key={expense._id}
            className="glass-dark rounded-xl p-4 hover:scale-[1.02] hover:shadow-glow transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[expense.category]} flex items-center justify-center text-2xl shadow-lg`}>
                  {categoryIcons[expense.category]}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{expense.category}</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {expense.notes && (
                    <p className="text-sm text-gray-300 mb-2">{expense.notes}</p>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-gradient">
                  ₹{expense.amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
