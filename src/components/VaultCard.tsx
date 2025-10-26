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
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isRealVault, setIsRealVault] = useState(!isDemo);
  const [userRole, setUserRole] = useState<"owner" | "guardian" | "none">("none");

  useEffect(() => {
    loadVaultInfo();
  }, [vaultId]);

  const loadVaultInfo = async () => {
    setIsLoading(true);
    try {
      if (isDemo) {
        setVaultInfo({
          owner: "0xDemoAddress1234567890",
          balance: ethers.parseEther("1.5"),
          unlockTime: Math.floor(Date.now() / 1000) + 86400,
          guardians: ["0xDemoAddress1234567890"],
          isGuardian: true,
          hasPendingWithdrawal: false,
          pendingApprovals: 0
        });
        setIsRealVault(false);
        setUserRole("owner");
      } else {
        try {
          const contract = await getContract();
          const info = await contract.getVaultInfo(vaultId);
          setVaultInfo(info);
          setIsRealVault(true);
          
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            const userAddress = accounts[0].toLowerCase();
            const ownerAddress = info.owner.toLowerCase();
            
            if (userAddress === ownerAddress) {
              setUserRole("owner");
            } else if (info.guardians.some((g: string) => g.toLowerCase() === userAddress)) {
              setUserRole("guardian");
            } else {
              setUserRole("none");
            }
          }
        } catch (blockchainError) {
          console.warn(`Vault ${vaultId} not found on blockchain, showing as demo`, blockchainError);
          setVaultInfo({
            owner: "0x0000000000000000000000000000000000000000",
            balance: ethers.parseEther("0"),
            unlockTime: Math.floor(Date.now() / 1000) + 3600,
            guardians: [],
            isGuardian: false,
            hasPendingWithdrawal: false,
            pendingApprovals: 0
          });
          setIsRealVault(false);
          setUserRole("none");
        }
      }
    } catch (error) {
      console.error("Error loading vault info:", error);
      setVaultInfo({
        owner: "0x0000000000000000000000000000000000000000",
        balance: ethers.parseEther("0"),
        unlockTime: 0,
        guardians: [],
        isGuardian: false,
        hasPendingWithdrawal: false,
        pendingApprovals: 0
      });
      setIsRealVault(false);
      setUserRole("none");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Please enter a valid deposit amount");
      return;
    }

    if (userRole !== "owner") {
      alert("Only the vault owner can deposit funds");
      return;
    }

    setIsDepositing(true);
    try {
      if (!isRealVault) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert(`Demo: Deposited ${depositAmount} BDAG to Vault #${vaultId}`);
        setDepositAmount("");
        setVaultInfo(prev => ({
          ...prev,
          balance: (prev.balance || 0n) + ethers.parseEther(depositAmount)
        }));
      } else {
        const contract = await getContract();
        const value = ethers.parseEther(depositAmount);
        const tx = await contract.depositToVault(vaultId, { value });
        await tx.wait();
        alert(`Successfully deposited ${depositAmount} BDAG to Vault #${vaultId}!`);
        setDepositAmount("");
        loadVaultInfo();
        onUpdate();
      }
    } catch (error: any) {
      console.error("Deposit error:", error);
      alert("Deposit failed: " + (error.message || "Unknown error"));
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!vaultInfo || vaultInfo.balance <= 0) {
      alert("No funds to withdraw");
      return;
    }

    if (userRole === "none") {
      alert("You don't have permission to withdraw from this vault");
      return;
    }

    setIsWithdrawing(true);
    try {
      if (!isRealVault) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert(`Demo: Withdrawal request submitted for Vault #${vaultId}. Requires guardian approval.`);
      } else {
        const contract = await getContract();
        const tx = await contract.requestWithdrawal(vaultId, vaultInfo.balance);
        await tx.wait();
        
        if (userRole === "owner") {
          alert("Withdrawal request submitted! Waiting for guardian approvals.");
        } else {
          alert("Withdrawal approval submitted! Waiting for other guardians.");
        }
        
        loadVaultInfo();
        onUpdate();
      }
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      alert("Withdrawal failed: " + (error.message || "Unknown error"));
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl border border-blue-400/30 p-6 animate-pulse">
        <div className="h-4 bg-blue-400/30 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-blue-400/30 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-blue-400/30 rounded"></div>
      </div>
    );
  }

  if (!vaultInfo) {
    return (
      <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl border border-blue-400/30 p-6 text-center">
        <p className="text-blue-100 text-sm">Vault #{vaultId} not found</p>
      </div>
    );
  }

  const isLocked = Date.now() / 1000 < Number(vaultInfo.unlockTime);
  const isEmptyVault = vaultInfo.balance <= 0 && vaultInfo.owner === "0x0000000000000000000000000000000000000000";

  return (
    <div className="bg-blue-500/10 backdrop-blur-lg rounded-xl border border-blue-400/30 p-6 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-base ${
            isLocked ? "bg-orange-500/20 text-orange-300 border border-orange-400/30" : "bg-green-500/20 text-green-300 border border-green-400/30"
          }`}>
            {isLocked ? "🔒" : "🔓"}
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">
              Vault #{vaultId} 
              {!isRealVault && " 🎭"}
              {isEmptyVault && " (Empty)"}
            </h3>
            <p className="text-blue-100 text-sm">
              {isEmptyVault ? "No owner" : formatAddress(vaultInfo.owner)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isLocked ? "bg-orange-500/20 text-orange-300 border border-orange-400/30" : "bg-green-500/20 text-green-300 border border-green-400/30"
          }`}>
            {isLocked ? "Locked" : "Unlocked"}
          </div>
          {userRole === "guardian" && (
            <div className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Guardian
            </div>
          )}
          {!isRealVault && (
            <div className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Demo
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-blue-100 text-sm">Balance:</span>
          <span className="font-semibold text-white text-base">
            {formatBalance(vaultInfo.balance)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-blue-100 text-sm">Guardians:</span>
          <span className="font-medium text-white text-base">
            {vaultInfo.guardians?.length || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-blue-100 text-sm">Your Role:</span>
          <span className={`text-sm font-medium ${
            userRole === "owner" ? "text-green-300" :
            userRole === "guardian" ? "text-cyan-300" : "text-blue-300"
          }`}>
            {userRole === "owner" ? "Owner" :
             userRole === "guardian" ? "Guardian" : "No Access"}
          </span>
        </div>
      </div>

      {/* Deposit Input - Only for owners */}
      {userRole === "owner" && (
        <div className="mb-3">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.001"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 px-3 py-2 bg-blue-600/30 border border-blue-400/50 rounded-lg text-white text-sm placeholder-blue-300 focus:outline-none focus:border-cyan-400"
            />
            <button 
              onClick={handleDeposit}
              disabled={isDepositing || !depositAmount}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-400 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cyan-500/30"
            >
              {isDepositing ? "..." : "Deposit"}
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Button - For owners and guardians */}
      {(userRole === "owner" || userRole === "guardian") && (
        <div className="flex gap-2">
          <button
            onClick={handleWithdraw}
            disabled={isLocked || isWithdrawing || vaultInfo.balance <= 0 || isEmptyVault}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-500/30"
          >
            {isWithdrawing ? "..." : 
             userRole === "owner" ? "Withdraw" : "Approve Withdrawal"}
          </button>
        </div>
      )}

      {/* Access Control Button - Only for owners */}
      {userRole === "owner" && !isEmptyVault && (
        <button
          onClick={() => onManageAccess && onManageAccess(vaultId)}
          className="w-full mt-3 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
        >
          <span>👥</span>
          Manage Access
        </button>
      )}

      {userRole === "guardian" && (
        <div className="mt-3 p-2 bg-cyan-500/20 border border-cyan-400/30 rounded text-center">
          <p className="text-cyan-100 text-xs">
            You are a guardian. You can approve withdrawals but cannot deposit or manage access.
          </p>
        </div>
      )}

      {!isRealVault && (
        <div className="mt-3 p-2 bg-purple-500/20 border border-purple-400/30 rounded text-center">
          <p className="text-purple-100 text-xs">
            {isEmptyVault ? "Vault not found on blockchain" : "Demo Vault - No blockchain interaction"}
          </p>
        </div>
      )}
    </div>
  );
};

export default VaultCard;
