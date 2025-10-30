import React, { useState, useEffect } from 'react';
import { useOwlVault } from '../hooks/useOwlVault';
import CreateVaultModal from '../components/Modals/CreateVaultModal';

const Vaults: React.FC = () => {
  const { account, getMyVaults } = useOwlVault();
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadVaults = async () => {
    if (!account) return;
    
    setLoading(true);
    const result = await getMyVaults();
    if (result.success) {
      setVaults(result.vaults || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVaults();
  }, [account]);

  const getStatusColor = (vault: any) => {
    if (vault.unlocked) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (vault.approvalCount === 0) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  };

  const getStatusText = (vault: any) => {
    if (vault.unlocked) return 'Unlocked';
    return `${vault.approvalCount}/2 Approvals`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="glass rounded-2xl p-6 lg:p-8 mb-8 border border-blue-500/20">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">My Vaults</h1>
              <p className="text-blue-200 text-lg">
                Manage your multi-signature vaults and view approval status
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 border border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
            >
              Create New Vault
            </button>
          </div>
        </div>

        {/* Vaults Grid */}
        {loading ? (
          <div className="glass rounded-2xl p-8 text-center border border-blue-500/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-blue-300">Loading your vaults...</p>
          </div>
        ) : vaults.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-blue-500/20">
            <div className="text-6xl mb-4">🏦</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Vaults Yet</h2>
            <p className="text-blue-300 mb-6">
              Create your first multi-signature vault to secure your digital legacy
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 border border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
            >
              Create Your First Vault
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {vaults.map((vault) => (
              <div key={vault.id} className="glass rounded-xl p-6 border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🏦</div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Vault #{vault.id}</h3>
                      <p className="text-blue-300 text-sm">Created by you</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vault)}`}>
                    {getStatusText(vault)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-blue-300 text-sm">Beneficiary</p>
                    <p className="text-white font-mono text-sm truncate">{vault.beneficiary}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Guardians</p>
                    <div className="space-y-1">
                      {vault.guardians.map((guardian: string, index: number) => (
                        <p key={index} className="text-white font-mono text-xs truncate">
                          {guardian}
                        </p>
                      ))}
                    </div>
                  </div>
                  {vault.ipfsHash && (
                    <div>
                      <p className="text-blue-300 text-sm">IPFS Hash</p>
                      <p className="text-white font-mono text-xs truncate">{vault.ipfsHash}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 border border-blue-500/30">
                    View Details
                  </button>
                  {!vault.unlocked && (
                    <button className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 border border-yellow-500/30">
                      Check Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateVaultModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadVaults}
      />
    </div>
  );
};

export default Vaults;
