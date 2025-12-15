import React, { useState, useRef } from 'react';

const FileDropzone = ({ onFileSelect, disabled }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndSelect(files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (disabled) return;
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndSelect(files[0]);
        }
    };

    const validateAndSelect = (file) => {
        if (file.type === 'application/pdf') {
            onFileSelect(file);
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    const handleClick = () => {
        if (!disabled) fileInputRef.current.click();
    };

    return (
        <div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
                border: `2px dashed ${isDragActive ? '#2E5C43' : '#ccc'}`,
                backgroundColor: isDragActive ? '#e8f5e9' : '#fafafa',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.6 : 1
            }}
        >
            <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileInput}
                style={{ display: 'none' }}
                disabled={disabled}
            />
            {disabled ? (
                <p style={{ color: '#666' }}>Processing...</p>
            ) : isDragActive ? (
                <p style={{ color: '#2E5C43', fontWeight: 'bold' }}>Drop the PDF here!</p>
            ) : (
                <div>
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#333' }}>
                        Drag & drop a blueprint PDF here
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        or click to select file
                    </p>
                </div>
            )}
        </div>
    );
};

export default FileDropzone;
