import { useState, useMemo,useEffect } from 'react';
import { ChevronLeft, TrendingDown, Calendar, Tag, Filter, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import API_URL from '../config';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'];
const MONTHS = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getCategoryEmoji = (category) => {
    const emojis = {
        'Food': '🍽️',
        'Transport': '🚗',
        'Entertainment': '🎬',
        'Shopping': '🛍️',
        'Bills': '💳',
        'Health': '⚕️',
        'Other': '❓'
    };
    return emojis[category] || '❓';
};

// Helper function to safely parse ISO date without timezone conversion
const formatDate = (isoDateString) => {
    if (!isoDateString) return '-';
    
    try {
        // Handle string dates like "2025-11-23"
        if (typeof isoDateString === 'string') {
            // Check if it's ISO format (YYYY-MM-DD)
            if (isoDateString.includes('-')) {
                const [year, month, day] = isoDateString.split('T')[0].split('-').map(Number);
                
                if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
                    console.warn('Invalid date parts:', { year, month, day, isoDateString });
                    return isoDateString;
                }
                
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
            }
            
            // Fallback: try to parse as regular date
            const date = new Date(isoDateString);
            if (isNaN(date.getTime())) {
                console.warn('Cannot parse date:', isoDateString);
                return isoDateString;
            }
            
            return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
        }
        
        return '-';
    } catch (e) {
        console.error('Date parsing error:', isoDateString, e);
        return isoDateString || '-';
    }
};

export default function AllTransactions({ onBack }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [merchantSearch, setMerchantSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All'); // 'All' | 'DEBIT' | 'CREDIT'
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch(`${API_URL}/api/expenses`);
                const data = await response.json();
                if (data.success) {
                    setTransactions(data.data);
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // Filter and Sort Transactions
    const processedTransactions = useMemo(() => {
        let result = [...transactions];

        // 1. Filter by Month
        if (selectedMonth !== 'All') {
            result = result.filter(tx => {
                const date = new Date(tx.date);
                const monthName = date.toLocaleString('default', { month: 'long' });
                return monthName === selectedMonth;
            });
        }

        // 2. Filter by Merchant (Search)
        if (merchantSearch.trim()) {
            const query = merchantSearch.toLowerCase();
            result = result.filter(tx => 
                (tx.merchant || '').toLowerCase().includes(query) ||
                (tx.description || '').toLowerCase().includes(query)
            );
        }

        // 3. Filter by Category
        if (selectedCategory !== 'All') {
            result = result.filter(tx => tx.category === selectedCategory);
        }

        // 4. Filter by Type
        if (selectedType !== 'All') {
            result = result.filter(tx => (tx.type || 'DEBIT') === selectedType);
        }

        // 5. Sort
        result.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Handle date sorting specifically
            if (sortConfig.key === 'date') {
                aValue = new Date(a.date).getTime();
                bValue = new Date(b.date).getTime();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [transactions, selectedMonth, merchantSearch, selectedCategory, selectedType, sortConfig]);
    
    const totalCredit = processedTransactions
        .filter(tx => tx.type === 'CREDIT')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const totalDebit = processedTransactions
        .filter(tx => (tx.type || 'DEBIT') === 'DEBIT')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    // Group transactions by category (for stats)
    const byCategory = {};
    processedTransactions.forEach(tx => {
        const category = tx.category || 'Other';
        if (!byCategory[category]) {
            byCategory[category] = [];
        }
        byCategory[category].push(tx);
    });

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 text-purple-400" /> : <ArrowDown className="w-4 h-4 text-purple-400" />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="glass rounded-2xl p-8 border border-purple-500/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <h1 className="text-4xl font-bold text-gradient">
                                {selectedMonth === 'All' ? 'All Transactions' : `Transactions for ${selectedMonth}`}
                            </h1>
                        </div>
                        <p className="text-gray-300 ml-11">
                            {processedTransactions.length} transactions
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300 pointer-events-none" />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-800 border border-purple-500/30 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer hover:border-purple-500/60 transition-colors min-w-[160px]"
                            >
                                {MONTHS.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                        <div className="hidden md:block p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <TrendingDown className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <p className="text-gray-400 text-sm mb-2">Total Transactions</p>
                    <p className="text-3xl font-bold text-gradient">{processedTransactions.length}</p>
                </div>
                <div className="glass rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <p className="text-gray-400 text-sm mb-2">Total Credit</p>
                    <p className="text-3xl font-bold text-green-400">₹{totalCredit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="glass rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <p className="text-gray-400 text-sm mb-2">Total Debit</p>
                    <p className="text-3xl font-bold text-red-400">
                        ₹{totalDebit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="glass rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <p className="text-gray-400 text-sm mb-2">Categories</p>
                    <p className="text-3xl font-bold text-blue-400">{Object.keys(byCategory).length}</p>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search merchant or description..."
                        value={merchantSearch}
                        onChange={(e) => setMerchantSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative min-w-[140px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        >
                            <option value="All">All Types</option>
                            <option value="DEBIT">Debit</option>
                            <option value="CREDIT">Credit</option>
                        </select>
                    </div>
                    <div className="relative min-w-[200px]">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="glass rounded-2xl overflow-hidden border border-purple-500/20">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-purple-600/20 border-b border-purple-500/30">
                            <tr>
                                <th 
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors group"
                                    onClick={() => handleSort('date')}
                                >
                                    <div className="flex items-center gap-2">
                                        Date
                                        <SortIcon columnKey="date" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Merchant</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Description</th>
                                <th 
                                    className="px-6 py-4 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors group"
                                    onClick={() => handleSort('amount')}
                                >
                                    <div className="flex items-center justify-end gap-2">
                                        Amount
                                        <SortIcon columnKey="amount" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {processedTransactions.length > 0 ? (
                                processedTransactions.map((transaction, idx) => (
                                    <tr key={transaction._id || idx} className="hover:bg-purple-600/10 transition-colors">
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Calendar className="w-4 h-4 text-purple-400 opacity-60" />
                                                <span className="font-medium">{formatDate(transaction.date)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {transaction.merchant || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                                            {transaction.description || transaction.rawDescription || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-right">
                                            <span className={transaction.type === 'CREDIT' ? 'text-green-400' : 'text-white'}>
                                                {transaction.type === 'CREDIT' ? '+' : ''}₹{transaction.amount ? transaction.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                transaction.type === 'CREDIT' 
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                {transaction.type || 'DEBIT'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/30 rounded-full text-purple-200">
                                                {getCategoryEmoji(transaction.category)} {transaction.category || 'Other'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p>No transactions found matching your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Category Breakdown */}
            {Object.keys(byCategory).length > 0 && (
                <div className="glass rounded-2xl p-8 border border-purple-500/20">
                    <h3 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-2">
                        <Tag className="w-6 h-6" />
                        Breakdown by Category
                    </h3>
                    <div className="space-y-5">
                        {Object.entries(byCategory).map(([category, items]) => {
                            const categoryTotal = items.reduce((sum, tx) => sum + tx.amount, 0);
                            const totalForPercentage = totalDebit + totalCredit; // Use total volume for percentage
                            const percentage = totalForPercentage > 0 ? (categoryTotal / totalForPercentage) * 100 : 0;
                            return (
                                <div key={category} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="flex items-center gap-2 text-sm font-semibold text-white group-hover:text-gradient transition-colors">
                                            {getCategoryEmoji(category)} {category}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            {items.length} txns • <span className="text-gradient font-semibold">₹{categoryTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/50"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
