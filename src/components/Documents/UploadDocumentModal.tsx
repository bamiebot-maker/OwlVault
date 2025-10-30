import React, { useState } from 'react';
import { useOwlVault } from '../../hooks/useOwlVault';
import { uploadToIPFS } from '../../utils/pinata';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createDocument } = useOwlVault();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      // Upload to IPFS
      const uploadResult = await uploadToIPFS(file);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Create document on blockchain
      const result = await createDocument(uploadResult.ipfsHash);
      
      if (result.success) {
        onSuccess?.();
        onClose();
        setFile(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Document upload error:', error);
      alert(`Error uploading document: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFile(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Upload Document</h2>
          <p className="text-gray-600 mt-1">Store encrypted documents securely on IPFS</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Document
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all hover:border-blue-400">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="doc-upload"
                disabled={loading}
              />
              <label htmlFor="doc-upload" className={`cursor-pointer ${loading ? 'opacity-50' : ''}`}>
                <div className="text-blue-500 text-4xl mb-2">📄</div>
                <p className="text-gray-600">
                  {file ? file.name : 'Click to select a document'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Document will be encrypted and stored on IPFS
                </p>
              </label>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Security Features</h3>
            <ul className="text-blue-600 text-sm space-y-1">
              <li>• End-to-end encryption</li>
              <li>• IPFS decentralized storage</li>
              <li>• Blockchain access control</li>
              <li>• Permanent, tamper-proof record</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="btn-primary disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
