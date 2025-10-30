import React from 'react';

interface WalletConnectProps {
  onConnect: () => Promise<{ success: boolean; error?: string }>;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [connecting, setConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    
    const result = await onConnect();
    
    if (!result.success) {
      setError(result.error || 'Failed to connect wallet');
    }
    
    setConnecting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
      <div className="text-6xl mb-6">🦉</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">OwlVault 2.0</h1>
      <p className="text-gray-600 mb-8">Secure Digital Legacy Platform</p>
      
      <div className="space-y-4">
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
        >
          {connecting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🦊</span>
              <span>Connect MetaMask</span>
            </div>
          )}
        </button>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        <div className="bg-blue-50 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">Features:</h3>
          <ul className="text-blue-600 text-sm space-y-1">
            <li>• Multi-signature vault protection</li>
            <li>• Encrypted document storage</li>
            <li>• Guardian approval system</li>
            <li>• Secure digital inheritance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
