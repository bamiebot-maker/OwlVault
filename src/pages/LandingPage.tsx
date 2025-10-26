import { useState, useEffect } from "react";

const LandingPage = ({ onEnterApp }: { onEnterApp: () => void }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "Multi-Signature Security",
      description: "2/3 guardian approval required for withdrawals",
      icon: "🔒"
    },
    {
      title: "Encrypted Document Storage", 
      description: "Military-grade encryption for sensitive files",
      icon: "📄"
    },
    {
      title: "Time-Locked Vaults",
      description: "Set custom unlock periods for added security",
      icon: "⏰"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a]">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">🦉</span>
          </div>
          <span className="text-white text-2xl font-bold">OwlVault</span>
        </div>
        <button
          onClick={onEnterApp}
          className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/20"
        >
          Launch App
        </button>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="text-white">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Secure Your Digital
              <span className="block bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent">
                Assets
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Multi-signature cryptocurrency vaults and encrypted document storage 
              powered by BlockDAG blockchain. Enterprise-grade security for your 
              most valuable assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onEnterApp}
                className="bg-white text-[#1e3a8a] hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 Get Started
              </button>
              <button className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="h-64 flex flex-col justify-center">
              <div className="text-4xl mb-4 text-white">{features[currentFeature].icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {features[currentFeature].title}
              </h3>
              <p className="text-blue-100 text-lg">
                {features[currentFeature].description}
              </p>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentFeature ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
            <div className="text-2xl font-bold text-white mb-2">🔐</div>
            <div className="text-white text-3xl font-bold">256-bit</div>
            <div className="text-blue-200">Military Encryption</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
            <div className="text-2xl font-bold text-white mb-2">👥</div>
            <div className="text-white text-3xl font-bold">2/3</div>
            <div className="text-blue-200">Multi-Signature</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
            <div className="text-2xl font-bold text-white mb-2">⚡</div>
            <div className="text-white text-3xl font-bold">BlockDAG</div>
            <div className="text-blue-200">Powered</div>
          </div>
        </div>

        {/* BlockDAG Branding */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/20">
            <div className="w-8 h-8 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">BD</span>
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Built on BlockDAG Testnet</p>
              <p className="text-blue-200 text-sm">Secure • Fast • Scalable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-20"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            className="fill-current text-white"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            className="fill-current text-white"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-current text-white"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default LandingPage;
