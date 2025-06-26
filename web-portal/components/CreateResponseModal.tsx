'use client';

import { useState, useCallback } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Plus
} from 'lucide-react';
import {
  createSingleResponse,
  createBulkResponsesFromPDFs,
  validateCreateOptions,
  validateBulkPDFs,
  CreateResponseOptions,
  CreateResponseResult,
  BulkCreateResult
} from '@/lib/response-creation';

interface CreateResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (responseIds: string[]) => void;
}

type CreationMode = 'single' | 'bulk';
type CreationStep = 'mode' | 'form' | 'upload' | 'processing' | 'results';

export default function CreateResponseModal({ isOpen, onClose, onSuccess }: CreateResponseModalProps) {
  const [mode, setMode] = useState<CreationMode>('single');
  const [step, setStep] = useState<CreationStep>('mode');
  const [isLoading, setIsLoading] = useState(false);
  
  // Single response form
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    anonymous: false,
    pdfFile: null as File | null
  });
  
  // Bulk upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  // Results
  const [creationResult, setCreationResult] = useState<CreateResponseResult | BulkCreateResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // ============================================================================
  // Modal Management
  // ============================================================================

  const resetModal = useCallback(() => {
    setMode('single');
    setStep('mode');
    setIsLoading(false);
    setFormData({ name: '', address: '', anonymous: false, pdfFile: null });
    setSelectedFiles([]);
    setCreationResult(null);
    setErrors([]);
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  // ============================================================================
  // Single Response Creation
  // ============================================================================

  const handleSingleSubmit = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      const options: CreateResponseOptions = {
        name: formData.name.trim() || undefined,
        address: formData.address.trim() || undefined,
        anonymous: formData.anonymous,
        pdfFile: formData.pdfFile || undefined
      };

      // Validate options
      const validationErrors = validateCreateOptions(options);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      // Create the response
      const result = await createSingleResponse(options);
      setCreationResult(result);

      if (result.success && result.responseId) {
        setStep('results');
        onSuccess([result.responseId]);
      } else {
        setErrors([result.error || 'Failed to create response']);
      }
    } catch (error) {
      console.error('Single response creation failed:', error);
      setErrors(['An unexpected error occurred']);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // Bulk Upload Handling
  // ============================================================================

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const { valid, invalid } = validateBulkPDFs(fileArray);
    
    if (invalid.length > 0) {
      setErrors(invalid.map(item => `${item.file.name}: ${item.error}`));
    }
    
    setSelectedFiles(prev => [...prev, ...valid]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = async () => {
    if (selectedFiles.length === 0) {
      setErrors(['Please select at least one PDF file']);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    setStep('processing');

    try {
      const result = await createBulkResponsesFromPDFs(selectedFiles);
      setCreationResult(result);
      setStep('results');
      
      if (result.successful.length > 0) {
        onSuccess(result.successful);
      }
    } catch (error) {
      console.error('Bulk creation failed:', error);
      setErrors(['An unexpected error occurred during bulk creation']);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderModeSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Response</h3>
        <p className="text-sm text-gray-600 mb-6">Choose how you'd like to create new survey responses</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Single Response */}
        <button
          onClick={() => { setMode('single'); setStep('form'); }}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Single Response</h4>
              <p className="text-sm text-gray-600">Create one response manually</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Create a blank response with optional PDF upload. Perfect for individual data entry.
          </p>
        </button>

        {/* Bulk Upload */}
        <button
          onClick={() => { setMode('bulk'); setStep('upload'); }}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">Bulk Upload</h4>
              <p className="text-sm text-gray-600">Upload multiple PDFs</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Upload multiple PDF files to create several blank responses at once.
          </p>
        </button>
      </div>
    </div>
  );

  const renderSingleForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Create Single Response</h3>
        <p className="text-sm text-gray-600">Fill in the basic information for the new response</p>
      </div>

      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Respondent Name (Optional)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter respondent name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Address Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Address (Optional)
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter property address..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Anonymous Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.anonymous}
            onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
            Mark as anonymous response
          </label>
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Survey PDF (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500">Upload a PDF file</span>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData(prev => ({ ...prev, pdfFile: file }));
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
              </div>
              {formData.pdfFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded border text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">{formData.pdfFile.name}</span>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, pdfFile: null }))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => setStep('mode')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        <button
          onClick={handleSingleSubmit}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Create Response</span>
        </button>
      </div>
    </div>
  );

  const renderBulkUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk PDF Upload</h3>
        <p className="text-sm text-gray-600">Upload multiple PDF files to create responses</p>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload className="mx-auto h-16 w-16 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="bulk-upload" className="cursor-pointer">
            <span className="text-lg text-blue-600 hover:text-blue-500 font-medium">
              Choose PDF files
            </span>
            <input
              id="bulk-upload"
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </label>
          <p className="text-gray-500 mt-2">or drag and drop PDF files here</p>
          <p className="text-sm text-gray-400 mt-1">Each PDF will create a new blank response</p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800">File validation errors:</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => setStep('mode')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        <button
          onClick={handleBulkSubmit}
          disabled={selectedFiles.length === 0 || isLoading}
          className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Create {selectedFiles.length} Response{selectedFiles.length !== 1 ? 's' : ''}</span>
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-8">
      <Loader2 className="w-16 h-16 animate-spin mx-auto text-blue-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Creating Responses...</h3>
      <p className="text-gray-600">Please wait while we process your {mode === 'bulk' ? 'files' : 'request'}</p>
    </div>
  );

  const renderResults = () => {
    if (!creationResult) return null;

    const isBulk = 'totalProcessed' in creationResult;
    const isSuccess = creationResult.success;

    return (
      <div className="text-center space-y-6">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
          isSuccess ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isSuccess ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-600" />
          )}
        </div>

        <div>
          {isBulk ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bulk Creation {isSuccess ? 'Completed' : 'Completed with Errors'}
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">Processed {creationResult.totalProcessed} files</p>
                {creationResult.successful.length > 0 && (
                  <p className="text-green-600">✓ {creationResult.successful.length} responses created successfully</p>
                )}
                {creationResult.failed.length > 0 && (
                  <p className="text-red-600">✗ {creationResult.failed.length} files failed</p>
                )}
              </div>
              
              {creationResult.successful.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Successfully Created:</h4>
                  <div className="text-sm text-green-700">
                    Response IDs: {creationResult.successful.join(', ')}
                  </div>
                </div>
              )}
              
              {creationResult.failed.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Failed:</h4>
                  <div className="text-sm text-red-700 space-y-1">
                    {creationResult.failed.map((failure, index) => (
                      <div key={index}>{failure.filename}: {failure.error}</div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Response {isSuccess ? 'Created Successfully' : 'Creation Failed'}
              </h3>
              {isSuccess && creationResult.responseId ? (
                <p className="text-green-600">Response ID: {creationResult.responseId}</p>
              ) : (
                <p className="text-red-600">{creationResult.error}</p>
              )}
            </>
          )}
        </div>

        <button
          onClick={handleClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Plus className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Create New Response</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div>
            {step === 'mode' && renderModeSelection()}
            {step === 'form' && renderSingleForm()}
            {step === 'upload' && renderBulkUpload()}
            {step === 'processing' && renderProcessing()}
            {step === 'results' && renderResults()}
          </div>
        </div>
      </div>
    </div>
  );
}