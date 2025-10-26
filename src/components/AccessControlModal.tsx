import { useState } from "react";
import { getContract } from "../utils/blockchain";

interface AccessControlModalProps {
  vaultId: number;
  onClose: () => void;
  onAccessGranted: () => void;
}

const AccessControlModal = ({ vaultId, onClose, onAccessGranted }: AccessControlModalProps) => {
  const [guardianAddress, setGuardianAddress] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"vault" | "document">("vault");

  const addGuardian = async () => {
    if (!guardianAddress || !guardianAddress.startsWith("0x") || guardianAddress.length !== 42) {
      alert("Please enter a valid Ethereum address");
      return;
    }

    setIsProcessing(true);
    try {
      const contract = await getContract();
      const tx = await contract.addGuardian(vaultId, guardianAddress);
      await tx.wait();
      
      alert(`Guardian ${guardianAddress.slice(0, 8)}... added successfully!`);
      setGuardianAddress("");
      onAccessGranted();
    } catch (error: any) {
      console.error("Error adding guardian:", error);
      
      // Fallback to demo mode
      if (error.message?.includes("circuit breaker") || error.code === -32603) {
        alert(`Demo: Guardian ${guardianAddress.slice(0, 8)}... would be added to Vault #${vaultId}\n\n(In demo mode - blockchain transaction skipped)`);
        setGuardianAddress("");
        onAccessGranted();
      } else {
        alert("Failed to add guardian: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const grantDocumentAccess = async () => {
    if (!documentId.trim()) {
      alert("Please enter a document ID");
      return;
    }

    if (!userAddress || !userAddress.startsWith("0x") || userAddress.length !== 42) {
      alert("Please enter a valid Ethereum address");
      return;
    }

    setIsProcessing(true);
    try {
      const contract = await getContract();
      const tx = await contract.grantDocumentAccess(userAddress, documentId);
      await tx.wait();
      
      alert(`Access granted for document "${documentId}" to ${userAddress.slice(0, 8)}...!`);
      setDocumentId("");
      setUserAddress("");
      onAccessGranted();
    } catch (error: any) {
      console.error("Error granting document access:", error);
      
      // Fallback to demo mode
      if (error.message?.includes("circuit breaker") || error.code === -32603) {
        alert(`Demo: Access granted for document "${documentId}" to ${userAddress.slice(0, 8)}...\n\n(In demo mode - blockchain transaction skipped)`);
        setDocumentId("");
        setUserAddress("");
        onAccessGranted();
      } else {
        alert("Failed to grant access: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const generateDemoDocument = () => {
    const demoDocId = `insurance_policy_${Math.floor(Math.random() * 1000)}`;
    setDocumentId(demoDocId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Access</h2>
          <p className="text-sm text-gray-600">Control who can access your assets</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("vault")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "vault"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Vault Guardians
          </button>
          <button
            onClick={() => setActiveTab("document")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "document"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Document Access
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Vault Guardians Tab */}
          {activeTab === "vault" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Vault #{vaultId} - Add Guardian
                </label>
                <input
                  type="text"
                  value={guardianAddress}
                  onChange={(e) => setGuardianAddress(e.target.value)}
                  placeholder="0x742d35Cc6634C0532925a3b8D..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add wallet address as guardian for multi-signature approvals
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-medium text-purple-900 mb-2">Multi-Signature Security</div>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>2/3 guardians required for withdrawals</li>
                  <li>Each guardian can approve/request withdrawals</li>
                  <li>Owner can add/remove guardians</li>
                </ul>
              </div>

              <button
                onClick={addGuardian}
                disabled={isProcessing || !guardianAddress}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {isProcessing ? "Adding Guardian..." : "Add Guardian"}
              </button>
            </div>
          )}

          {/* Document Access Tab */}
          {activeTab === "document" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Document ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="insurance_policy_123"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={generateDemoDocument}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Demo Doc
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Grant Access To
                </label>
                <input
                  type="text"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  placeholder="0x742d35Cc6634C0532925a3b8D..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-900 mb-2">Document Security</div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>Files encrypted before storage</li>
                  <li>Only approved addresses can decrypt</li>
                  <li>Access can be revoked anytime</li>
                </ul>
              </div>

              <button
                onClick={grantDocumentAccess}
                disabled={isProcessing || !documentId || !userAddress}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {isProcessing ? "Granting Access..." : "Grant Document Access"}
              </button>
            </div>
          )}

          {/* Demo Instructions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="font-medium text-yellow-800 mb-2">Demo Instructions</div>
            <p className="text-sm text-yellow-700">
              For the demo, you can use any Ethereum-style address (0x...). 
              The system will show how access control works with fallback to demo mode if blockchain is busy.
            </p>
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
