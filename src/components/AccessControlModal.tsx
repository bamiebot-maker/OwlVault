import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract, formatAddress } from "../utils/blockchain";

interface AccessControlModalProps {
  vaultId: number;
  onClose: () => void;
  onAccessGranted: () => void;
}

const AccessControlModal = ({ vaultId, onClose, onAccessGranted }: AccessControlModalProps) => {
  const [vaultInfo, setVaultInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newGuardian, setNewGuardian] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadVaultInfo();
  }, [vaultId]);

  const loadVaultInfo = async () => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const info = await contract.getVaultInfo(vaultId);
      setVaultInfo(info);
      
      // Check if current user is owner
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setIsOwner(info.owner.toLowerCase() === accounts[0].toLowerCase());
      }
    } catch (error) {
      console.error("Error loading vault info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGuardian = async () => {
    if (!newGuardian || !ethers.isAddress(newGuardian)) {
      alert("Please enter a valid Ethereum address");
      return;
    }

    if (vaultInfo.guardians.includes(newGuardian.toLowerCase())) {
      alert("This address is already a guardian");
      return;
    }

    setIsAdding(true);
    try {
      const contract = await getContract();
      const tx = await contract.addGuardian(vaultId, newGuardian);
      await tx.wait();
      
      alert("Guardian added successfully!");
      setNewGuardian("");
      loadVaultInfo(); // Refresh vault info
      onAccessGranted();
    } catch (error: any) {
      console.error("Error adding guardian:", error);
      alert("Failed to add guardian: " + (error.message || "Unknown error"));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveGuardian = async (guardian: string) => {
    if (!confirm(`Remove ${formatAddress(guardian)} as guardian?`)) {
      return;
    }

    try {
      // Note: Your contract would need a removeGuardian function
      alert("Remove guardian functionality would be implemented here");
      // const contract = await getContract();
      // const tx = await contract.removeGuardian(vaultId, guardian);
      // await tx.wait();
      // loadVaultInfo();
    } catch (error: any) {
      alert("Failed to remove guardian: " + (error.message || "Unknown error"));
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Vault Access</h2>
          <p className="text-sm text-gray-600">Vault #{vaultId} - {formatAddress(vaultInfo.owner)}</p>
        </div>

        <div className="p-6 space-y-6">
          {!isOwner ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                You are not the owner of this vault. Only the owner can manage guardians.
              </p>
            </div>
          ) : (
            <>
              {/* Add Guardian */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Add Guardian</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGuardian}
                    onChange={(e) => setNewGuardian(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddGuardian}
                    disabled={isAdding || !newGuardian}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {isAdding ? "..." : "Add"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Guardians can approve withdrawals but cannot initiate them
                </p>
              </div>

              {/* Current Guardians */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Current Guardians ({vaultInfo.guardians.length})
                </h3>
                {vaultInfo.guardians.length > 0 ? (
                  <div className="space-y-2">
                    {vaultInfo.guardians.map((guardian: string, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-mono">{formatAddress(guardian)}</span>
                        <button
                          onClick={() => handleRemoveGuardian(guardian)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No guardians added yet</p>
                )}
              </div>

              {/* Access Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How Access Works</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Owner: Full control over vault</li>
                  <li>• Guardians: Can approve withdrawals (2/3 required)</li>
                  <li>• Others: No access to vault</li>
                </ul>
              </div>
            </>
          )}

          {/* Vault Info */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Vault Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Balance:</span>
                <p className="font-medium">{ethers.formatEther(vaultInfo.balance || 0)} BDAG</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-medium">{vaultInfo.hasPendingWithdrawal ? "Pending Withdrawal" : "Active"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessControlModal;
