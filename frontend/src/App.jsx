import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import OverviewPage from './pages/OverviewPage';
import DailyPage from './pages/DailyPage';
import WeeklyPage from './pages/WeeklyPage';
import MonthlyPage from './pages/MonthlyPage';
import AllTransactionsPage from './pages/AllTransactionsPage';
import ImportPage from './pages/ImportPage';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);

  const fetchData = async () => {
    try {
      // Fetch all expenses
      const expensesRes = await fetch('http://localhost:5000/api/expenses');
      const expensesData = await expensesRes.json();
      setExpenses(expensesData.data || []);

      // Fetch daily summary
      const dailyRes = await fetch('http://localhost:5000/api/expenses/summary/daily');
      const dailyData = await dailyRes.json();
      setDailySummary(dailyData.data);

      // Fetch weekly summary
      const weeklyRes = await fetch('http://localhost:5000/api/expenses/summary/weekly');
      const weeklyData = await weeklyRes.json();
      setWeeklySummary(weeklyData.data);

      // Fetch monthly summary
      const monthlyRes = await fetch('http://localhost:5000/api/expenses/summary/monthly');
      const monthlyData = await monthlyRes.json();
      setMonthlySummary(monthlyData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExpenseAdded = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route 
              path="/" 
              element={
                <OverviewPage 
                  expenses={expenses}
                  onExpenseAdded={handleExpenseAdded}
                  dailySummary={dailySummary}
                  weeklySummary={weeklySummary}
                  monthlySummary={monthlySummary}
                />
              } 
            />
            <Route path="/daily" element={<DailyPage weeklySummary={weeklySummary} />} />
            <Route path="/weekly" element={<WeeklyPage monthlySummary={monthlySummary} />} />
            <Route path="/monthly" element={<MonthlyPage monthlySummary={monthlySummary} />} />
            <Route path="/all-transactions" element={<AllTransactionsPage expenses={expenses} />} />
            <Route path="/import" element={<ImportPage />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-gray-400 text-sm border-t border-gray-700">
        <p>Built with React, TailwindCSS, Node.js & MongoDB</p>
      </footer>
    </div>
  );
}

export default App;
