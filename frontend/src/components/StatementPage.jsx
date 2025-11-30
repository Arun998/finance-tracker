import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import StatementUploader from './StatementUploader';
import TransactionPreview from './TransactionPreview';
import ImportSummary from './ImportSummary';

export default function StatementPage({ onBack, onViewExpenses }) {
    const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'success'
    const [uploadedData, setUploadedData] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState(null);
    const [importResult, setImportResult] = useState(null);

    const handleUploadSuccess = (data) => {
        setUploadedData(data);
        setStep('preview');
        setError(null);
    };

    const handleImport = async (transactions) => {
        setIsImporting(true);
        setError(null);

        try {
            const payload = {
                transactions: transactions.map(tx => ({
                    date: tx.date,
                    amount: tx.amount,
                    type: tx.type || 'DEBIT',
                    merchant: tx.merchant,
                    description: tx.description || tx.rawDescription,
                    categoryInfo: tx.categoryInfo || { category: tx.category, confidence: 0 },
                    transactionId: tx.transactionId
                }))
            };

            const response = await fetch('http://localhost:5000/api/expenses/bulk-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to import transactions');
            }

            setImportResult(data);
            setStep('success');
        } catch (error) {
            setError(error.message || 'Failed to import transactions');
        } finally {
            setIsImporting(false);
        }
    };

    const handleNewImport = () => {
        setStep('upload');
        setUploadedData(null);
        setImportResult(null);
        setError(null);
    };

    const handleCancel = () => {
        if (step === 'preview') {
            setStep('upload');
            setUploadedData(null);
        } else {
            onBack();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Header */}
            <div className="glass border-b border-purple-500/20">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={onBack}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Import Bank Statement</h1>
                            <p className="text-gray-400 mt-1">
                                Upload your PDF statement to auto-extract and categorize transactions
                            </p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-8 mt-6">
                        <div className={`flex flex-col items-center ${step === 'upload' ? '' : 'opacity-60'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                step === 'upload' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' : 'bg-green-500 text-white'
                            }`}>
                                1
                            </div>
                            <span className="text-xs font-semibold mt-2 text-gray-300">Upload</span>
                        </div>

                        <div className={`flex-1 h-0.5 ${step !== 'upload' ? 'bg-purple-600' : 'bg-slate-700'}`} />

                        <div className={`flex flex-col items-center ${['upload'].includes(step) ? 'opacity-60' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                step === 'preview' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' : step === 'success' ? 'bg-green-500 text-white' : 'bg-slate-700 text-gray-400'
                            }`}>
                                2
                            </div>
                            <span className="text-xs font-semibold mt-2 text-gray-300">Review</span>
                        </div>

                        <div className={`flex-1 h-0.5 ${step === 'success' ? 'bg-purple-600' : 'bg-slate-700'}`} />

                        <div className={`flex flex-col items-center ${step !== 'success' ? 'opacity-60' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                step === 'success' ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' : 'bg-slate-700 text-gray-400'
                            }`}>
                                ✓
                            </div>
                            <span className="text-xs font-semibold mt-2 text-gray-300">Complete</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        ❌ {error}
                    </div>
                )}

                {step === 'upload' && (
                    <StatementUploader
                        onUploadSuccess={handleUploadSuccess}
                        onError={setError}
                    />
                )}

                {step === 'preview' && uploadedData && (
                    <TransactionPreview
                        transactions={uploadedData.transactions}
                        fileInfo={uploadedData.file}
                        onImport={handleImport}
                        onCancel={handleCancel}
                        isImporting={isImporting}
                    />
                )}

                {step === 'success' && importResult && (
                    <ImportSummary
                        result={importResult}
                        onNewImport={handleNewImport}
                        onViewExpenses={onViewExpenses}
                    />
                )}
            </div>
        </div>
    );
}
