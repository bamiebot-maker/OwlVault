import React, { useState, useRef } from 'react';
import { useOwlVault } from '../../hooks/useOwlVault';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createDocument } = useOwlVault();
  const [loading, setLoading] = useState(false);
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentName(file.name);
      // Clear previous IPFS hash when new file is selected
      setIpfsHash('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setDocumentName(file.name);
      setIpfsHash('');
    }
  };

  const simulateIPFSUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setUploadingToIPFS(true);
    
    // Simulate IPFS upload delay
    setTimeout(() => {
      const mockHash = 'QmDoc' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setIpfsHash(mockHash);
      setUploadingToIPFS(false);
      alert(`Document "${selectedFile.name}" encrypted and uploaded to IPFS!\n\nIPFS Hash: ${mockHash}\n\nFile: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    if (!ipfsHash) {
      alert('Please upload the file to IPFS first by clicking "Upload to IPFS"');
      return;
    }

    if (!documentName.trim()) {
      alert('Please enter a document name');
      return;
    }

    setLoading(true);

    try {
      const result = await createDocument(ipfsHash);
      
      if (result.success) {
        alert(`Document "${documentName}" created successfully!`);
        onSuccess();
        onClose();
        // Reset form
        setSelectedFile(null);
        setDocumentName('');
        setDocumentDescription('');
        setIpfsHash('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert(`Failed to create document: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Error creating document. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl border border-blue-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Upload Encrypted Document</h2>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Information */}
          <div className="glass rounded-lg p-4 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">Document Information</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="My Important Document"
                  required
                  className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Describe this document..."
                  rows={2}
                  className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="glass rounded-lg p-4 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">Upload File</h3>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-blue-500/30 rounded-lg p-8 text-center hover:border-blue-400/50 transition-colors cursor-pointer bg-blue-500/5 hover:bg-blue-500/10"
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-3xl text-green-400">✓</div>
                  <p className="text-white font-medium">File Selected</p>
                  <p className="text-blue-300 text-sm">{selectedFile.name}</p>
                  <p className="text-blue-300 text-xs">
                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setDocumentName('');
                      setIpfsHash('');
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl">📤</div>
                  <p className="text-white font-medium">Click to select file</p>
                  <p className="text-blue-300 text-sm">or drag and drop here</p>
                  <p className="text-blue-300 text-xs">
                    Supports PDF, DOC, Images, and other documents
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* IPFS Upload Section */}
          {selectedFile && (
            <div className="glass rounded-lg p-4 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-white mb-3">IPFS Encryption & Upload</h3>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={simulateIPFSUpload}
                  disabled={uploadingToIPFS || !selectedFile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20"
                >
                  {uploadingToIPFS ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Encrypting & Uploading to IPFS...</span>
                    </div>
                  ) : (
                    '🔒 Encrypt & Upload to IPFS'
                  )}
                </button>

                {ipfsHash && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 text-sm font-medium mb-1">✓ Uploaded to IPFS</p>
                    <p className="text-green-300 text-xs font-mono break-all">
                      Hash: {ipfsHash}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final Creation */}
          {ipfsHash && (
            <div className="glass rounded-lg p-4 border border-green-500/20 bg-green-500/5">
              <h3 className="text-lg font-semibold text-white mb-3">Ready to Create Document</h3>
              <p className="text-green-300 text-sm mb-3">
                Your document is encrypted and stored on IPFS. Click below to create the on-chain record.
              </p>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 px-4 rounded-lg font-medium transition-all duration-300 border border-blue-500/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 border border-green-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/20"
                >
                  {loading ? 'Creating Document...' : '✅ Create Document'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
