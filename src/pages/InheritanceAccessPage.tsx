import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract, formatAddress } from "../utils/blockchain";

interface AccessRequest {
  id: string;
  documentId: string;
  documentName: string;
  requester: string;
  relationship: string;
  reason: string;
  timestamp: Date;
  status: "pending" | "approved" | "rejected" | "time-locked";
  approvals: string[];
  requiredApprovals: number;
  unlockTime?: Date;
}

interface InheritanceDocument {
  id: string;
  name: string;
  owner: string;
  timestamp: Date;
  isTimeLocked: boolean;
  unlockTime?: Date;
  guardians: string[];
}

const InheritanceAccessPage = () => {
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [inheritanceDocs, setInheritanceDocs] = useState<InheritanceDocument[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [isGuardian, setIsGuardian] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({
    documentId: "",
    relationship: "",
    reason: ""
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Storage keys for user-specific data
  const DOCS_STORAGE_KEY = 'owlvault_inheritance_docs';
  const REQUESTS_STORAGE_KEY = 'owlvault_access_requests';

  useEffect(() => {
    checkWallet();
  }, []);

  useEffect(() => {
    if (account) {
      loadInheritanceData();
    } else {
      setInheritanceDocs([]);
      setAccessRequests([]);
      setIsGuardian(false);
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

  const getAllDocuments = (): Record<string, InheritanceDocument> => {
    try {
      const stored = localStorage.getItem(DOCS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading documents from storage:", error);
      return {};
    }
  };

  const getAllRequests = (): Record<string, AccessRequest> => {
    try {
      const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading requests from storage:", error);
      return {};
    }
  };

  const saveDocument = (doc: InheritanceDocument) => {
    try {
      const allDocs = getAllDocuments();
      allDocs[doc.id] = {
        ...doc,
        timestamp: doc.timestamp.toISOString(),
        unlockTime: doc.unlockTime?.toISOString()
      };
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(allDocs));
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  const saveRequest = (request: AccessRequest) => {
    try {
      const allRequests = getAllRequests();
      allRequests[request.id] = {
        ...request,
        timestamp: request.timestamp.toISOString(),
        unlockTime: request.unlockTime?.toISOString()
      };
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(allRequests));
    } catch (error) {
      console.error("Error saving request:", error);
    }
  };

  const loadInheritanceData = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const allDocs = getAllDocuments();
      const allRequests = getAllRequests();
      
      const userDocs: InheritanceDocument[] = [];
      const userRequests: AccessRequest[] = [];
      let userIsGuardian = false;

      // Filter documents for current user
      Object.values(allDocs).forEach((doc: any) => {
        const document: InheritanceDocument = {
          ...doc,
          timestamp: new Date(doc.timestamp),
          unlockTime: doc.unlockTime ? new Date(doc.unlockTime) : undefined
        };

        // Show document if user is owner or guardian
        const isOwner = document.owner.toLowerCase() === account.toLowerCase();
        const isGuardianForDoc = document.guardians.some(guardian => 
          guardian.toLowerCase() === account.toLowerCase()
        );

        if (isOwner || isGuardianForDoc) {
          userDocs.push(document);
        }

        // Check if user is guardian for any document
        if (isGuardianForDoc) {
          userIsGuardian = true;
        }
      });

      // Filter requests for current user
      Object.values(allRequests).forEach((req: any) => {
        const request: AccessRequest = {
          ...req,
          timestamp: new Date(req.timestamp),
          unlockTime: req.unlockTime ? new Date(req.unlockTime) : undefined
        };

        // Show request if user is requester or guardian for the document
        const isRequester = request.requester.toLowerCase() === account.toLowerCase();
        const doc = allDocs[request.documentId];
        const isGuardianForDoc = doc && doc.guardians.some(guardian => 
          guardian.toLowerCase() === account.toLowerCase()
        );

        if (isRequester || isGuardianForDoc) {
          userRequests.push(request);
        }
      });

      // If no documents exist for this user, create some sample data
      if (userDocs.length === 0 && account) {
        // Create sample inheritance documents based on user address
        const sampleDocs = createSampleInheritanceData(account);
        sampleDocs.forEach(doc => {
          saveDocument(doc);
          userDocs.push(doc);
          
          // Check if user is guardian for any sample document
          if (doc.guardians.some(guardian => guardian.toLowerCase() === account.toLowerCase())) {
            userIsGuardian = true;
          }
        });
      }

      setInheritanceDocs(userDocs);
      setAccessRequests(userRequests);
      setIsGuardian(userIsGuardian);

    } catch (error) {
      console.error("Error loading inheritance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleInheritanceData = (userAddress: string): InheritanceDocument[] => {
    // Create user-specific sample data based on address
    const addressHash = userAddress.slice(2, 10);
    const baseId = parseInt(addressHash, 16) % 1000;
    
    // Different users get different sample data
    return [
      {
        id: `doc_will_${baseId + 1}`,
        name: "Last Will & Testament",
        owner: userAddress, // User owns this document
        timestamp: new Date("2024-01-15"),
        isTimeLocked: true,
        unlockTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        guardians: [
          "0x893a35Cc6634C0532925a3b8D9a1F2E1C1D3a1c3", // Different guardian for each user
          "0x742d35Cc6634C0532925a3b8D9a1F2E1C1D3a1c3"
        ]
      },
      {
        id: `doc_business_${baseId + 2}`,
        name: "Business Succession Plan",
        owner: "0x893a35Cc6634C0532925a3b8D9a1F2E1C1D3a1c3", // Someone else owns this
        timestamp: new Date("2024-02-01"),
        isTimeLocked: false,
        guardians: [
          userAddress, // Current user is guardian for this document
          "0x742d35Cc6634C0532925a3b8D9a1F2E1C1D3a1c3"
        ]
      }
    ];
  };

  const handleApprove = async (requestId: string) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const allRequests = getAllRequests();
      const request = allRequests[requestId];
      
      if (request && !request.approvals.includes(account)) {
        const newApprovals = [...request.approvals, account];
        const newStatus = newApprovals.length >= request.requiredApprovals ? "approved" : "pending";
        
        const updatedRequest: AccessRequest = {
          ...request,
          approvals: newApprovals,
          status: newStatus,
          timestamp: new Date(request.timestamp)
        };
        
        saveRequest(updatedRequest);
        
        // Update local state
        setAccessRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? updatedRequest
              : req
          )
        );

        if (request.approvals.length === 0) {
          // First approval - need one more
          alert("Approval submitted! One more guardian approval required.");
        } else {
          alert("Access granted! The requester can now decrypt the document.");
        }
      }
    } catch (error) {
      alert("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!confirm("Are you sure you want to reject this access request?")) {
      return;
    }

    try {
      const allRequests = getAllRequests();
      const request = allRequests[requestId];
      
      if (request) {
        const updatedRequest: AccessRequest = {
          ...request,
          status: "rejected",
          timestamp: new Date(request.timestamp)
        };
        
        saveRequest(updatedRequest);
        
        setAccessRequests(prev => 
          prev.map(req => 
            req.id === requestId ? updatedRequest : req
          )
        );
        alert("Access request rejected.");
      }
    } catch (error) {
      alert("Failed to reject request");
    }
  };

  const handleSubmitRequest = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!newRequest.documentId || !newRequest.relationship || !newRequest.reason) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const allDocs = getAllDocuments();
      const doc = allDocs[newRequest.documentId];
      
      if (!doc) {
        alert("Document not found");
        return;
      }

      // Check if user is guardian for this document (can't request access to own documents)
      const isGuardianForDoc = doc.guardians.some(guardian => 
        guardian.toLowerCase() === account.toLowerCase()
      );
      
      if (doc.owner.toLowerCase() === account.toLowerCase()) {
        alert("You are the owner of this document - no need to request access");
        return;
      }

      if (!isGuardianForDoc) {
        alert("You are not a guardian for this document");
        return;
      }

      if (doc.isTimeLocked && doc.unlockTime && new Date() < doc.unlockTime) {
        alert("This document is time-locked and cannot be accessed yet");
        return;
      }

      const newRequestObj: AccessRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        documentId: newRequest.documentId,
        documentName: doc.name,
        requester: account,
        relationship: newRequest.relationship,
        reason: newRequest.reason,
        timestamp: new Date(),
        status: "pending",
        approvals: [],
        requiredApprovals: Math.ceil(doc.guardians.length * 0.67), // 2/3 of guardians
        unlockTime: doc.unlockTime
      };

      saveRequest(newRequestObj);
      setAccessRequests(prev => [newRequestObj, ...prev]);
      setNewRequest({ documentId: "", relationship: "", reason: "" });
      
      alert("Access request submitted! Guardians will be notified.");
    } catch (error) {
      alert("Failed to submit request");
    }
  };

  const canAccessDocument = (doc: InheritanceDocument): boolean => {
    if (!doc.isTimeLocked) return true;
    if (!doc.unlockTime) return true;
    return new Date() >= doc.unlockTime;
  };

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inheritance Access Management</h1>
          <p className="text-gray-600">Manage access to time-locked documents and handle inheritance requests</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-6">⚖️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Required</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Please connect your wallet to manage inheritance access and guardian responsibilities.
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
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const userDocuments = inheritanceDocs.filter(doc => doc.owner.toLowerCase() === account.toLowerCase());
  const guardianDocuments = inheritanceDocs.filter(doc => 
    doc.owner.toLowerCase() !== account.toLowerCase() && 
    doc.guardians.some(guardian => guardian.toLowerCase() === account.toLowerCase())
  );

  const userRequests = accessRequests.filter(req => req.requester.toLowerCase() === account.toLowerCase());
  const pendingGuardianRequests = accessRequests.filter(req => 
    req.status === "pending" && 
    req.requester.toLowerCase() !== account.toLowerCase()
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inheritance Access Management</h1>
        <p className="text-gray-600">Manage access to time-locked documents and handle inheritance requests</p>
        <div className="mt-2 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-700 text-sm font-medium">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Documents & Requests */}
        <div className="space-y-6">
          {/* Request Access */}
          {guardianDocuments.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Request Document Access</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Document
                  </label>
                  <select
                    value={newRequest.documentId}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, documentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a document...</option>
                    {guardianDocuments.map(doc => (
                      <option key={doc.id} value={doc.id} disabled={!canAccessDocument(doc)}>
                        {doc.name} {doc.isTimeLocked && !canAccessDocument(doc) ? "(Time-locked)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Relationship
                  </label>
                  <input
                    type="text"
                    value={newRequest.relationship}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Son, Daughter, Executor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Access
                  </label>
                  <textarea
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Explain why you need access to this document..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSubmitRequest}
                  disabled={!newRequest.documentId || !newRequest.relationship || !newRequest.reason}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Submit Access Request
                </button>
              </div>
            </div>
          )}

          {/* My Requests */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">My Access Requests ({userRequests.length})</h3>
            
            {userRequests.length > 0 ? (
              <div className="space-y-4">
                {userRequests.map(request => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{request.documentName}</p>
                        <p className="text-sm text-gray-500">{request.relationship}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        request.status === "approved" ? "bg-green-100 text-green-700" :
                        request.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{request.reason}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Approvals: {request.approvals.length}/{request.requiredApprovals}</span>
                      <span>{request.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-sm">No access requests submitted</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Guardian Dashboard */}
        <div className="space-y-6">
          {isGuardian ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Guardian Dashboard</h3>
                <p className="text-blue-700">
                  You are a guardian for {guardianDocuments.length} document(s). Review and approve access requests below.
                </p>
              </div>

              {pendingGuardianRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Pending Approval Requests ({pendingGuardianRequests.length})</h3>
                  
                  <div className="space-y-4">
                    {pendingGuardianRequests.map(request => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{request.documentName}</p>
                            <p className="text-sm text-gray-500">
                              Requested by: {formatAddress(request.requester)} ({request.relationship})
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">{request.reason}</p>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500">
                              Approvals: {request.approvals.length}/{request.requiredApprovals}
                            </p>
                            <p className="text-xs text-gray-500">
                              {request.timestamp.toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingGuardianRequests.length === 0 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-600">All caught up! No access requests need your approval.</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Not a Guardian</h3>
              <p className="text-gray-600 mb-4">
                You are not designated as a guardian for any inheritance documents.
              </p>
              <p className="text-sm text-gray-500">
                Guardians are appointed by document owners to manage access to time-locked documents.
              </p>
            </div>
          )}

          {/* Inheritance Documents */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Inheritance Documents ({inheritanceDocs.length})
            </h3>
            
            <div className="space-y-4">
              {userDocuments.map(doc => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        Owner: You • {doc.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {doc.isTimeLocked && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          canAccessDocument(doc) ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {canAccessDocument(doc) ? "Unlocked" : "Time-locked"}
                        </span>
                      )}
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {doc.guardians.length} Guardians
                      </span>
                    </div>
                  </div>

                  {doc.isTimeLocked && doc.unlockTime && !canAccessDocument(doc) && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-xs text-orange-700">
                        🔒 Available on {doc.unlockTime.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {guardianDocuments.map(doc => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        Owner: {formatAddress(doc.owner)} • {doc.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {doc.isTimeLocked && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          canAccessDocument(doc) ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {canAccessDocument(doc) ? "Unlocked" : "Time-locked"}
                        </span>
                      )}
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        You are Guardian
                      </span>
                    </div>
                  </div>

                  {doc.isTimeLocked && doc.unlockTime && !canAccessDocument(doc) && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-xs text-orange-700">
                        🔒 Available on {doc.unlockTime.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {inheritanceDocs.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm">No inheritance documents found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InheritanceAccessPage;
