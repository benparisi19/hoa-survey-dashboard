'use client';

import { useState, useEffect } from 'react';
import { FileText, X, Maximize2, Minimize2, Download } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string | null;
  responseId: string;
  isVisible: boolean;
  onToggle: () => void;
  height?: string;
  onFileUpload?: (file: File) => void;
  isEditing?: boolean;
}

export default function PDFViewer({ 
  pdfUrl, 
  responseId, 
  isVisible, 
  onToggle,
  height = 'h-[800px]',
  onFileUpload,
  isEditing = false
}: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Reset error state when URL changes
  useEffect(() => {
    setLoadError(false);
  }, [pdfUrl]);

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditing || !onFileUpload) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditing || !onFileUpload) return;
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    if (pdfFile) {
      onFileUpload(pdfFile);
    }
  };

  if (!pdfUrl) {
    return (
      <div 
        className={`${height} rounded-lg border-2 flex items-center justify-center transition-all ${
          isEditing && onFileUpload
            ? `border-dashed cursor-pointer ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }`
            : 'border-gray-200 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-2">
          <FileText className={`h-12 w-12 mx-auto ${
            isEditing && onFileUpload ? 'text-gray-400' : 'text-gray-300'
          }`} />
          <p className="text-gray-500">No PDF uploaded for this response</p>
          <p className="text-sm text-gray-400">
            {isEditing && onFileUpload 
              ? 'Drag and drop a PDF here to upload' 
              : 'Upload a PDF to view it here'
            }
          </p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
      {/* Header Controls */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Survey PDF - Response {responseId}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          {!isFullscreen && (
            <button
              onClick={onToggle}
              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
              title="Hide PDF viewer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Display */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-48px)]' : height} bg-gray-50`}>
        {loadError ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 text-red-300 mx-auto" />
              <p className="text-red-600">Failed to load PDF</p>
              <button
                onClick={() => setLoadError(false)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={`PDF for response ${responseId}`}
            onError={() => setLoadError(true)}
          >
            <p>Your browser does not support PDFs. 
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                Download the PDF
              </a> to view it.
            </p>
          </iframe>
        )}
      </div>
    </div>
  );
}