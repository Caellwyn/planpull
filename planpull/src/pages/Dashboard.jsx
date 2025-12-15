import React, { useState } from 'react';
import FileDropzone from '../components/dashboard/FileDropzone';
import { extractPdf } from '../services/api';

const Dashboard = () => {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = async (file) => {
        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const data = await extractPdf(file);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Failed to extract PDF. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1.5rem', color: '#333' }}>Dashboard</h1>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h3 style={{ marginBottom: '1rem', color: '#2E5C43' }}>New Extraction</h3>
                <FileDropzone onFileSelect={handleFileSelect} disabled={uploading} />

                {error && (
                    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}

                {result && (
                    <div style={{ marginTop: '30px', textAlign: 'left' }}>
                        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Extraction Results</h3>
                        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflowX: 'auto', maxHeight: '500px' }}>
                            <pre style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
