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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [createdVaults, setCreatedVaults] = useState<number[]>([]);

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
      // Combine created vaults with guardian vaults
      const allVaults: VaultInfo[] = [];

      // Add created vaults (as owner)
      createdVaults.forEach(vaultId => {
        allVaults.push({
          id: vaultId,
          owner: account,
          isGuardian: false, // Owner has full access
          balance: "0" // Will be loaded in VaultCard
        });
      });

      // Add guardian vaults (vaults where user is a guardian but not owner)
      const guardianVaults = await loadGuardianVaults(account);
      allVaults.push(...guardianVaults);

      setUserVaults(allVaults);
    } catch (error) {
      console.error("Error loading vaults:", error);
      // Fallback to just created vaults
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
      // Mock guardian vaults - in real app, query blockchain for vaults where user is guardian
      // This would require a contract function to get guardian vaults
      
      // For demo, return some mock guardian vaults based on user address
      const addressHash = userAddress.slice(2, 10);
      const baseId = parseInt(addressHash, 16) % 1000;
      
      return [
        {
          id: baseId + 100, // Different ID range for guardian vaults
          owner: "0x893a35Cc6634C0532925a3b8D9a1F2E1C1D3a1c3", // Different owner
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
    // Add the new vault to our created vaults list
    setCreatedVaults(prev => [...prev, vaultId]);
    // Reload vaults to include the new one
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
    { id: "dashboard", label: "Dashboard" },
    { id: "upload", label: "Upload & Encrypt" },
    { id: "decrypt", label: "Decrypt Files" },
    { id: "vaults", label: "Crypto Vaults" },
    { id: "transactions", label: "Transactions" },
    { id: "inheritance", label: "Inheritance" },
    { id: "settings", label: "Settings" },
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
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Welcome to OwlVault 🦉
              </h1>
              <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
                Secure your documents and cryptocurrency with multi-signature protection
              </p>

              {account && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 text-center">
                    <div className="text-2xl mb-2">🔐</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Multi-Signature</h3>
                    <p className="text-xs sm:text-sm text-gray-600">2/3 guardian approval required</p>
                  </div>
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 text-center">
                    <div className="text-2xl mb-2">📄</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Encrypted Storage</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Military-grade file encryption</p>
                  </div>
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 text-center">
                    <div className="text-2xl mb-2">⏰</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Time-Locked</h3> 
                    <p className="text-xs sm:text-sm text-gray-600">Custom unlock periods</p>    
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Crypto Vaults</h1>   
                <p className="text-gray-600 text-sm sm:text-base">
                  {account ? `Vaults for ${formatAddress(account)}` : "Manage your multi-signature vaults"}
                </p>   
              </div>
              <button
                onClick={() => setShowVaultModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                + Create Vault
              </button>
            </div>

            {isLoadingVaults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">  
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>        
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>        
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : userVaults.length > 0 ? (
              <div className="space-y-8">
                {/* Owned Vaults */}
                {ownedVaults.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">My Vaults</h2>
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Vaults I Guard</h2>
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">
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
              <div className="bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 p-6 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-4">🏦</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Vaults Found</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  {account 
                    ? "You don't have any vaults yet. Create your first vault to get started."
                    : "Connect your wallet to see your vaults."
                  }
                </p>
                {account && (
                  <button
                    onClick={() => setShowVaultModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto"
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
        return <div>Page not found</div>;
    }
  };

  if (currentPage === "landing") {
    return renderPage();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => { setCurrentPage("dashboard"); setIsMobileMenuOpen(false); }}>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#1e3a8a] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">🦉</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900">OwlVault</span>     
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${ 
                      currentPage === item.id
                        ? "bg-blue-100 text-[#1e3a8a]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? "✕" : "☰"}
              </button>

              {account ? (
                <div className="flex items-center gap-2 sm:gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-xs sm:text-sm font-medium text-green-800">
                    {formatAddress(account)}
                  </span>
                  <button
                    onClick={() => setAccount(null)}
                    className="p-1 hover:bg-green-100 rounded text-xs sm:text-sm transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  <span>🔗</span>
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden border-t border-gray-200 py-4">
              <div className="grid grid-cols-2 gap-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentPage(item.id); setIsMobileMenuOpen(false); }}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm text-center ${
                      currentPage === item.id
                        ? "bg-blue-100 text-[#1e3a8a]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {renderPage()}
      </main>

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
