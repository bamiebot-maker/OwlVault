import { useState } from "react";
import { getContract, formatAddress } from "../utils/blockchain";

const SettingsPage = ({ account }: { account: string | null }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoLock, setAutoLock] = useState(true);

  const switchToBlockDAGNetwork = async () => {
    const BLOCKDAG_NETWORK = {
      chainId: '0x2325',
      chainName: 'BlockDAG Testnet',
      nativeCurrency: {
        name: 'BlockDAG',
        symbol: 'BDAG',
        decimals: 18,
      },
      rpcUrls: ['https://relay.awakening.bdagscan.com'],
      blockExplorerUrls: ['https://testnet-explorer.blockdag.network']
    };

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKDAG_NETWORK.chainId }],
      });
      alert("Switched to BlockDAG Network!");
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BLOCKDAG_NETWORK],
          });
        } catch (addError) {
          alert('Failed to add BlockDAG network to MetaMask');
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Network Settings */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Network Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Current Network</p>
                  <p className="text-sm text-gray-600">BlockDAG Testnet</p>
                </div>
                <button
                  onClick={switchToBlockDAGNetwork}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Switch Network
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto Lock</p>
                  <p className="text-sm text-gray-600">Automatically lock after inactivity</p>
                </div>
                <button
                  onClick={() => setAutoLock(!autoLock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoLock ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoLock ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Connected Wallet</p>
                <p className="font-medium text-gray-900">
                  {account ? formatAddress(account) : 'Not connected'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Network</p>
                <p className="font-medium text-green-600">BlockDAG Testnet</p>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Application</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contract</span>
                <span className="text-blue-600">Deployed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Encryption</span>
                <span className="text-green-600">AES-256</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
