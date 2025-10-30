import React from 'react';
import { useOwlVault } from '../hooks/useOwlVault';

const LandingPage: React.FC = () => {
  const { connectWallet, loading, networkError } = useOwlVault();

  const handleConnect = async () => {
    const result = await connectWallet();
    if (!result.success) {
      console.error('Connection failed:', result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🦉</div>
            <div>
              <h1 className="text-2xl font-bold text-white">OwlVault</h1>
              <p className="text-blue-300 text-sm">Secure Digital Legacy</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Secure Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"> Digital Legacy</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-blue-200 mb-8 leading-relaxed">
            Multi-signature vaults and encrypted document storage for your most important digital assets
          </p>

          <p className="text-lg text-blue-300 mb-12 max-w-2xl mx-auto">
            Protect your crypto, NFTs, and digital documents with 2-of-3 guardian approval. 
            Ensure your legacy is passed securely to your beneficiaries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-blue-500 hover:shadow-2xl hover:shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                '🚀 Launch OwlVault'
              )}
            </button>
            
            <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50">
              📖 Learn More
            </button>
          </div>

          {networkError && (
            <div className="glass rounded-xl p-4 max-w-md mx-auto border border-red-500/20 mb-8">
              <p className="text-red-400 text-sm">{networkError}</p>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="glass rounded-2xl p-6 border border-blue-500/20">
              <div className="text-3xl mb-4">🏦</div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Signature Vaults</h3>
              <p className="text-blue-300">
                Create vaults that require 2-of-3 guardian approvals to unlock, ensuring maximum security for your assets.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-blue-500/20">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-white mb-3">Encrypted Documents</h3>
              <p className="text-blue-300">
                Store important documents with end-to-end encryption and granular access controls for authorized users.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-blue-500/20">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-3">Guardian System</h3>
              <p className="text-blue-300">
                Appoint trusted guardians who can approve vault access while maintaining full decentralization.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">2/3</div>
              <div className="text-blue-300 text-sm">Approval Required</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">100%</div>
              <div className="text-blue-300 text-sm">Encrypted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">🌐</div>
              <div className="text-blue-300 text-sm">Decentralized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">🔒</div>
              <div className="text-blue-300 text-sm">Secure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-500/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-blue-300 text-sm">
            <p>Built on BlockDAG • Secure Digital Legacy • OwlVault 2.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
