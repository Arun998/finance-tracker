import DailyChart from '../components/DailyChart';

export default function DailyPage({ weeklySummary }) {
  return (
    <div className="space-y-8">
      <DailyChart weeklySummary={weeklySummary} />
    </div>
  );
}
