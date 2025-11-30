import { CheckCircle, AlertCircle, Download, Upload } from 'lucide-react';

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

export default function ImportSummary({ result, onNewImport, onViewExpenses }) {
    const { data } = result;
    const totalValue = data.summary?.totalAmount || 0;
    const categoryBreakdown = data.summary?.byCategory || {};

    return (
        <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-semibold text-green-200">Import Successful!</h3>
                    <p className="text-green-300 mt-1">
                        {data.imported} transactions have been imported and categorized
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-gray-400">Imported</p>
                    <p className="text-2xl font-bold text-green-400">{data.imported}</p>
                    <p className="text-xs text-gray-500 mt-1">transactions</p>
                </div>
                <div className="glass rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-gray-400">Skipped</p>
                    <p className="text-2xl font-bold text-orange-400">{data.skipped || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">duplicates</p>
                </div>
                <div className="glass rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-400">₹{totalValue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">imported</p>
                </div>
                <div className="glass rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-gray-400">Batch ID</p>
                    <p className="text-sm font-mono text-white truncate" title={data.batchId}>
                        {data.batchId?.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-500 mt-1">reference</p>
                </div>
            </div>

            {/* Category Breakdown */}
            {Object.keys(categoryBreakdown).length > 0 && (
                <div className="glass rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Breakdown by Category</h3>
                    <div className="space-y-3">
                        {Object.entries(categoryBreakdown).map(([category, stats]) => (
                            <div key={category}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                        {getCategoryEmoji(category)} {category}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        {stats.count} • ₹{stats.total?.toLocaleString() || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                        style={{
                                            width: `${(stats.total / totalValue) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Duplicate Alert */}
            {(data.skipped || 0) > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-yellow-200">
                            {data.skipped} duplicate transaction{data.skipped > 1 ? 's' : ''} were skipped
                        </p>
                        <p className="text-sm text-yellow-300/80">
                            These transactions were already in your expense list
                        </p>
                    </div>
                </div>
            )}

            {/* Date Range Info */}
            {data.summary?.dateRange?.earliest && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm text-blue-200">
                        <strong>Date Range:</strong> {new Date(data.summary.dateRange.earliest).toLocaleDateString()} 
                        {' '}to{' '}
                        {new Date(data.summary.dateRange.latest).toLocaleDateString()}
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-between">
                <button
                    onClick={onNewImport}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Import Another Statement
                </button>
                <button
                    onClick={onViewExpenses}
                    className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-white/10 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    View All Expenses
                </button>
            </div>

            {/* Transaction IDs Info */}
            <div className="glass rounded-xl p-6 border border-purple-500/20">
                <p className="text-sm font-semibold text-gradient mb-3">ℹ️ All transactions have been tagged with:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li>✓ Source type: <span className="font-mono text-blue-400">statement</span></li>
                    <li>✓ Batch ID: <span className="font-mono text-blue-400">{data.batchId}</span></li>
                    <li>✓ Category: Auto-assigned based on merchant</li>
                    <li>✓ Transaction ID: From bank statement</li>
                </ul>
            </div>
        </div>
    );
}
