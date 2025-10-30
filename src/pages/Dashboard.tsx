import React, { useState } from 'react';
import { useOwlVault } from '../hooks/useOwlVault';
import CreateVaultModal from '../components/Modals/CreateVaultModal';
import UploadDocumentModal from '../components/Modals/UploadDocumentModal';

const Dashboard: React.FC = () => {
  const { account, getMyVaults, getMyDocuments } = useOwlVault();
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [userVaults, setUserVaults] = useState<any[]>([]);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);

  const loadUserData = async () => {
    const vaultsResult = await getMyVaults();
    const docsResult = await getMyDocuments();
    
    if (vaultsResult.success) setUserVaults(vaultsResult.vaults || []);
    if (docsResult.success) setUserDocuments(docsResult.documents || []);
  };

  React.useEffect(() => {
    if (account) {
      loadUserData();
    }
  }, [account]);

  const handleCreateVault = () => {
    setShowVaultModal(true);
  };

  const handleUploadDocument = () => {
    setShowDocumentModal(true);
  };

  const handleAddGuardian = () => {
    alert('Guardian management will be available in Vaults section');
  };

  const handleSettings = () => {
    alert('Settings page coming soon');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]">
      {/* Remove container padding and use direct padding */}
      <div className="p-4 lg:p-6">
        {/* Welcome Section */}
        <div className="glass rounded-2xl p-6 lg:p-8 mb-6 border border-blue-500/20">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Welcome to OwlVault
              </h1>
              <p className="text-blue-200 text-lg">
                Secure your digital legacy with multi-signature protection
              </p>
            </div>
            <div className="bg-blue-500/20 rounded-full px-4 py-2 border border-blue-400/30">
              <p className="text-white font-mono text-sm">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Total Vaults */}
          <div className="glass rounded-xl p-4 lg:p-6 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Total Vaults</p>
                <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{userVaults.length}</p>
              </div>
              <div className="text-2xl">🏦</div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="glass rounded-xl p-4 lg:p-6 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Pending Approvals</p>
                <p className="text-2xl lg:text-3xl font-bold text-white mt-1">
                  {userVaults.filter(v => !v.unlocked).length}
                </p>
              </div>
              <div className="text-2xl">🛡️</div>
            </div>
          </div>

          {/* Documents */}
          <div className="glass rounded-xl p-4 lg:p-6 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Documents</p>
                <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{userDocuments.length}</p>
              </div>
              <div className="text-2xl">📄</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6 lg:p-8 border border-blue-500/20 mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={handleCreateVault}
              className="glass hover:bg-blue-500/20 rounded-lg p-4 text-center transition-all duration-300 border border-blue-500/20 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="text-3xl mb-2">➕</div>
              <p className="text-white font-medium">Create Vault</p>
            </button>
            
            <button 
              onClick={handleUploadDocument}
              className="glass hover:bg-blue-500/20 rounded-lg p-4 text-center transition-all duration-300 border border-blue-500/20 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="text-3xl mb-2">📤</div>
              <p className="text-white font-medium">Upload Document</p>
            </button>
            
            <button 
              onClick={handleAddGuardian}
              className="glass hover:bg-blue-500/20 rounded-lg p-4 text-center transition-all duration-300 border border-blue-500/20 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="text-3xl mb-2">👥</div>
              <p className="text-white font-medium">Add Guardian</p>
            </button>
            
            <button 
              onClick={handleSettings}
              className="glass hover:bg-blue-500/20 rounded-lg p-4 text-center transition-all duration-300 border border-blue-500/20 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="text-3xl mb-2">⚙️</div>
              <p className="text-white font-medium">Settings</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6 lg:p-8 border border-blue-500/20">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {userVaults.length === 0 && userDocuments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🦉</div>
                <p className="text-blue-300">No activity yet. Create your first vault or upload a document to get started.</p>
              </div>
            ) : (
              <>
                {userVaults.slice(0, 3).map((vault) => (
                  <div key={vault.id} className="glass rounded-lg p-4 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">🏦</div>
                        <div>
                          <p className="text-white font-medium">Vault #{vault.id}</p>
                          <p className="text-blue-300 text-sm">
                            {vault.unlocked ? 'Unlocked' : `${vault.approvalCount}/2 Approvals`}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vault.unlocked 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {vault.unlocked ? 'Active' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateVaultModal 
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
        onSuccess={loadUserData}
      />
      
      <UploadDocumentModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onSuccess={loadUserData}
      />
    </div>
  );
};

export default Dashboard;
