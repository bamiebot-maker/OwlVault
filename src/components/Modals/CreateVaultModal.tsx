import React, { useState } from 'react';
import { useOwlVault } from '../../hooks/useOwlVault';
import { ipfsService } from '../../services/ipfsService';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateVaultModal: React.FC<CreateVaultModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createVault } = useOwlVault();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    vaultName: '',
    vaultDescription: '',
    vaultType: 'mixed',
    guardian1: '',
    guardian2: '',
    guardian3: '',
    beneficiary: '',
  });

  const vaultTypes = [
    { id: 'crypto', label: '💰 Crypto Assets', description: 'Private keys, seed phrases, wallet access' },
    { id: 'documents', label: '📄 Important Documents', description: 'Legal documents, wills, property deeds' },
    { id: 'accounts', label: '🔑 Digital Accounts', description: 'Social media, email, cloud storage' },
    { id: 'mixed', label: '🎯 Mixed Assets', description: 'Combination of all digital assets' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
      return;
    }

    // Final submission
    setLoading(true);

    try {
      const guardians = [formData.guardian1, formData.guardian2, formData.guardian3];
      
      // Validate guardian addresses
      for (let i = 0; i < guardians.length; i++) {
        if (!guardians[i].startsWith('0x') || guardians[i].length !== 42) {
          alert(`Guardian ${i + 1} must be a valid Ethereum address`);
          setLoading(false);
          return;
        }
      }

      if (!formData.beneficiary.startsWith('0x') || formData.beneficiary.length !== 42) {
        alert('Beneficiary must be a valid Ethereum address');
        setLoading(false);
        return;
      }

      if (!formData.vaultName.trim()) {
        alert('Please enter a vault name');
        setLoading(false);
        return;
      }

      // Generate IPFS hash from vault data
      const vaultData = {
        name: formData.vaultName,
        description: formData.vaultDescription,
        type: formData.vaultType,
        createdAt: new Date().toISOString(),
        contents: getVaultContentsDescription(formData.vaultType)
      };

      // Upload vault metadata to IPFS
      const ipfsResult = await ipfsService.uploadJSON(vaultData);
      
      if (!ipfsResult.success || !ipfsResult.ipfsHash) {
        alert('Failed to upload vault metadata to IPFS');
        setLoading(false);
        return;
      }

      const result = await createVault(guardians, formData.beneficiary, ipfsResult.ipfsHash);
      
      if (result.success) {
        alert('🎉 Vault created successfully!\n\nYour digital assets are now protected by 2-of-3 guardian approval.');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          vaultName: '',
          vaultDescription: '',
          vaultType: 'mixed',
          guardian1: '',
          guardian2: '',
          guardian3: '',
          beneficiary: '',
        });
        setActiveStep(1);
      } else {
        alert(`Failed to create vault: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating vault:', error);
      alert('Error creating vault. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getVaultContentsDescription = (type: string) => {
    switch (type) {
      case 'crypto':
        return 'Cryptocurrency wallets, private keys, seed phrases, DeFi accounts';
      case 'documents':
        return 'Legal documents, wills, property deeds, insurance policies';
      case 'accounts':
        return 'Social media, email, cloud storage, domain names';
      case 'mixed':
        return 'Mixed digital assets including crypto, documents, and accounts';
      default:
        return 'Various digital assets and access credentials';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl border border-blue-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Create Digital Legacy Vault</h2>
            <p className="text-blue-300 text-sm">Step {activeStep} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === activeStep
                  ? 'bg-blue-600 text-white'
                  : step < activeStep
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {step < activeStep ? '✓' : step}
              </div>
              <div className="text-blue-300 text-xs mt-1">
                {step === 1 ? 'Vault Info' : step === 2 ? 'Guardians' : 'Review'}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Vault Information */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="glass rounded-lg p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">What are you protecting?</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {vaultTypes.map((type) => (
                    <label
                      key={type.id}
                      className={`glass rounded-lg p-3 border-2 cursor-pointer transition-all ${
                        formData.vaultType === type.id
                          ? 'border-blue-400 bg-blue-500/20'
                          : 'border-blue-500/20 hover:border-blue-400/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="vaultType"
                        value={type.id}
                        checked={formData.vaultType === type.id}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className="font-medium text-white">{type.label}</div>
                      <div className="text-blue-300 text-xs mt-1">{type.description}</div>
                    </label>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">
                      Vault Name *
                    </label>
                    <input
                      type="text"
                      name="vaultName"
                      value={formData.vaultName}
                      onChange={handleChange}
                      placeholder="e.g., Crypto Inheritance, Important Documents, Digital Accounts"
                      required
                      className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">
                      Description & Instructions
                    </label>
                    <textarea
                      name="vaultDescription"
                      value={formData.vaultDescription}
                      onChange={handleChange}
                      placeholder="Describe what this vault contains and any special instructions for your beneficiary..."
                      rows={3}
                      className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Guardians & Beneficiary */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="glass rounded-lg p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Choose Your Guardians</h3>
                <p className="text-blue-300 text-sm mb-4">
                  Select 3 trusted people. <strong>2 out of 3</strong> must approve to unlock this vault.
                </p>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((num) => (
                    <div key={num}>
                      <label className="block text-blue-300 text-sm font-medium mb-2">
                        Guardian {num} Address *
                      </label>
                      <input
                        type="text"
                        name={`guardian${num}`}
                        value={formData[`guardian${num}` as keyof typeof formData] as string}
                        onChange={handleChange}
                        placeholder="0x..."
                        required
                        className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-lg p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Beneficiary</h3>
                <p className="text-blue-300 text-sm mb-3">
                  Who should receive access to this vault when needed?
                </p>
                
                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    Beneficiary Address *
                  </label>
                  <input
                    type="text"
                    name="beneficiary"
                    value={formData.beneficiary}
                    onChange={handleChange}
                    placeholder="0x..."
                    required
                    className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Create */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="glass rounded-lg p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Review Your Vault</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Vault Type:</span>
                    <span className="text-white">{vaultTypes.find(t => t.id === formData.vaultType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Vault Name:</span>
                    <span className="text-white">{formData.vaultName}</span>
                  </div>
                  <div>
                    <span className="text-blue-300">Description:</span>
                    <p className="text-white mt-1">{formData.vaultDescription || 'No description provided'}</p>
                  </div>
                  
                  <div className="border-t border-blue-500/20 pt-3">
                    <p className="text-blue-300 mb-2">Guardians:</p>
                    {[1, 2, 3].map((num) => (
                      <p key={num} className="text-white text-sm font-mono">
                        Guardian {num}: {formData[`guardian${num}` as keyof typeof formData]}
                      </p>
                    ))}
                  </div>
                  
                  <div className="border-t border-blue-500/20 pt-3">
                    <p className="text-blue-300">Beneficiary:</p>
                    <p className="text-white text-sm font-mono">{formData.beneficiary}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-lg p-4 border border-green-500/20 bg-green-500/5">
                <h4 className="text-green-400 font-semibold mb-2">How This Works:</h4>
                <ul className="text-green-300 text-sm space-y-1">
                  <li>• Vault stores access instructions, not assets directly</li>
                  <li>• 2 out of 3 guardians must approve to unlock</li>
                  <li>• Beneficiary receives access after approval</li>
                  <li>• You can add documents and assets after creation</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex space-x-3 pt-4">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 px-4 rounded-lg font-medium transition-all duration-300 border border-blue-500/30"
              >
                Back
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20 ${
                activeStep === 1 ? 'flex-1' : 'flex-2'
              }`}
            >
              {loading ? 'Creating...' : activeStep === 3 ? '🔒 Create Secure Vault' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVaultModal;
