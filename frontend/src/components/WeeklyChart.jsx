import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklyChart = ({ monthlySummary }) => {
  const generateWeeklyData = () => {
    const byWeek = monthlySummary?.byWeek || {};
    
    return Object.keys(byWeek).map(week => ({
      week,
      amount: byWeek[week].total
    }));
  };

  const chartData = generateWeeklyData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-dark rounded-lg p-3 border border-blue-500/50">
          <p className="text-white font-semibold">{payload[0].payload.week}</p>
          <p className="text-gradient font-bold text-lg">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Weekly Trends (This Month)</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="week" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="url(#lineGradient)" 
            strokeWidth={3}
            dot={{ fill: '#a855f7', r: 6 }}
            activeDot={{ r: 8, fill: '#ec4899' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
