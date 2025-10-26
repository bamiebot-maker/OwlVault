import { useState } from "react";

const UploadPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`File "${selectedFile.name}" encrypted and stored successfully! 🦉`);
      setSelectedFile(null);
    } catch (error) {
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Document</h1>
        <p className="text-gray-600">Securely encrypt and store your sensitive files</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
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

        {/* Security Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Client-Side Encryption</h3>
            <p className="text-sm text-gray-600">Files encrypted before leaving your device</p>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">🌐</div>
            <h3 className="font-semibold text-gray-900 mb-2">Blockchain Storage</h3>
            <p className="text-sm text-gray-600">Encrypted references stored on BlockDAG</p>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900 mb-2">Access Control</h3>
            <p className="text-sm text-gray-600">Grant access to specific wallets</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
