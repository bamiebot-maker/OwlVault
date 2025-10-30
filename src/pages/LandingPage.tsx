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
          </div>

          {networkError && (
            <div className="glass rounded-xl p-4 max-w-md mx-auto border border-red-500/20 mb-8">
              <p className="text-red-400 text-sm">{networkError}</p>
            </div>
          )}
        </div>

        {/* Why OwlVault Section */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="glass rounded-2xl p-8 lg:p-12 border border-blue-500/20">
            <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-12">
              Why <span className="text-blue-400">OwlVault</span>?
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🦉</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">The Wisdom of Owls</h3>
                    <p className="text-blue-300">
                      Like owls who protect their territory with vigilance, OwlVault safeguards your digital legacy 
                      with intelligent multi-signature protection and encrypted storage.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🌙</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Night Watch Security</h3>
                    <p className="text-blue-300">
                      Operating with the stealth and precision of an owl's night hunt, your assets remain protected 
                      until the right conditions are met for access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🏛️</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Ancient Wisdom, Modern Tech</h3>
                    <p className="text-blue-300">
                      Combining the ancient symbolism of owls as guardians of knowledge with cutting-edge 
                      blockchain technology for unprecedented digital security.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🔒</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Deep Blue Protection</h3>
                    <p className="text-blue-300">
                      Our deep blue interface represents the night sky where owls thrive - a constant reminder 
                      of the secure, watchful protection surrounding your digital assets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How OwlVault Protects Your Legacy</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-2xl p-6 border border-blue-500/20 text-center">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold text-white mb-3">Create Your Vault</h3>
              <p className="text-blue-300">
                Set up a multi-signature vault with 3 trusted guardians. Choose what digital assets to protect.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-blue-500/20 text-center">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold text-white mb-3">Store Encrypted Assets</h3>
              <p className="text-blue-300">
                Upload important documents, wallet keys, and access credentials with end-to-end encryption.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border border-blue-500/20 text-center">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Access Control</h3>
              <p className="text-blue-300">
                2 out of 3 guardians must approve for beneficiaries to access the vault. Maximum security.
              </p>
            </div>
          </div>
        </div>

        {/* Problem & Solution */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass rounded-2xl p-8 border border-red-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">🚨 The Problem</h3>
              <ul className="text-blue-300 space-y-3">
                <li>• $140B+ in crypto assets lost due to inaccessible wallets</li>
                <li>• Digital documents and accounts lost forever</li>
                <li>• No secure way to pass digital inheritance</li>
                <li>• Single points of failure in traditional storage</li>
                <li>• Complex legal processes for digital asset transfer</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-8 border border-green-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">✅ OwlVault Solution</h3>
              <ul className="text-blue-300 space-y-3">
                <li>• 2-of-3 multi-signature protection eliminates single points of failure</li>
                <li>• Encrypted IPFS storage ensures data permanence</li>
                <li>• Blockchain-based access control for transparency</li>
                <li>• Guardian system with trusted individuals</li>
                <li>• Simple, intuitive interface for complex security</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Color Philosophy */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="glass rounded-2xl p-8 border border-blue-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">🎨 Our Color Philosophy</h3>
            <p className="text-blue-300 text-lg mb-4">
              The deep blue theme represents the <span className="text-white">night sky</span> where owls watch over their domain - 
              a constant reminder of the secure, vigilant protection surrounding your digital legacy.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#0a0a1a] border border-blue-500/30"></div>
                <span className="text-blue-300 text-sm">Security Depth</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#1a1a2e] border border-blue-500/30"></div>
                <span className="text-blue-300 text-sm">Digital Night</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border border-blue-400"></div>
                <span className="text-blue-300 text-sm">Trust & Wisdom</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center">
          <div>
            <div className="text-2xl font-bold text-white mb-1">2/3</div>
            <div className="text-blue-300 text-sm">Guardian Approval</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">🔒</div>
            <div className="text-blue-300 text-sm">End-to-End Encrypted</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">🌐</div>
            <div className="text-blue-300 text-sm">Decentralized</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">🦉</div>
            <div className="text-blue-300 text-sm">Owl Protected</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-500/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-blue-300 text-sm">
            <p>Built on BlockDAG • Secure Digital Legacy • OwlVault 2.0</p>
            <p className="mt-2">Wisdom of Owls, Security of Blockchain</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
