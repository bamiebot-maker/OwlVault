import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract, formatBalance, formatAddress } from "../utils/blockchain";

interface VaultCardProps {
  vaultId: number;
  onUpdate: () => void;
  isDemo?: boolean;
  onManageAccess?: (vaultId: number) => void;
}

const VaultCard = ({ vaultId, onUpdate, isDemo = false, onManageAccess }: VaultCardProps) => {
  const [vaultInfo, setVaultInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!isDemo);

  useEffect(() => {
    if (!isDemo) {
      loadVaultInfo();
    } else {
      // For demo vaults, create mock data
      setVaultInfo({
        owner: "0xDemoAddress1234567890",
        balance: ethers.parseEther("1.5"),
        unlockTime: Math.floor(Date.now() / 1000) + 86400,
        guardians: ["0xDemoAddress1234567890"],
        isGuardian: true,
        hasPendingWithdrawal: false,
        pendingApprovals: 0
      });
      setIsLoading(false);
    }
  }, [vaultId, isDemo]);

  const loadVaultInfo = async () => {
    try {
      const contract = await getContract();
      const info = await contract.getVaultInfo(vaultId);
      setVaultInfo(info);
    } catch (error) {
      console.error("Error loading vault info:", error);
      // If real vault fails to load, show as demo
      setVaultInfo({
        owner: "0xDemoAddress1234567890",
        balance: ethers.parseEther("0.5"),
        unlockTime: Math.floor(Date.now() / 1000) + 3600,
        guardians: ["0xDemoAddress1234567890"],
        isGuardian: true,
        hasPendingWithdrawal: false,
        pendingApprovals: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!vaultInfo) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-600">Vault #{vaultId} not found</p>
      </div>
    );
  }

  const isLocked = Date.now() / 1000 < Number(vaultInfo.unlockTime);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isLocked ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
          }`}>
            {isLocked ? "🔒" : "🔓"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Vault #{vaultId} {isDemo && "🎭"}
            </h3>
            <p className="text-sm text-gray-600">{formatAddress(vaultInfo.owner)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isLocked ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
          }`}>
            {isLocked ? "Locked" : "Unlocked"}
          </div>
          {isDemo && (
            <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              Demo
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Balance:</span>
          <span className="font-semibold text-gray-900">{formatBalance(vaultInfo.balance)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Guardians:</span>
          <span className="font-medium text-gray-900">{vaultInfo.guardians.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`text-sm font-medium ${
            vaultInfo.hasPendingWithdrawal ? "text-blue-600" : "text-gray-600"
          }`}>
            {vaultInfo.hasPendingWithdrawal ? "Pending Withdrawal" : "Active"}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
          Deposit
        </button>
        <button 
          disabled={isLocked}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          Withdraw
        </button>
      </div>

      {/* Access Control Button */}
      <button
        onClick={() => onManageAccess && onManageAccess(vaultId)}
        className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <span>👥</span>
        Manage Access
      </button>
      
      {isDemo && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
          <p className="text-xs text-blue-700">Demo Vault - No blockchain interaction</p>
        </div>
      )}
    </div>
  );
};

export default VaultCard;
