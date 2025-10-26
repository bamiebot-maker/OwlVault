import { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/blockchain";

const CreateVaultModal = ({ onClose, onVaultCreated }: { onClose: () => void, onVaultCreated: () => void }) => {
  const [unlockDelay, setUnlockDelay] = useState("86400");
  const [depositAmount, setDepositAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createVault = async () => {
    setIsCreating(true);
    try {
      const contract = await getContract();
      const delay = parseInt(unlockDelay);
      const value = depositAmount ? ethers.parseEther(depositAmount) : 0;

      console.log("Creating vault with:", { delay, value: value.toString() });
      
      // Try to create actual vault
      try {
        const tx = await contract.createVault(delay, { value });
        console.log("Transaction sent:", tx.hash);
        
        await tx.wait();
        console.log("Transaction confirmed!");
        
        alert("Vault created successfully on blockchain! 🦉");
        onVaultCreated();
        onClose();
      } catch (blockchainError: any) {
        console.warn("Blockchain transaction failed, using demo mode:", blockchainError);
        
        // Fallback: Create demo vault
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate a demo vault ID
        const demoVaultId = Math.floor(Math.random() * 1000) + 1;
        
        alert(`Demo Vault #${demoVaultId} created successfully! 🦉\n\n(In demo mode - blockchain transaction skipped due to network issues)`);
        onVaultCreated();
        onClose();
      }
      
    } catch (error: any) {
      console.error("Vault creation error:", error);
      
      if (error.message?.includes("circuit breaker") || error.code === -32603) {
        alert("Network busy. Please wait a moment and try again, or use demo mode.");
      } else {
        alert("Failed to create vault: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsCreating(false);
    }
  };

  const createDemoVault = async () => {
    setIsCreating(true);
    try {
      // Simulate vault creation without blockchain
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const demoVaultId = Math.floor(Math.random() * 1000) + 1;
      alert(`Demo Vault #${demoVaultId} created successfully! 🦉\n\nThis is a demonstration without blockchain interaction.`);
      onVaultCreated();
      onClose();
    } catch (error) {
      alert("Demo creation failed");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create OwlVault</h2>
          <p className="text-sm text-gray-600">Multi-signature secured crypto vault</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Unlock Delay</label>
            <select
              value={unlockDelay}
              onChange={(e) => setUnlockDelay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="3600">1 Hour</option>
              <option value="86400">24 Hours</option>
              <option value="259200">3 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Initial Deposit (BDAG)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for 0 deposit</p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="font-medium text-yellow-800 mb-2">Network Notice</div>
            <p className="text-sm text-yellow-700">
              BlockDAG testnet might be busy. If real transactions fail, use demo mode for presentation.
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">Security Features</div>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>Multi-signature withdrawals</li>
              <li>Time-locked security</li>
              <li>Guardian approval system</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <button
            onClick={createVault}
            disabled={isCreating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              "Create Real Vault (Blockchain)"
            )}
          </button>
          
          <button
            onClick={createDemoVault}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {isCreating ? "Creating Demo..." : "Create Demo Vault"}
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVaultModal;
