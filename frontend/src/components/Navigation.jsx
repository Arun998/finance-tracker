import { useLocation, Link } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: '📊' },
    { path: '/daily', label: 'Daily', icon: '📅' },
    { path: '/weekly', label: 'Weekly', icon: '📈' },
    { path: '/monthly', label: 'Monthly', icon: '🗓️' },
    { path: '/all-transactions', label: 'View All Transactions', icon: '📋' },
    { path: '/import', label: 'Import Bank Statement', icon: '📄' }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 py-8 mb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 animate-fade-in">
            <span className="text-gradient">Finance Tracker</span>
          </h1>
          <p className="text-gray-300 text-lg">Smart expense management for better financial health</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3 flex-wrap">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  isActive
                    ? 'gradient-primary shadow-glow scale-105'
                    : 'glass hover:scale-105'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

