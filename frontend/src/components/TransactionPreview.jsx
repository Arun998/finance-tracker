import { useState } from 'react';
import { Edit2, Trash2, Save, X, AlertCircle, CheckCircle2, FileText, Calendar, Tag, TrendingDown } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'];

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
    
    // Parse YYYY-MM-DD directly to avoid timezone issues
    const [year, month, day] = isoDateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Use local timezone constructor
    
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
};

export default function TransactionPreview({ transactions, fileInfo, onImport, onCancel, isImporting }) {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [selectedRows, setSelectedRows] = useState(new Set());

    const startEdit = (transaction) => {
        setEditingId(transaction._id || `temp-${Math.random()}`);
        setEditData(transaction);
    };

    const saveEdit = () => {
        const updatedTransactions = transactions.map(t => 
            (t._id || `temp-${Math.random()}`) === editingId ? editData : t
        );
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const toggleRow = (id) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const deleteTransaction = (id) => {
        const index = transactions.findIndex(t => (t._id || `temp-${transactions.indexOf(t)}`) === id);
        if (index > -1) {
            console.log('Delete transaction at index:', index);
        }
    };

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const categorizerAccuracy = transactions.filter(tx => tx.categoryInfo?.confidence >= 80).length / transactions.length * 100;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header - Matching AllTransactions style */}
            <div className="glass rounded-2xl p-8 border border-purple-500/20">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gradient mb-2">{fileInfo?.name}</h1>
                        <p className="text-gray-300">
                            Ready for import • {transactions.length} transactions • Total: <span className="text-gradient font-semibold">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </p>
                    </div>
                    <FileText className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
            </div>
            
            {/* Summary Stats - Matching AllTransactions style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <p className="text-gray-400 text-sm mb-2">File Size</p>
                    <p className="text-3xl font-bold text-gradient">{fileInfo?.sizeReadable}</p>
                </div>
                <div className="glass rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <p className="text-gray-400 text-sm mb-2">Transactions</p>
                    <p className="text-3xl font-bold text-blue-400">{transactions.length}</p>
                </div>
                <div className="glass rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <p className="text-gray-400 text-sm mb-2">Total Amount</p>
                    <p className="text-3xl font-bold text-green-400">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="glass rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <p className="text-gray-400 text-sm mb-2">Accuracy</p>
                    <p className="text-3xl font-bold text-pink-400">{Math.round(categorizerAccuracy)}%</p>
                </div>
            </div>

            {/* Accuracy Warning */}
            {categorizerAccuracy < 100 && (
                <div className="glass rounded-xl p-5 border border-yellow-500/30 bg-yellow-600/10">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-yellow-300">
                                {Math.round(categorizerAccuracy)}% Confidence - Review Recommended
                            </p>
                            <p className="text-sm text-yellow-200 mt-1">
                                Some transactions may need manual categorization. You can edit them in the table below.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Table - EXACT Match to AllTransactions */}
            <div className="glass rounded-2xl overflow-hidden border border-purple-500/20">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-purple-600/20 border-b border-purple-500/30">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === transactions.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRows(new Set(transactions.map((t, i) => i)));
                                            } else {
                                                setSelectedRows(new Set());
                                            }
                                        }}
                                        className="rounded w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Merchant</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Description</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Amount</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {transactions.map((transaction, idx) => {
                                const txId = transaction._id || `temp-${idx}`;
                                const isEditing = editingId === txId;

                                return (
                                    <tr key={txId} className="hover:bg-purple-600/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(idx)}
                                                onChange={() => toggleRow(idx)}
                                                className="rounded w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={editData.date || ''}
                                                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-700 border border-purple-500/50 rounded text-white text-sm"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Calendar className="w-4 h-4 text-purple-400 opacity-60" />
                                                    <span className="font-medium">{formatDate(transaction.date)}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editData.merchant}
                                                    onChange={(e) => setEditData({ ...editData, merchant: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-700 border border-purple-500/50 rounded text-white text-sm"
                                                />
                                            ) : (
                                                transaction.merchant || 'Unknown'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                                            {transaction.description || transaction.rawDescription || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-right">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editData.amount || ''}
                                                    onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                                                    className="w-28 px-3 py-2 bg-slate-700 border border-purple-500/50 rounded text-white text-right text-sm"
                                                />
                                            ) : (
                                                <span className={transaction.type === 'CREDIT' ? 'text-green-400' : 'text-white'}>
                                                    {transaction.type === 'CREDIT' ? '+' : ''}₹{transaction.amount ? transaction.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {isEditing ? (
                                                <select
                                                    value={editData.type || transaction.type || 'DEBIT'}
                                                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-700 border border-purple-500/50 rounded text-white text-sm"
                                                >
                                                    <option value="DEBIT">DEBIT</option>
                                                    <option value="CREDIT">CREDIT</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    transaction.type === 'CREDIT' 
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                    {transaction.type || 'DEBIT'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {isEditing ? (
                                                <select
                                                    value={editData.category || transaction.category}
                                                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-700 border border-purple-500/50 rounded text-white text-sm"
                                                >
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/30 rounded-full text-purple-200">
                                                    {getCategoryEmoji(transaction.category)} {transaction.category}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onCancel}
                    disabled={isImporting}
                    className="px-6 py-3 glass border border-purple-500/30 rounded-xl text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onImport(transactions)}
                    disabled={isImporting || transactions.length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2 shadow-lg hover:shadow-purple-500/50"
                >
                    {isImporting && <span className="animate-spin">⏳</span>}
                    Import {transactions.length} Transactions
                </button>
            </div>
        </div>
    );
}
