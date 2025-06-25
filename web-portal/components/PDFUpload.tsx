'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PDFUploadProps {
  responseId: string;
  currentPdfUrl?: string | null;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
}

export default function PDFUpload({ 
  responseId, 
  currentPdfUrl,
  onUploadComplete,
  onUploadError 
}: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please upload a PDF file');
      setUploadStatus('error');
      onUploadError?.('Please upload a PDF file');
      return;
    }

    // Validate file size (50MB limit for free tier)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setErrorMessage('File size must be less than 50MB');
      setUploadStatus('error');
      onUploadError?.('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // Create file path: response_id.pdf
      const filePath = `${responseId}.pdf`;

      // Delete existing file if present
      if (currentPdfUrl) {
        const { error: deleteError } = await supabase.storage
          .from('survey-pdfs')
          .remove([filePath]);
        
        if (deleteError && deleteError.message !== 'The resource was not found') {
          console.error('Error deleting existing file:', deleteError);
        }
      }

      // Upload new file
      const { data, error } = await supabase.storage
        .from('survey-pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('survey-pdfs')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      setUploadStatus('success');
      onUploadComplete(publicUrl);

      // Reset after success
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : 'Upload failed';
      setErrorMessage(message);
      setUploadStatus('error');
      onUploadError?.(message);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadStatus === 'idle' && (
          <>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {currentPdfUrl ? 'Replace PDF file' : 'Upload survey PDF'}
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop or click to select • PDF only • Max 50MB
            </p>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <>
            <FileText className="h-12 w-12 text-blue-500 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-medium text-gray-700 mb-2">Uploading...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </>
        )}

        {uploadStatus === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-green-700">Upload successful!</p>
          </>
        )}

        {uploadStatus === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-red-700 mb-1">Upload failed</p>
            <p className="text-xs text-red-600">{errorMessage}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUploadStatus('idle');
                setErrorMessage('');
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </>
        )}
      </div>

      {/* Current File Info */}
      {currentPdfUrl && uploadStatus === 'idle' && (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Current PDF: response_{responseId}.pdf</span>
          </div>
          <a
            href={currentPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View
          </a>
        </div>
      )}
    </div>
  );
}