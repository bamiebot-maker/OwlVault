import React, { useState } from 'react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ 
  isOpen, 
  onClose, 
  onConnect, 
  loading 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (isConnecting) return;
    
    setError(null);
    setIsConnecting(true);
    
    try {
      console.log('Starting connection from modal...');
      const result = await onConnect();
      
      if (result.success) {
        console.log('Connection successful, closing modal...');
        onClose();
      } else {
        console.error('Connection failed:', result.error);
        setError(result.error || 'Failed to connect wallet. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected connection error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-2xl max-w-md w-full border border-blue-600/50">
        {/* Header */}
        <div className="p-6 border-b border-blue-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🦉</div>
              <div>
                <h2 className="text-xl font-bold text-white">Connect to BlockDAG</h2>
                <p className="text-blue-300 text-sm">Access OwlVault on BlockDAG Awakening</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-blue-300 hover:text-white transition-colors disabled:opacity-50"
              disabled={isConnecting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-600">
              <span className="text-3xl">🦊</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Connect to BlockDAG Awakening</h3>
            <p className="text-blue-300 text-sm">
              We'll automatically switch your MetaMask to BlockDAG Awakening to access OwlVault.
            </p>
          </div>

          {/* Network Info */}
          <div className="bg-blue-800/50 rounded-xl p-4 mb-6 border border-blue-700/30">
            <h4 className="font-semibold text-white mb-3 text-sm">Network Information:</h4>
            <div className="text-blue-300 text-sm space-y-2">
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="text-green-400">BlockDAG Awakening</span>
              </div>
              <div className="flex justify-between">
                <span>Chain ID:</span>
                <span>1043</span>
              </div>
              <div className="flex justify-between">
                <span>RPC URL:</span>
                <span className="text-xs">relay.awakening.bdagscan.com</span>
              </div>
              <div className="flex justify-between">
                <span>Currency:</span>
                <span>BDAG</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-blue-800/50 rounded-xl p-4 mb-6 border border-blue-700/30">
            <h4 className="font-semibold text-white mb-3 text-sm">You'll be able to:</h4>
            <ul className="text-blue-300 text-sm space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Create multi-signature vaults</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Store encrypted documents</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Manage guardian approvals</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Secure your digital legacy</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm font-medium mb-1">Connection Failed</p>
              <p className="text-red-400 text-xs">{error}</p>
              <p className="text-red-400 text-xs mt-2">
                • Make sure MetaMask is installed and unlocked<br/>
                • Approve the network switch when prompted<br/>
                • Ensure you have an account in MetaMask
              </p>
            </div>
          )}

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={isConnecting || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed shadow-lg"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connecting to BlockDAG...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Connect MetaMask</span>
              </div>
            )}
          </button>

          {/* Help Text */}
          <div className="text-center text-blue-400 text-xs mt-4 space-y-1">
            <p>
              Don't have MetaMask?{' '}
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-white underline"
              >
                Download here
              </a>
            </p>
            <p>Make sure to approve both the connection and network switch</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectModal;
