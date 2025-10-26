import { useState, useEffect } from "react";

const LandingPage = ({ onEnterApp }: { onEnterApp: () => void }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "Multi-Signature Security",
      description: "Enterprise-grade protection with 2/3 guardian approval required for all withdrawals",
      icon: "🔒"
    },
    {
      title: "Encrypted Document Vault", 
      description: "Military-grade AES-256 encryption for your most sensitive files and documents",
      icon: "📄"
    },
    {
      title: "Time-Locked Inheritance",
      description: "Set custom unlock periods with multi-signature guardian oversight",
      icon: "⏰"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <span className="text-white text-xl font-bold">🦉</span>
          </div>
          <span className="text-white text-2xl font-light tracking-tight">OwlVault</span>
        </div>
        <button
          onClick={onEnterApp}
          className="relative bg-white/10 backdrop-blur-xl text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-white/20 border border-white/20 hover:border-white/40 hover:shadow-2xl hover:shadow-blue-500/20 group overflow-hidden"
        >
          <span className="relative z-10">Launch App</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/20 to-blue-500/0 transform -skew-x-12 transition-all duration-1000 group-hover:translate-x-full"></div>
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="text-white">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-200 text-sm font-medium">ENTERPRISE SECURITY PLATFORM</span>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light mb-6 leading-tight tracking-tight">
              Digital Legacy
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent font-semibold mt-2">
                Reimagined
              </span>
            </h1>
            
            <p className="text-xl text-blue-100/90 mb-8 leading-relaxed font-light max-w-2xl">
              The world's first multi-signature inheritance platform combining blockchain security 
              with military-grade encryption. Protect your digital assets and ensure seamless 
              transition to your heirs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onEnterApp}
                className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 overflow-hidden"
              >
                <span className="relative z-10">Secure Your Legacy</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-all duration-1000 group-hover:translate-x-full"></div>
              </button>
              
              <button className="bg-white/5 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300 group overflow-hidden">
                <span className="relative z-10">View Whitepaper</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/10 to-blue-500/0 transform -skew-x-12 transition-all duration-1000 group-hover:translate-x-full"></div>
              </button>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl shadow-blue-500/10">
              <div className="h-80 flex flex-col justify-center relative">
                <div className="text-5xl mb-6 text-center drop-shadow-2xl">
                  {features[currentFeature].icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 text-center">
                  {features[currentFeature].title}
                </h3>
                <p className="text-blue-100/80 text-lg text-center leading-relaxed font-light">
                  {features[currentFeature].description}
                </p>
                
                {/* Progress indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`w-8 h-1 rounded-full transition-all duration-500 ${
                        index === currentFeature 
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400/20 rounded-full blur-sm animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400/20 rounded-full blur-sm animate-bounce delay-1000"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl rounded-2xl p-8 border border-blue-400/20 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 group">
            <div className="text-3xl mb-4 text-cyan-300 group-hover:scale-110 transition-transform duration-300">🛡️</div>
            <div className="text-3xl font-bold text-white mb-2">AES-256</div>
            <div className="text-blue-200/80 font-light">Military Grade Encryption</div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-xl rounded-2xl p-8 border border-indigo-400/20 shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 group">
            <div className="text-3xl mb-4 text-purple-300 group-hover:scale-110 transition-transform duration-300">👑</div>
            <div className="text-3xl font-bold text-white mb-2">2/3 MFA</div>
            <div className="text-blue-200/80 font-light">Multi-Signature Protocol</div>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/20 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300 group">
            <div className="text-3xl mb-4 text-blue-300 group-hover:scale-110 transition-transform duration-300">⚡</div>
            <div className="text-3xl font-bold text-white mb-2">BlockDAG</div>
            <div className="text-blue-200/80 font-light">Next-Gen Blockchain</div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-2xl rounded-2xl px-8 py-6 border border-white/10 shadow-2xl shadow-blue-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white text-lg font-bold">BD</span>
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-lg">Powered by BlockDAG Testnet</p>
              <p className="text-blue-200/80 font-light">Secure • Scalable • Enterprise-Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-950/50 to-transparent"></div>
    </div>
  );
};

export default LandingPage;
