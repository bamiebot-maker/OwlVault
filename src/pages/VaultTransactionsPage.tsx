import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract, _formatAddress } from "../utils/blockchain";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: string;
  asset: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  hash?: string;
  from: string;
  to: string;
  confirmations?: number;
}

interface Vault {
  id: number;
  balance: string;
  owner: string;
  guardians: string[];
}

const VaultTransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userVaults, setUserVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkWallet();
  }, []);

  useEffect(() => {
    if (account) {
      loadUserVaults();
    } else {
      setUserVaults([]);
      setTransactions([]);
      setSelectedVault(null);
    }
  }, [account]);

  useEffect(() => {
    if (selectedVault && account) {
      loadVaultTransactions(selectedVault);
    }
  }, [selectedVault, account]);

  const checkWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
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
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const loadUserVaults = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      // In real implementation, fetch user's vaults from blockchain
      const mockVaults: Vault[] = [
        { id: 1, balance: "1.5", owner: account, guardians: [] },
        { id: 2, balance: "0.5", owner: account, guardians: [] }
      ];
      setUserVaults(mockVaults);
      if (mockVaults.length > 0) {
        setSelectedVault(mockVaults[0].id);
      }
    } catch (error) {
      console.error("Error loading vaults:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVaultTransactions = async (_vaultId: number) => {
    if (!account) return;
    
    try {
      // Mock transactions - in real app, fetch from blockchain events
      const mockTransactions: Transaction[] = [
        {
          id: "tx1",
          type: "deposit",
          amount: "0.5",
          asset: "BDAG",
          timestamp: new Date(),
          status: "completed",
          hash: "0x1234567890abcdef",
          from: account,
          to: "Vault Contract",
          confirmations: 12
        },
        {
          id: "tx2",
          type: "withdrawal",
          amount: "0.1",
          asset: "BDAG",
          timestamp: new Date(Date.now() - 86400000),
          status: "pending",
          hash: "0xabcdef1234567890",
          from: "Vault Contract",
          to: account,
          confirmations: 2
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const handleDeposit = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!selectedVault || !depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Please select a vault and enter a valid amount");
      return;
    }

    try {
      const contract = await getContract();
      const value = ethers.parseEther(depositAmount);
      const tx = await contract.depositToVault(selectedVault, { value });
      
      // Add pending transaction
      const pendingTx: Transaction = {
        id: `pending_${Date.now()}`,
        type: "deposit",
        amount: depositAmount,
        asset: "BDAG",
        timestamp: new Date(),
        status: "pending",
        hash: tx.hash,
        from: account,
        to: "Vault Contract",
        confirmations: 0
      };
      
      setTransactions(prev => [pendingTx, ...prev]);
      setDepositAmount("");
      
      // Wait for confirmation
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTransactions(prev => prev.map(t => 
          t.id === pendingTx.id 
            ? { ...t, status: "completed", confirmations: 12 }
            : t
        ));
        alert("Deposit successful! ??");
        loadUserVaults(); // Refresh vault balances
      } else {
        setTransactions(prev => prev.map(t => 
          t.id === pendingTx.id 
            ? { ...t, status: "failed" }
            : t
        ));
        alert("Deposit failed");
      }
    } catch (error: any) {
      console.error("Deposit error:", error);
      alert("Deposit failed: " + (error.message || "Unknown error"));
    }
  };

  const handleWithdraw = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!selectedVault || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please select a vault and enter a valid amount");
      return;
    }

    try {
      const contract = await getContract();
      const amount = ethers.parseEther(withdrawAmount);
      const tx = await contract.requestWithdrawal(selectedVault, amount);
      
      // Add pending transaction
      const pendingTx: Transaction = {
        id: `pending_${Date.now()}`,
        type: "withdrawal",
        amount: withdrawAmount,
        asset: "BDAG",
        timestamp: new Date(),
        status: "pending",
        hash: tx.hash,
        from: "Vault Contract",
        to: account,
        confirmations: 0
      };
      
      setTransactions(prev => [pendingTx, ...prev]);
      setWithdrawAmount("");
      
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTransactions(prev => prev.map(t => 
          t.id === pendingTx.id 
            ? { ...t, status: "completed", confirmations: 12 }
            : t
        ));
        alert("Withdrawal request submitted! Waiting for guardian approvals. ?");
        loadUserVaults();
      } else {
        setTransactions(prev => prev.map(t => 
          t.id === pendingTx.id 
            ? { ...t, status: "failed" }
            : t
        ));
        alert("Withdrawal request failed");
      }
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      alert("Withdrawal failed: " + (error.message || "Unknown error"));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vault Transactions</h1>
          <p className="text-gray-600">Manage deposits, withdrawals, and track transaction history</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-6">??</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Required</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Please connect your wallet to view and manage your vault transactions securely.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet to Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vault Transactions</h1>
        <p className="text-gray-600">Manage deposits, withdrawals, and track transaction history</p>
        <div className="mt-2 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-700 text-sm font-medium">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
      </div>

      {userVaults.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-6xl mb-4">??</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vaults Found</h3>
          <p className="text-gray-600">Create a vault first to start making transactions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Actions */}
          <div className="space-y-6">
            {/* Vault Selection */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Select Vault</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userVaults.map(vault => (
                  <button
                    key={vault.id}
                    onClick={() => setSelectedVault(vault.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedVault === vault.id
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold">Vault #{vault.id}</div>
                    <div className="text-sm text-gray-600">{vault.balance} BDAG</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (BDAG)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Deposit to Vault
                </button>
              </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Request Withdrawal</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (BDAG)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Request Withdrawal
                </button>
                <p className="text-xs text-gray-500">
                  Withdrawals require approval from 2/3 guardians
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Transaction History */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Transaction History {selectedVault && `- Vault #${selectedVault}`}
            </h3>
            
            {transactions.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transactions.map(tx => (
                  <div key={tx.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === "deposit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {tx.type === "deposit" ? "??" : "??"}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-sm text-gray-500">{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.status === "completed" ? "bg-green-100 text-green-700" :
                        tx.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <p className={`font-semibold ${
                          tx.type === "deposit" ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.type === "deposit" ? "+" : "-"}{tx.amount} {tx.asset}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Confirmations:</span>
                        <p className="font-medium">{tx.confirmations || 0}</p>
                      </div>
                    </div>
                    
                    {tx.hash && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 break-all">
                          TX: {tx.hash}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">??</div>
                <p>No transactions yet</p>
                <p className="text-sm">Transactions will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultTransactionsPage;
