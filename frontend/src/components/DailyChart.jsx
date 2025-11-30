import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfMonth, addDays } from 'date-fns';

const DailyChart = ({ weeklySummary, monthlySummary }) => {
  const [selectedWeek, setSelectedWeek] = useState('current'); // 'current', 'week1', 'week2', 'week3', 'week4'

  // Helper to aggregate expenses by day from monthly summary
  const getMonthlyByDay = () => {
    const byDay = {};
    if (monthlySummary?.expenses) {
      monthlySummary.expenses.forEach(exp => {
        const dateStr = format(new Date(exp.date), 'yyyy-MM-dd');
        if (!byDay[dateStr]) {
          byDay[dateStr] = { total: 0 };
        }
        byDay[dateStr].total += exp.amount;
      });
    }
    return byDay;
  };

  // Generate chart data for a specific week
  const generateChartData = (weekKey) => {
    const data = [];
    let byDaySource = {};
    
    if (weekKey === 'current') {
      byDaySource = weeklySummary?.byDay || {};
    } else {
      byDaySource = getMonthlyByDay();
    }

    const today = new Date();
    let startDate;
    
    if (weekKey === 'current') {
      // Current week: last 7 days
      startDate = subDays(today, 6);
    } else {
      // Month-based weeks: week1 = 1-7, week2 = 8-14, week3 = 15-21, week4 = 22-28, week5 = 29-31
      const monthStart = startOfMonth(today);
      const weekNum = parseInt(weekKey.replace('week', ''));
      startDate = addDays(monthStart, (weekNum - 1) * 7);
    }
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE');
      
      data.push({
        day: dayName,
        amount: byDaySource[dateStr]?.total || 0,
        fullDate: format(date, 'MMM dd')
      });
    }
    
    return data;
  };

  const chartData = generateChartData(selectedWeek);
  
  // Calculate week range for display
  const today = new Date();
  let displayStartDate, displayEndDate;
  
  if (selectedWeek === 'current') {
    displayStartDate = subDays(today, 6);
    displayEndDate = today;
  } else {
    const monthStart = startOfMonth(today);
    const weekNum = parseInt(selectedWeek.replace('week', ''));
    displayStartDate = addDays(monthStart, (weekNum - 1) * 7);
    displayEndDate = addDays(displayStartDate, 6);
  }
  
  const weekRange = `${format(displayStartDate, 'MMM dd')} - ${format(displayEndDate, 'MMM dd, yyyy')}`;
  
  // Generate week options
  const weekOptions = [
    { label: 'This Week (Last 7 Days)', value: 'current' },
    { label: '1st Week (1-7)', value: 'week1' },
    { label: '2nd Week (8-14)', value: 'week2' },
    { label: '3rd Week (15-21)', value: 'week3' },
    { label: '4th Week (22-28)', value: 'week4' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-dark rounded-lg p-3 border border-purple-500/50 shadow-xl">
          <p className="text-gray-300 text-xs mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-white font-bold text-lg">₹{payload[0].value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up border border-purple-500/20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Daily Spending</h2>
        
        {/* Week Selector Dropdown */}
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-purple-500/30 text-white text-sm font-medium hover:border-purple-500/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          {weekOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Week Range Display */}
      <p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
        {weekRange}
      </p>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(168, 85, 247, 0.5)', strokeWidth: 2, strokeDasharray: '5 5' }} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#a855f7" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyChart;
