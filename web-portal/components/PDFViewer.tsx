'use client';

import { useState, useEffect } from 'react';
import { FileText, X, Maximize2, Minimize2, Download } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string | null;
  responseId: string;
  isVisible: boolean;
  onToggle: () => void;
  height?: string;
}

export default function PDFViewer({ 
  pdfUrl, 
  responseId, 
  isVisible, 
  onToggle,
  height = 'h-[800px]' 
}: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Reset error state when URL changes
  useEffect(() => {
    setLoadError(false);
  }, [pdfUrl]);

  if (!pdfUrl) {
    return (
      <div className={`${height} bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center`}>
        <div className="text-center space-y-2">
          <FileText className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="text-gray-500">No PDF uploaded for this response</p>
          <p className="text-sm text-gray-400">Upload a PDF to view it here</p>
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