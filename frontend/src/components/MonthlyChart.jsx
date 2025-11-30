import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const MonthlyChart = ({ monthlySummary }) => {
  const categoryColors = {
    Food: '#f97316',
    Transport: '#3b82f6',
    Entertainment: '#a855f7',
    Shopping: '#ec4899',
    Bills: '#eab308',
    Health: '#10b981',
    Other: '#6b7280'
  };

  const generatePieData = () => {
    const byCategory = monthlySummary?.byCategory || {};
    
    return Object.keys(byCategory).map(category => ({
      name: category,
      value: byCategory[category],
      color: categoryColors[category]
    }));
  };

  const chartData = generatePieData();
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="glass-dark rounded-lg p-3 border border-purple-500/50">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-gradient font-bold text-lg">₹{payload[0].value.toFixed(2)}</p>
          <p className="text-gray-300 text-sm">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Monthly Breakdown by Category</h2>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span className="text-white text-sm">
                  {value}: ₹{entry.payload.value.toFixed(2)}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-400">No data available for this month</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyChart;
