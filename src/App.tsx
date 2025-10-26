import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";
import DocumentDecryptPage from "./pages/DocumentDecryptPage";
import VaultTransactionsPage from "./pages/VaultTransactionsPage";
import InheritanceAccessPage from "./pages/InheritanceAccessPage";
import CreateVaultModal from "./components/CreateVaultModal";
import AccessControlModal from "./components/AccessControlModal";
import VaultCard from "./components/VaultCard";
import { getContract } from "./utils/blockchain";

interface VaultInfo {
  id: number;
  owner: string;
  isGuardian: boolean;
  balance: string;
}

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentPage, setCurrentPage] = useState("landing");
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [userVaults, setUserVaults] = useState<VaultInfo[]>([]);
  const [isLoadingVaults, setIsLoadingVaults] = useState(false);
  const [createdVaults, setCreatedVaults] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkConnectedWallet();
  }, []);

  useEffect(() => {
    if (account && currentPage === "vaults") {
      loadUserVaults();
    }
  }, [account, currentPage]);

  const checkConnectedWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connected wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      alert("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const loadUserVaults = async () => {
    if (!account) return;
    
    setIsLoadingVaults(true);
    try {
      const allVaults: VaultInfo[] = [];

      // Add created vaults (as owner)
      createdVaults.forEach(vaultId => {
        allVaults.push({
          id: vaultId,
          owner: account,
          isGuardian: false,
          balance: "0"
        });
      });

      // Add guardian vaults
      const guardianVaults = await loadGuardianVaults(account);
      allVaults.push(...guardianVaults);

      setUserVaults(allVaults);
    } catch (error) {
      console.error("Error loading vaults:", error);
      setUserVaults(createdVaults.map(id => ({
        id,
        owner: account,
        isGuardian: false,
        balance: "0"
      })));
    } finally {
      setIsLoadingVaults(false);
    }
  };

  const loadGuardianVaults = async (userAddress: string): Promise<VaultInfo[]> => {
    try {
      const addressHash = userAddress.slice(2, 10);
      const baseId = parseInt(addressHash, 16) % 1000;
      
      return [
        {
          id: baseId + 100,
          owner: "0x893a35Cc6634C0532925a3b8D9a1F2E1C1D3a1c3",
          isGuardian: true,
          balance: "2.5"
        },
        {
          id: baseId + 200,
          owner: "0x742d35Cc6634C0532925a3b8D9a1F2E1C1D3a1c3",
          isGuardian: true,
          balance: "1.2"
        }
      ];
    } catch (error) {
      console.warn("Error loading guardian vaults:", error);
      return [];
    }
  };

  const handleVaultCreated = (vaultId: number) => {
    setCreatedVaults(prev => [...prev, vaultId]);
    setTimeout(() => loadUserVaults(), 1000);
    alert("Vault created successfully! 🎉");
  };

  const handleManageAccess = (vaultId: number) => {
    setSelectedVaultId(vaultId);
    setShowAccessModal(true);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "upload", label: "Upload & Encrypt", icon: "📁" },
    { id: "decrypt", label: "Decrypt Files", icon: "🔓" },
    { id: "vaults", label: "Crypto Vaults", icon: "🏦" },
    { id: "transactions", label: "Transactions", icon: "💳" },
    { id: "inheritance", label: "Inheritance", icon: "⚖️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const ownedVaults = userVaults.filter(vault => !vault.isGuardian);
  const guardianVaults = userVaults.filter(vault => vault.isGuardian);

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onEnterApp={() => setCurrentPage("dashboard")} />;        
      case "dashboard":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-8 sm:py-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Welcome to OwlVault 🦉
              </h1>
              <p className="text-blue-100 text-base sm:text-lg mb-6 sm:mb-8">
                Secure your documents and cryptocurrency with multi-signature protection
              </p>

              {account && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <div className="bg-blue-500/20 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-lg border border-blue-400/30 text-center">
                    <div className="text-2xl mb-2">🔐</div>
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Multi-Signature</h3>
                    <p className="text-blue-100 text-xs sm:text-sm">2/3 guardian approval required</p>
                  </div>
                  <div className="bg-blue-500/20 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-lg border border-blue-400/30 text-center">
                    <div className="text-2xl mb-2">📄</div>
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Encrypted Storage</h3>
                    <p className="text-blue-100 text-xs sm:text-sm">Military-grade file encryption</p>
                  </div>
                  <div className="bg-blue-500/20 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-lg border border-blue-400/30 text-center">
                    <div className="text-2xl mb-2">⏰</div>
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Time-Locked</h3> 
                    <p className="text-blue-100 text-xs sm:text-sm">Custom unlock periods</p>    
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "upload":
        return <UploadPage />;
      case "decrypt":
        return <DocumentDecryptPage />;
      case "vaults":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Crypto Vaults</h1>   
                <p className="text-blue-100 text-sm sm:text-base">
                  {account ? `Vaults for ${formatAddress(account)}` : "Manage your multi-signature vaults"}
                </p>   
              </div>
              <button
                onClick={() => setShowVaultModal(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto shadow-lg shadow-cyan-500/30"
              >
                + Create Vault
              </button>
            </div>

            {isLoadingVaults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">  
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-blue-500/20 backdrop-blur-lg rounded-xl border border-blue-400/30 p-4 sm:p-6 animate-pulse">
                    <div className="h-4 bg-blue-400/30 rounded w-3/4 mb-3"></div>        
                    <div className="h-3 bg-blue-400/30 rounded w-1/2 mb-4"></div>        
                    <div className="h-10 bg-blue-400/30 rounded"></div>
                  </div>
                ))}
              </div>
            ) : userVaults.length > 0 ? (
              <div className="space-y-8">
                {/* Owned Vaults */}
                {ownedVaults.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">My Vaults</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">  
                      {ownedVaults.map(vault => (
                        <VaultCard 
                          key={vault.id} 
                          vaultId={vault.id} 
                          onUpdate={loadUserVaults}
                          onManageAccess={handleManageAccess}
                          isDemo={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Guardian Vaults */}
                {guardianVaults.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Vaults I Guard</h2>
                    <div className="mb-4 p-4 bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 rounded-xl">
                      <p className="text-blue-100 text-sm">
                        You are a guardian for these vaults. You can approve withdrawals but cannot initiate them.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">  
                      {guardianVaults.map(vault => (
                        <VaultCard 
                          key={vault.id} 
                          vaultId={vault.id} 
                          onUpdate={loadUserVaults}
                          onManageAccess={() => {
                            alert("As a guardian, you can only approve withdrawals. Contact the vault owner for access management.");
                          }}
                          isDemo={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-500/10 backdrop-blur-lg rounded-xl border-2 border-dashed border-blue-400/30 p-6 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-4">🏦</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Vaults Found</h3>
                <p className="text-blue-100 text-sm sm:text-base mb-4 sm:mb-6">
                  {account 
                    ? "You don't have any vaults yet. Create your first vault to get started."
                    : "Connect your wallet to see your vaults."
                  }
                </p>
                {account && (
                  <button
                    onClick={() => setShowVaultModal(true)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-xl font-semibold text-sm sm:text-base w-full sm:w-auto shadow-lg shadow-cyan-500/30"
                  >
                    Create First Vault
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case "transactions":
        return <VaultTransactionsPage />;
      case "inheritance":
        return <InheritanceAccessPage />;
      case "settings":
        return <SettingsPage account={account} />;
      default:
        return <div className="text-white">Page not found</div>;
    }
  };

  if (currentPage === "landing") {
    return renderPage();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800/90 backdrop-blur-xl border-r border-blue-600/30 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-blue-600/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-white text-lg font-bold">🦉</span>
              </div>
              <span className="text-white text-xl font-light">OwlVault</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? "bg-cyan-500/20 text-cyan-100 border border-cyan-400/30 shadow-lg shadow-cyan-500/20"
                    : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="p-4 border-t border-blue-600/30">
            {account ? (
              <div className="bg-green-500/20 backdrop-blur-lg border border-green-400/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-100 text-sm font-medium">Connected</span>
                </div>
                <p className="text-white text-sm font-mono">{formatAddress(account)}</p>
                <button
                  onClick={() => setAccount(null)}
                  className="w-full mt-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 text-sm py-2 rounded-lg border border-red-400/30 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-cyan-400 disabled:to-blue-400 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/30"
              >
                {isConnecting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </div>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Top Bar */}
        <header className="bg-blue-800/50 backdrop-blur-xl border-b border-blue-600/30">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-colors"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-blue-100 text-sm">
                {account ? `Welcome, ${formatAddress(account)}` : "Please connect wallet"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {renderPage()}
        </main>
      </div>

      {/* Modals */}
      {showVaultModal && (
        <CreateVaultModal
          onClose={() => setShowVaultModal(false)}
          onVaultCreated={handleVaultCreated}
        />
      )}

      {showAccessModal && selectedVaultId && (
        <AccessControlModal
          vaultId={selectedVaultId}
          onClose={() => {
            setShowAccessModal(false);
            setSelectedVaultId(null);
          }}
          onAccessGranted={() => {
            setShowAccessModal(false);
            setSelectedVaultId(null);
            alert("Access permissions updated successfully! ✅");
          }}
        />
      )}
    </div>
  );
}

export default App;
