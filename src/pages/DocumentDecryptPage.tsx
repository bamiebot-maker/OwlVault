import { useState, useEffect } from "react";

interface Document {
  id: string;
  name: string;
  encryptedHash: string;
  timestamp: Date;
  hasAccess: boolean;
  owner: string;
}

const DocumentDecryptPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [decryptedContent, setDecryptedContent] = useState<string>("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Use same storage key as UploadPage
  const STORAGE_KEY = 'owlvault_documents';

  useEffect(() => {
    checkWallet();
  }, []);

  useEffect(() => {
    if (account) {
      loadDocuments();
    }
  }, [account]);

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

  const getAllDocuments = (): Record<string, any> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading documents from storage:", error);
      return {};
    }
  };

  const loadDocuments = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const allDocs = getAllDocuments();
      const userDocs: Document[] = [];

      // Convert stored documents and filter for current user
      Object.values(allDocs).forEach((doc: any) => {
        const isOwner = doc.owner.toLowerCase() === account.toLowerCase();
        const isShared = doc.sharedWith && doc.sharedWith.some((addr: string) => 
          addr.toLowerCase() === account.toLowerCase()
        );

        if (isOwner || isShared) {
          const document: Document = {
            ...doc,
            timestamp: new Date(doc.timestamp),
            hasAccess: isOwner || isShared,
            owner: doc.owner
          };
          userDocs.push(document);
        }
      });

      // Sort by timestamp (newest first)
      userDocs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setDocuments(userDocs);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccess = async (docId: string) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // In real app, this would submit a request to guardians
      alert(`Access requested for document: ${docId}\n\nGuardians will be notified and must approve your request.`);
    } catch (error) {
      alert("Failed to request access");
    }
  };

  const handleDecrypt = async (docId: string, encryptedHash: string, hasAccess: boolean) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!hasAccess) {
      alert("You don't have permission to decrypt this document");
      return;
    }

    setIsDecrypting(true);
    try {
      // Simulate decryption process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock decrypted content based on document type
      const doc = documents.find(d => d.id === docId);
      let content = "";
      
      if (doc?.name.includes("Business")) {
        content = "BUSINESS PLAN CONTENT:\n\nCompany Overview: OwlVault Technologies\nMission: Secure digital inheritance through blockchain\nRevenue Model: Subscription-based vault services\n...";
      } else if (doc?.name.includes("Will")) {
        content = "LAST WILL & TESTAMENT:\n\nI, John Smith, being of sound mind...\n\nAssets:\n- 15.5 ETH to be distributed to children\n- Family home to spouse\n- Digital assets managed through OwlVault\n...";
      } else {
        content = "Decrypted document content would appear here.\n\nThis content was securely encrypted and required proper authorization to access.";
      }
      
      setDecryptedContent(content);
      alert("Document decrypted successfully! ✅");
    } catch (error) {
      alert("Decryption failed");
    } finally {
      setIsDecrypting(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Access Documents</h1>
          <p className="text-gray-600">Decrypt your files with guardian approval when required</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-6">🔓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Required</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Please connect your wallet to decrypt and access your documents securely.
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
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const ownedDocuments = documents.filter(doc => doc.owner.toLowerCase() === account.toLowerCase());
  const sharedDocuments = documents.filter(doc => doc.owner.toLowerCase() !== account.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Access Documents</h1>
          <p className="text-gray-600">Decrypt your files with guardian approval when required</p>
          <div className="mt-2 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700 text-sm font-medium">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Documents List */}
        <div className="space-y-6">
          {/* My Documents */}
          {ownedDocuments.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4">My Documents ({ownedDocuments.length})</h3>
              <div className="space-y-4">
                {ownedDocuments.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          Encrypted • {doc.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        Owner
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecrypt(doc.id, doc.encryptedHash, true)}
                        disabled={isDecrypting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {isDecrypting ? "Decrypting..." : "Decrypt"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared With Me */}
          {sharedDocuments.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4">Shared With Me ({sharedDocuments.length})</h3>
              <div className="space-y-4">
                {sharedDocuments.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          From: {doc.owner.slice(0, 6)}...{doc.owner.slice(-4)} • {doc.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        Shared
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecrypt(doc.id, doc.encryptedHash, true)}
                        disabled={isDecrypting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {isDecrypting ? "Decrypting..." : "Decrypt"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length === 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Found</h3>
              <p className="text-gray-600">You don't have any documents yet.</p>
              <p className="text-sm text-gray-500 mt-2">Upload documents or ask someone to share with you.</p>
            </div>
          )}
        </div>

        {/* Decryption Result */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Decrypted Content</h3>
          
          {decryptedContent ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <span>✅</span>
                  <span className="font-medium">Successfully Decrypted</span>
                </div>
                <p className="text-sm text-green-700">
                  This content was securely decrypted with proper authorization
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {decryptedContent}
                </pre>
              </div>
              
              <button
                onClick={() => setDecryptedContent("")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔐</div>
              <p>No document decrypted</p>
              <p className="text-sm">Select a document to decrypt its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDecryptPage;
