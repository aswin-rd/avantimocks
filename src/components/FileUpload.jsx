import React, { useCallback, useState } from 'react';

// Standard event handlers are fine for now to avoid another install, or I can use a simple hidden input.
// Actually, creating a nice drag/drop without library is easy.
import { Upload, CheckCircle } from 'lucide-react';


const FileUpload = ({ onUpload }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));

        if (files.length > 0) {
            setUploadedFiles(prev => [...prev, ...files]);
            onUpload(files); // In a real app we might debounce this
        }
    }, [onUpload]);

    const handleChange = (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(prev => [...prev, ...files]);
        onUpload(files);
    };

    return (
        <div className="w-full">
            <div
                id="drop-zone"
                className={isDragOver ? 'dragover' : ''}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('hidden-input').click()}
            >
                <div className="icon-circle">
                    <Upload size={30} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Upload Result Sheets</h3>
                <p className="text-gray-400 mb-2">Drag & drop .xlsx files here</p>
                <p className="text-xs text-gray-500">(Upload multiple for trend analysis)</p>
                <input
                    id="hidden-input"
                    type="file"
                    multiple
                    accept=".xlsx, .xls"
                    hidden
                    onChange={handleChange}
                />
            </div>

            {/* Simple File List */}
            <div className="mt-4 space-y-2">
                {uploadedFiles.map((f, i) => (
                    <div key={i} className="file-item">
                        <span className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle size={14} className="text-green-400" /> {f.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileUpload;
