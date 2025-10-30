import React, { useState } from 'react';
import { useOwlVault } from '../../hooks/useOwlVault';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateVaultModal: React.FC<CreateVaultModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createVault } = useOwlVault();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vaultName: '',
    vaultDescription: '',
    guardian1: '',
    guardian2: '',
    guardian3: '',
    beneficiary: '',
    ipfsHash: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Generate IPFS hash from vault data (in real app, this would upload to IPFS)
      const vaultMetadata = {
        name: formData.vaultName,
        description: formData.vaultDescription,
        createdAt: new Date().toISOString(),
        type: 'multi-sig-vault'
      };
      const ipfsHash = 'QmVault' + Math.random().toString(36).substring(2, 15);

      const result = await createVault(guardians, formData.beneficiary, ipfsHash);
      
      if (result.success) {
        alert('Vault created successfully!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          vaultName: '',
          vaultDescription: '',
          guardian1: '',
          guardian2: '',
          guardian3: '',
          beneficiary: '',
          ipfsHash: ''
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl border border-blue-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Vault</h2>
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
          {/* Vault Information */}
          <div className="glass rounded-lg p-4 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">Vault Information</h3>
            
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
                  placeholder="My Inheritance Vault"
                  required
                  className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="vaultDescription"
                  value={formData.vaultDescription}
                  onChange={handleChange}
                  placeholder="Describe what this vault contains (assets, documents, etc.)"
                  rows={3}
                  className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Guardians Section */}
          <div className="glass rounded-lg p-4 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">Guardians (2-of-3 Required)</h3>
            <p className="text-blue-300 text-sm mb-3">
              Add 3 trusted guardians who can approve vault access
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">
                  Guardian 1 Address *
                </label>
                <input
                  type="text"
                  name="guardian1"
                  value={formData.guardian1}
                  onChange={handleChange}
                  placeholder="0x..."
                  required
                  className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">
                  Guardian 2 Address *
                </label>
                <input
                  type="text"
                  name="guardian2"
                  value={formData.guardian2}
                  onChange={handleChange}
                  placeholder="0x..."
                  required
                  className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">
                  Guardian 3 Address *
                </label>
                <input
                  type="text"
                  name="guardian3"
                  value={formData.guardian3}
                  onChange={handleChange}
                  placeholder="0x..."
                  required
                  className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Beneficiary Section */}
          <div className="glass rounded-lg p-4 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">Beneficiary</h3>
            
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
              <p className="text-blue-300 text-xs mt-1">
                This address will receive access to the vault after 2 guardian approvals
              </p>
            </div>
          </div>

          {/* Vault Assets Preview */}
          <div className="glass rounded-lg p-4 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">Vault Contents</h3>
            <div className="space-y-2">
              <p className="text-blue-300 text-sm">
                This vault will securely store:
              </p>
              <ul className="text-blue-300 text-sm list-disc list-inside space-y-1">
                <li>Digital assets metadata</li>
                <li>Encrypted document references</li>
                <li>Access control information</li>
                <li>Guardian approval status</li>
              </ul>
              <p className="text-blue-300 text-xs mt-2">
                You can add specific documents and assets after creating the vault.
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20"
            >
              {loading ? 'Creating Vault...' : 'Create Secure Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVaultModal;
