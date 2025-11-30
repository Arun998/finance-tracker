import { useEffect, useState } from 'react';

const SummaryCards = ({ dailySummary, weeklySummary, monthlySummary }) => {
  const [animatedValues, setAnimatedValues] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0
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
        daily: (dailySummary?.total || 0) * progress,
        weekly: (weeklySummary?.total || 0) * progress,
        monthly: (monthlySummary?.total || 0) * progress
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
      amount: animatedValues.daily,
      icon: '📅',
      gradient: 'from-blue-500 to-cyan-500',
      count: dailySummary?.count || 0
    },
    {
      title: 'This Week',
      amount: animatedValues.weekly,
      icon: '📊',
      gradient: 'from-purple-500 to-pink-500',
      count: weeklySummary?.count || 0
    },
    {
      title: 'This Month',
      amount: animatedValues.monthly,
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
          
          <div className="space-y-2">
            <p className="text-4xl font-bold text-gradient">
              ₹{card.amount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">
              {card.count} {card.count === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
