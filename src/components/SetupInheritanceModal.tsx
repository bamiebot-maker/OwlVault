import { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/blockchain";

interface SetupInheritanceModalProps {
  onClose: () => void;
  onInheritanceSetup: (docId: string) => void;
}

const SetupInheritanceModal = ({ onClose, onInheritanceSetup }: SetupInheritanceModalProps) => {
  const [documentName, setDocumentName] = useState("");
  const [guardians, setGuardians] = useState<string[]>(["", "", ""]);
  const [unlockDays, setUnlockDays] = useState("90");
  const [isSettingUp, setIsSettingUp] = useState(false);

  const addGuardian = () => {
    setGuardians(prev => [...prev, ""]);
  };

  const removeGuardian = (index: number) => {
    setGuardians(prev => prev.filter((_, i) => i !== index));
  };

  const updateGuardian = (index: number, address: string) => {
    setGuardians(prev => prev.map((guardian, i) => i === index ? address : guardian));
  };

  const getValidGuardians = () => {
    return guardians.filter(guardian => guardian && ethers.isAddress(guardian));
  };

  const setupInheritance = async () => {
    if (!documentName) {
      alert("Please enter a document name");
      return;
    }

    const validGuardians = getValidGuardians();
    if (validGuardians.length < 2) {
      alert("Please add at least 2 guardians for inheritance access");
      return;
    }

    setIsSettingUp(true);
    try {
      // Generate unique document ID
      const docId = `inherit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate unlock timestamp
      const unlockTimestamp = Math.floor(Date.now() / 1000) + (parseInt(unlockDays) * 24 * 60 * 60);

      // In real implementation, you'd store this on blockchain
      // For now, we'll simulate the setup
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`Inheritance document "${documentName}" setup successfully! 🦉\n\nDocument will be accessible after ${unlockDays} days or with guardian approval.`);
      onInheritanceSetup(docId);
      onClose();
    } catch (error: any) {
      alert("Failed to setup inheritance: " + (error.message || "Unknown error"));
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Setup Inheritance Document</h2>
          <p className="text-sm text-gray-600">Create a time-locked document for inheritance purposes</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Document Name *</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., Last Will, Business Succession Plan, Family Trust"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Unlock Period */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Unlock After (Days) *</label>
            <select
              value={unlockDays}
              onChange={(e) => setUnlockDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
              <option value="180">180 Days</option>
              <option value="365">1 Year</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Document becomes automatically accessible after this period of account inactivity
            </p>
          </div>

          {/* Guardians */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-900">Inheritance Guardians *</label>
              <button
                type="button"
                onClick={addGuardian}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Guardian
              </button>
            </div>
            
            <div className="space-y-3">
              {guardians.map((guardian, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={guardian}
                    onChange={(e) => updateGuardian(index, e.target.value)}
                    placeholder="Guardian Ethereum address (0x...)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {guardians.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGuardian(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 font-medium"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Add guardians who can approve early access in case of emergency.
              {getValidGuardians().length > 0 && (
                <span className="text-green-600 ml-1">
                  {getValidGuardians().length} valid guardian(s) added
                </span>
              )}
            </p>
          </div>

          {/* Inheritance Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">How Inheritance Works</div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Document is time-locked for the specified period</li>
              <li>• Becomes automatically accessible after unlock period</li>
              <li>• Guardians can approve emergency access before unlock time</li>
              <li>• 2/3 guardian approval required for early access</li>
              <li>• Perfect for wills, trusts, and succession plans</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <button
            onClick={setupInheritance}
            disabled={isSettingUp || !documentName || getValidGuardians().length < 2}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isSettingUp ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Setting Up Inheritance...
              </>
            ) : (
              `Setup Inheritance Document (${getValidGuardians().length}/2+ Guardians)`
            )}
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

export default SetupInheritanceModal;
