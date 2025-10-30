import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Vaults from './pages/Vaults';
import Documents from './pages/Documents';
import GuardianApprovals from './pages/GuardianApprovals';
import LandingPage from './pages/LandingPage';
import { useOwlVault } from './hooks/useOwlVault';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { account, disconnectWallet, isDisconnected } = useOwlVault();

  // Show landing page if not connected OR manually disconnected
  if (!account || isDisconnected) {
    return <LandingPage />;
  }

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]">
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content - Remove extra margin/padding causing the gap */}
        <div className="flex-1 min-h-screen">
          {/* Header - Only show on desktop */}
          <header className="glass border-b border-blue-500/20 hidden lg:block">
            <div className="flex justify-between items-center px-8 py-4">
              <div>
                <h1 className="text-2xl font-bold text-white capitalize">
                  {activeTab.replace('-', ' ')}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500/20 text-white px-4 py-2 rounded-full text-sm font-medium border border-blue-400/30">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </header>

          {/* Page Content - Remove extra padding that causes gap */}
          <main className="min-h-screen">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'vaults' && <Vaults />}
            {activeTab === 'documents' && <Documents />}
            {activeTab === 'guardian' && <GuardianApprovals />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
