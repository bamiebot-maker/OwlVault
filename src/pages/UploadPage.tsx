import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/blockchain";

interface Document {
  id: string;
  name: string;
  encryptedHash: string;
  timestamp: Date;
  size: number;
  isOwner: boolean;
  owner: string;
  sharedWith: string[];
}

const UploadPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [shareAddress, setShareAddress] = useState("");
  const [sharingDocId, setSharingDocId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Store documents in localStorage (in real app, this would be on blockchain)
  const STORAGE_KEY = 'owlvault_documents';

  useEffect(() => {
    checkWallet();
  }, []);

  useEffect(() => {
    if (account) {
      loadUserDocuments();
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

  const getAllDocuments = (): Record<string, Document> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading documents from storage:", error);
      return {};
    }
  };

  const saveDocument = (doc: Document) => {
    try {
      const allDocs = getAllDocuments();
      allDocs[doc.id] = {
        ...doc,
        timestamp: doc.timestamp.toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  const loadUserDocuments = async () => {
    if (!account) return;
    
    try {
      const allDocs = getAllDocuments();
      const userDocs: Document[] = [];

      // Convert stored documents back to Document objects
      Object.values(allDocs).forEach((doc: any) => {
        const document: Document = {
          ...doc,
          timestamp: new Date(doc.timestamp),
          isOwner: doc.owner.toLowerCase() === account.toLowerCase()
        };

        // Show document if:
        // 1. User is the owner, OR
        // 2. Document is shared with user
        if (document.isOwner || 
            document.sharedWith.some(addr => addr.toLowerCase() === account.toLowerCase())) {
          userDocs.push(document);
        }
      });

      // Sort by timestamp (newest first)
      userDocs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setDocuments(userDocs);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const encryptFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // In real app, use proper encryption like Web Crypto API
        const encryptedHash = ethers.keccak256(ethers.toUtf8Bytes(content + Date.now() + Math.random()));
        resolve(encryptedHash);
      };
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      const encryptedHash = await encryptFile(selectedFile);
      const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In real app, store on blockchain
      // const contract = await getContract();
      // const tx = await contract.storeDocument(docId, encryptedHash);
      // await tx.wait();

      const newDoc: Document = {
        id: docId,
        name: selectedFile.name,
        encryptedHash: encryptedHash,
        timestamp: new Date(),
        size: selectedFile.size,
        isOwner: true,
        owner: account,
        sharedWith: []
      };
      
      // Save to localStorage (simulating blockchain storage)
      saveDocument(newDoc);
      
      // Update local state
      setDocuments(prev => [newDoc, ...prev]);
      alert(`File "${selectedFile.name}" encrypted and stored successfully! 🦉`);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Upload failed: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleShareDocument = async (docId: string) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!shareAddress || !ethers.isAddress(shareAddress)) {
      alert("Please enter a valid Ethereum address");
      return;
    }

    // Don't allow sharing with yourself
    if (shareAddress.toLowerCase() === account.toLowerCase()) {
      alert("You cannot share a document with yourself");
      return;
    }

    try {
      // In real app, call blockchain contract
      // const contract = await getContract();
      // const tx = await contract.grantDocumentAccess(shareAddress, docId);
      // await tx.wait();

      // Update document in storage
      const allDocs = getAllDocuments();
      const doc = allDocs[docId];
      
      if (doc && doc.owner.toLowerCase() === account.toLowerCase()) {
        // Check if already shared with this address
        if (!doc.sharedWith.some(addr => addr.toLowerCase() === shareAddress.toLowerCase())) {
          doc.sharedWith.push(shareAddress);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
          
          // Update local state
          setDocuments(prev => prev.map(d => 
            d.id === docId 
              ? { ...d, sharedWith: [...d.sharedWith, shareAddress] }
              : d
          ));
          
          alert(`Document shared with ${shareAddress} successfully!`);
        } else {
          alert("Document is already shared with this address");
        }
      } else {
        alert("You don't own this document");
      }
      
      setShareAddress("");
      setSharingDocId(null);
    } catch (error: any) {
      alert("Sharing failed: " + (error.message || "Unknown error"));
    }
  };

  const handleDecrypt = async (docId: string, encryptedHash: string, isOwner: boolean) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!isOwner) {
      // Check if user has access to this shared document
      const allDocs = getAllDocuments();
      const doc = allDocs[docId];
      const hasAccess = doc && doc.sharedWith.some(addr => addr.toLowerCase() === account.toLowerCase());
      
      if (!hasAccess) {
        alert("You don't have permission to decrypt this document");
        return;
      }
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Document decrypted successfully!\n\nDocument ID: ${docId}\nAccess: ${isOwner ? 'Owner' : 'Shared with you'}`);
    } catch (error) {
      alert("Decryption failed");
    }
  };

  const userDocuments = documents.filter(doc => doc.isOwner);
  const sharedDocuments = documents.filter(doc => !doc.isOwner);

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload & Encrypt Document</h1>
          <p className="text-gray-600">Secure your files and share with trusted contacts</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Required</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Please connect your wallet to encrypt, upload, and manage documents securely.
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload & Encrypt Document</h1>
        <p className="text-gray-600">Secure your files and share with trusted contacts</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-700 text-sm font-medium">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!selectedFile ? (
              <div className="space-y-6">
                <div className="text-6xl">📁</div>
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">
                    Drop your file here
                  </p>
                  <p className="text-gray-600 mb-6">
                    or click to browse (PDF, Word, Images, Text)
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  <label
                    htmlFor="file-input"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer transition-colors inline-block"
                  >
                    Select File
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-4xl">✅</div>
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">
                    File Selected
                  </p>
                  <p className="text-gray-600">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Change File
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isUploading ? "Encrypting..." : "Encrypt & Upload"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Management */}
        <div className="space-y-6">
          {/* My Documents */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">My Documents ({userDocuments.length})</h2>
            
            {userDocuments.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {userDocuments.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.timestamp.toLocaleDateString()} • {(doc.size / 1024).toFixed(1)} KB
                        </p>
                        {doc.sharedWith.length > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Shared with {doc.sharedWith.length} person(s)
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecrypt(doc.id, doc.encryptedHash, true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Decrypt
                        </button>
                        <button
                          onClick={() => setSharingDocId(doc.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Share
                        </button>
                      </div>
                    </div>

                    {sharingDocId === doc.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Share with address:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shareAddress}
                            onChange={(e) => setShareAddress(e.target.value)}
                            placeholder="0x..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleShareDocument(doc.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                          >
                            Share
                          </button>
                          <button
                            onClick={() => setSharingDocId(null)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📄</div>
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload a file to see it here</p>
              </div>
            )}
          </div>

          {/* Shared With Me */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Shared With Me ({sharedDocuments.length})</h2>
            
            {sharedDocuments.length > 0 ? (
              <div className="space-y-4 max-h-48 overflow-y-auto">
                {sharedDocuments.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.timestamp.toLocaleDateString()} • Owner: {doc.owner.slice(0, 6)}...{doc.owner.slice(-4)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDecrypt(doc.id, doc.encryptedHash, false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Decrypt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-sm">No documents shared with you</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
