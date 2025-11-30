import StatementPage from '../components/StatementPage';

export default function ImportPage() {
  return (
    <StatementPage 
      onBack={() => window.history.back()}
      onViewExpenses={() => window.location.href = '/all-transactions'}
    />
  );
}
