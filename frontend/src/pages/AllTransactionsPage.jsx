import AllTransactions from '../components/AllTransactions';

export default function AllTransactionsPage({ expenses }) {
  return (
    <div className="space-y-8">
      <AllTransactions transactions={expenses} onBack={() => window.history.back()} />
    </div>
  );
}
