import { useEffect, useState } from 'react';

const SummaryCards = ({ dailySummary, weeklySummary, monthlySummary }) => {
  const [animatedValues, setAnimatedValues] = useState({
    daily: { total: 0, credit: 0, debit: 0 },
    weekly: { total: 0, credit: 0, debit: 0 },
    monthly: { total: 0, credit: 0, debit: 0 }
  });

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues({
        daily: {
            total: (dailySummary?.total || 0) * progress,
            credit: (dailySummary?.totalCredit || 0) * progress,
            debit: (dailySummary?.totalDebit || 0) * progress
        },
        weekly: {
            total: (weeklySummary?.total || 0) * progress,
            credit: (weeklySummary?.totalCredit || 0) * progress,
            debit: (weeklySummary?.totalDebit || 0) * progress
        },
        monthly: {
            total: (monthlySummary?.total || 0) * progress,
            credit: (monthlySummary?.totalCredit || 0) * progress,
            debit: (monthlySummary?.totalDebit || 0) * progress
        }
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [dailySummary, weeklySummary, monthlySummary]);

  const cards = [
    {
      title: 'Today',
      data: animatedValues.daily,
      icon: '📅',
      gradient: 'from-blue-500 to-cyan-500',
      count: dailySummary?.count || 0
    },
    {
      title: 'This Week',
      data: animatedValues.weekly,
      icon: '📊',
      gradient: 'from-purple-500 to-pink-500',
      count: weeklySummary?.count || 0
    },
    {
      title: 'This Month',
      data: animatedValues.monthly,
      icon: '📈',
      gradient: 'from-orange-500 to-red-500',
      count: monthlySummary?.count || 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="glass rounded-2xl p-6 hover:scale-105 transition-all shadow-glow animate-scale-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-medium">{card.title}</h3>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-2xl shadow-lg`}>
              {card.icon}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
                <p className="text-xs text-gray-400 mb-1">Net Expense</p>
                <p className="text-3xl font-bold text-white">
                ₹{card.data.total.toFixed(2)}
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <div>
                    <p className="text-xs text-red-400 mb-0.5">Debited</p>
                    <p className="text-sm font-semibold text-red-300">
                        ₹{card.data.debit.toFixed(0)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-green-400 mb-0.5">Credited</p>
                    <p className="text-sm font-semibold text-green-300">
                        ₹{card.data.credit.toFixed(0)}
                    </p>
                </div>
            </div>

            <p className="text-xs text-gray-500 text-center pt-1">
              {card.count} {card.count === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
