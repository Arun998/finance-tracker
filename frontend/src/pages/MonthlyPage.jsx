import MonthlyChart from '../components/MonthlyChart';

export default function MonthlyPage({ monthlySummary }) {
  return (
    <div className="space-y-8">
      <MonthlyChart monthlySummary={monthlySummary} />
    </div>
  );
}
