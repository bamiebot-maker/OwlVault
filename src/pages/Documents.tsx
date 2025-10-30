import React, { useState, useEffect } from 'react';
import { useOwlVault } from '../hooks/useOwlVault';
import UploadDocumentModal from '../components/Modals/UploadDocumentModal';

const Documents: React.FC = () => {
  const { account, getMyDocuments } = useOwlVault();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadDocuments = async () => {
    if (!account) return;
    
    setLoading(true);
    const result = await getMyDocuments();
    if (result.success) {
      setDocuments(result.documents || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, [account]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="glass rounded-2xl p-6 lg:p-8 mb-8 border border-blue-500/20">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">My Documents</h1>
              <p className="text-blue-200 text-lg">
                Manage your encrypted documents and access controls
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 border border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
            >
              Upload Document
            </button>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="glass rounded-2xl p-8 text-center border border-blue-500/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-blue-300">Loading your documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-blue-500/20">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Documents Yet</h2>
            <p className="text-blue-300 mb-6">
              Upload your first encrypted document to secure your digital assets
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 border border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="glass rounded-xl p-6 border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Document #{doc.id}</h3>
                      <p className="text-blue-300 text-sm">Encrypted & Secure</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    Active
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-blue-300 text-sm">IPFS Hash</p>
                    <p className="text-white font-mono text-xs truncate">{doc.ipfsHash}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Owner</p>
                    <p className="text-white font-mono text-xs truncate">{doc.owner}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 border border-blue-500/30">
                    View Details
                  </button>
                  <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 border border-green-500/30">
                    Manage Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={loadDocuments}
      />
    </div>
  );
};

export default Documents;
