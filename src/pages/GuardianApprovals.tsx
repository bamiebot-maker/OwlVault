import React, { useState, useEffect } from 'react';
import { useOwlVault } from '../hooks/useOwlVault';

const GuardianApprovals: React.FC = () => {
  const { account, approveVault, getGuardianVaults } = useOwlVault();
  const [guardianVaults, setGuardianVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);

  const loadGuardianVaults = async () => {
    if (!account) return;
    
    setLoading(true);
    const result = await getGuardianVaults();
    if (result.success) {
      setGuardianVaults(result.vaults || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGuardianVaults();
  }, [account]);

  const handleApprove = async (vaultId: number) => {
    setApproving(vaultId);
    try {
      const result = await approveVault(vaultId);
      if (result.success) {
        alert('Vault approved successfully!');
        loadGuardianVaults(); // Refresh the list
      } else {
        alert(`Failed to approve vault: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving vault:', error);
      alert('Error approving vault. Check console for details.');
    } finally {
      setApproving(null);
    }
  };

  const getApprovalStatus = (vault: any) => {
    if (vault.unlocked) return { text: 'Unlocked', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
    return { text: `${vault.approvalCount}/2 Approvals`, color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' };
  };

  const hasApproved = (vault: any) => {
    // Check if current user has approved this vault
    if (!account || !vault.approvals) return false;
    return vault.approvals[account] === true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="glass rounded-2xl p-6 lg:p-8 mb-8 border border-blue-500/20">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Guardian Approvals</h1>
            <p className="text-blue-200 text-lg">
              Review and approve vault access requests as a guardian
            </p>
          </div>
        </div>

        {/* Pending Approvals */}
        {loading ? (
          <div className="glass rounded-2xl p-8 text-center border border-blue-500/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-blue-300">Loading guardian requests...</p>
          </div>
        ) : guardianVaults.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-blue-500/20">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Pending Approvals</h2>
            <p className="text-blue-300">
              You don't have any vaults waiting for your approval as a guardian.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {guardianVaults.map((vault) => {
              const status = getApprovalStatus(vault);
              const userHasApproved = hasApproved(vault);
              
              return (
                <div key={vault.id} className="glass rounded-xl p-6 border border-blue-500/20">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                      <div className="text-2xl">🏦</div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Vault #{vault.id}</h3>
                        <p className="text-blue-300 text-sm">Owned by {vault.owner}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                      {status.text}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-blue-300 text-sm mb-1">Beneficiary</p>
                      <p className="text-white font-mono text-sm truncate">{vault.beneficiary}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-sm mb-1">Your Role</p>
                      <p className="text-white text-sm">Guardian</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-blue-300 text-sm mb-2">All Guardians</p>
                    <div className="space-y-1">
                      {vault.guardians.map((guardian: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            guardian.toLowerCase() === account?.toLowerCase() 
                              ? 'bg-blue-400' 
                              : 'bg-blue-300'
                          }`}></div>
                          <p className={`text-sm font-mono truncate ${
                            guardian.toLowerCase() === account?.toLowerCase() 
                              ? 'text-blue-400 font-medium' 
                              : 'text-white'
                          }`}>
                            {guardian} {guardian.toLowerCase() === account?.toLowerCase() && '(You)'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {vault.ipfsHash && (
                    <div className="mb-4">
                      <p className="text-blue-300 text-sm mb-1">IPFS Metadata</p>
                      <p className="text-white font-mono text-xs truncate">{vault.ipfsHash}</p>
                    </div>
                  )}

                  {!vault.unlocked && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(vault.id)}
                        disabled={userHasApproved || approving === vault.id}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 border ${
                          userHasApproved
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed'
                            : approving === vault.id
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
                        }`}
                      >
                        {userHasApproved
                          ? '✓ Approved'
                          : approving === vault.id
                          ? 'Approving...'
                          : 'Approve Vault'}
                      </button>
                      
                      <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 px-4 rounded-lg font-medium transition-all duration-300 border border-blue-500/30">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuardianApprovals;
