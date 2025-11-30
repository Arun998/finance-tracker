import WeeklyChart from '../components/WeeklyChart';

export default function WeeklyPage({ monthlySummary }) {
  return (
    <div className="space-y-8">
      <WeeklyChart monthlySummary={monthlySummary} />
    </div>
  );
}
