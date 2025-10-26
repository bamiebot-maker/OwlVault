import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";
import CreateVaultModal from "./components/CreateVaultModal";
import AccessControlModal from "./components/AccessControlModal";
import VaultCard from "./components/VaultCard";
import { getContract } from "./utils/blockchain";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentPage, setCurrentPage] = useState("landing");
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [userVaults, setUserVaults] = useState<number[]>([]);
  const [isLoadingVaults, setIsLoadingVaults] = useState(false);

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
    setIsLoadingVaults(true);
    try {
      // For demo, we'll create some mock vaults. In real app, you'd query the contract
      setUserVaults([1, 2, 3]); // Mock vault IDs
    } catch (error) {
      console.error("Error loading vaults:", error);
    } finally {
      setIsLoadingVaults(false);
    }
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
    { id: "upload", label: "Upload" },
    { id: "vaults", label: "Vaults" },
    { id: "settings", label: "Settings" },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onEnterApp={() => setCurrentPage("dashboard")} />;        
      case "dashboard":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to OwlVault 🦉
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Secure your documents and cryptocurrency with multi-signature protection
              </p>

              {account && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Multi-Signature</h3>
                    <p className="text-sm text-gray-600">2/3 guardian approval required</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
                    <div className="text-2xl mb-2">🔐</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Encrypted Storage</h3>
                    <p className="text-sm text-gray-600">Military-grade file encryption</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
                    <div className="text-2xl mb-2">⏰</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Time-Locked</h3> 
                    <p className="text-sm text-gray-600">Custom unlock periods</p>    
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "upload":
        return <UploadPage />;
      case "vaults":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Crypto Vaults</h1>   
                <p className="text-gray-600">Manage your multi-signature vaults</p>   
              </div>
              <button
                onClick={() => setShowVaultModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                + Create Vault
              </button>
            </div>

            {isLoadingVaults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>        
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>        
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : userVaults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
                {userVaults.map(vaultId => (
                  <VaultCard 
                    key={vaultId} 
                    vaultId={vaultId} 
                    onUpdate={loadUserVaults}
                    onManageAccess={handleManageAccess}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="text-6xl mb-4">🦉</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vaults Yet</h3>
                <p className="text-gray-600 mb-6">Create your first multi-signature vault to get started</p>
                <button
                  onClick={() => setShowVaultModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
                >
                  Create First Vault
                </button>
              </div>
            )}
          </div>
        );
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage("dashboard")}>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🦉</span>
                </div>
                <span className="text-xl font-bold text-gray-900">OwlVault</span>     
              </div>

              <nav className="hidden md:flex items-center gap-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${ 
                      currentPage === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {account ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-green-800">
                    {formatAddress(account)}
                  </span>
                  <button
                    onClick={() => setAccount(null)}
                    className="p-1 hover:bg-green-100 rounded text-sm transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <span>🔗</span>
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      {showVaultModal && (
        <CreateVaultModal
          onClose={() => setShowVaultModal(false)}
          onVaultCreated={() => {
            setShowVaultModal(false);
            loadUserVaults();
            alert("Vault created successfully! 🦉");
          }}
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
            alert("Access permissions updated successfully! 🦉");
          }}
        />
      )}
    </div>
  );
}

export default App;
