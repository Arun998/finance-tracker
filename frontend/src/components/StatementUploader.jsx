import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import API_URL from '../config';

export default function StatementUploader({ onUploadSuccess, onError }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files?.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = async (file) => {
        // Validate file type
        if (file.type !== 'application/pdf') {
            onError('Please upload a PDF file');
            setUploadStatus({ type: 'error', message: 'Invalid file type. Only PDF files are supported.' });
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            onError('File size exceeds 10MB limit');
            setUploadStatus({ type: 'error', message: 'File size exceeds 10MB limit.' });
            return;
        }

        setIsLoading(true);
        setUploadStatus({ type: 'loading', message: 'Processing your bank statement...' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/api/expenses/parse-statement', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to process statement');
            }

            setUploadStatus({ 
                type: 'success', 
                message: `Successfully extracted ${data.data.stats.total} transactions` 
            });

            // Call parent callback with the parsed data
            onUploadSuccess(data.data);
        } catch (error) {
            const errorMsg = error.message || 'Failed to process the PDF file';
            setUploadStatus({ type: 'error', message: errorMsg });
            onError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    disabled={isLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-3">
                    {isLoading ? (
                        <Loader className="w-12 h-12 text-purple-500 animate-spin" />
                    ) : (
                        <Upload className="w-12 h-12 text-gray-400" />
                    )}
                    <div>
                        <p className="font-semibold text-white">
                            {isLoading ? 'Processing...' : 'Drop your bank statement here'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            or click to select a PDF file (max 10MB)
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {uploadStatus && (
                <div
                    className={`p-4 rounded-lg flex items-start gap-3 ${
                        uploadStatus.type === 'error'
                            ? 'bg-red-900/20 border border-red-500/30'
                            : uploadStatus.type === 'success'
                            ? 'bg-green-900/20 border border-green-500/30'
                            : 'bg-blue-900/20 border border-blue-500/30'
                    }`}
                >
                    {uploadStatus.type === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    {uploadStatus.type === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    )}
                    {uploadStatus.type === 'loading' && (
                        <Loader className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />
                    )}
                    <span
                        className={
                            uploadStatus.type === 'error'
                                ? 'text-red-200'
                                : uploadStatus.type === 'success'
                                ? 'text-green-200'
                                : 'text-blue-200'
                        }
                    >
                        {uploadStatus.message}
                    </span>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                    📄 <strong>Supported formats:</strong> PDF statements from most Indian banks
                </p>
                <p className="text-sm text-blue-300 mt-2">
                    💡 The system will extract transactions and automatically categorize them.
                </p>
            </div>
        </div>
    );
}
