import { useEffect, useState } from 'react';
import SummaryCards from '../components/SummaryCards';
import DailyChart from '../components/DailyChart';
import WeeklyChart from '../components/WeeklyChart';
import MonthlyChart from '../components/MonthlyChart';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import API_URL from '../config';

export default function OverviewPage({ expenses, onExpenseAdded, dailySummary, weeklySummary, monthlySummary }) {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <SummaryCards 
        dailySummary={dailySummary}
        weeklySummary={weeklySummary}
        monthlySummary={monthlySummary}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form and List */}
        <div className="lg:col-span-1 space-y-6">
          <ExpenseForm onExpenseAdded={onExpenseAdded} />
          <ExpenseList expenses={expenses.slice(0, 5)} />
        </div>

        {/* Right Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <DailyChart weeklySummary={weeklySummary} monthlySummary={monthlySummary} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <WeeklyChart monthlySummary={monthlySummary} />
            <MonthlyChart monthlySummary={monthlySummary} />
          </div>
        </div>
      </div>
    </div>
  );
}
