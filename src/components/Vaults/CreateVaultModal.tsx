import React, { useState } from 'react';
import { useOwlVault } from '../../hooks/useOwlVault';
import { uploadToIPFS, encryptFile } from '../../utils/pinata';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateVaultModal: React.FC<CreateVaultModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createVault } = useOwlVault();
  const [formData, setFormData] = useState({
    guardians: ['', '', ''],
    beneficiary: '',
    file: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleGuardianChange = (index: number, value: string) => {
    const newGuardians = [...formData.guardians];
    newGuardians[index] = value;
    setFormData({ ...formData, guardians: newGuardians });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let ipfsHash = '';
      
      // Upload file to IPFS if provided
      if (formData.file) {
        setStep(2);
        const uploadResult = await uploadToIPFS(formData.file);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }
        ipfsHash = uploadResult.ipfsHash;
      } else {
        ipfsHash = `vault-${Date.now()}`;
      }

      // Create vault
      setStep(3);
      const result = await createVault(formData.guardians, formData.beneficiary, ipfsHash);
      
      if (result.success) {
        onSuccess?.();
        onClose();
        resetForm();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Vault creation error:', error);
      alert(`Error creating vault: ${(error as Error).message}`);
    } finally {
      setLoading(false);
      setStep(1);
    }
  };

  const resetForm = () => {
    setFormData({ guardians: ['', '', ''], beneficiary: '', file: null });
    setStep(1);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  const stepLabels = ['Setup', 'Uploading', 'Creating'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Create New Vault</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mt-1">Secure your digital legacy with multi-signature protection</p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === stepNum 
                    ? 'bg-blue-600 text-white' 
                    : step > stepNum 
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step > stepNum ? '✓' : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > stepNum ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            {stepLabels[step - 1]}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Guardians */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Guardians (3 required for 2/3 multi-signature)
            </label>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Guardian ${index + 1} Ethereum Address`}
                  value={formData.guardians[index]}
                  onChange={(e) => handleGuardianChange(index, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Beneficiary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beneficiary Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={formData.beneficiary}
              onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encrypted Document (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all hover:border-blue-400">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label htmlFor="file-upload" className={`cursor-pointer ${loading ? 'opacity-50' : ''}`}>
                <div className="text-blue-500 text-4xl mb-2">📤</div>
                <p className="text-gray-600">
                  {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Files are encrypted before storage on IPFS
                </p>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Create Vault'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVaultModal;
