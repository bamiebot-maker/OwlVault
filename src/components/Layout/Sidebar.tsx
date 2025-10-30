import React, { useState, useEffect } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'vaults', label: 'My Vaults', icon: '🏦' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'guardian', label: 'Guardian Approvals', icon: '🛡️' },
  ];

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.sidebar') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Handle scroll for mobile header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🦉</div>
              <div>
                <h1 className="text-xl font-bold text-white">OwlVault</h1>
                <p className="text-blue-300 text-xs">Secure Legacy</p>
              </div>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-button bg-blue-500/20 hover:bg-blue-500/30 text-white p-2 rounded-lg transition-all duration-300 border border-blue-400/30"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile & Desktop */}
      <div className={`
        sidebar
        fixed lg:sticky
        top-0 left-0
        h-screen lg:h-screen
        w-80 lg:w-64
        transform transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-gradient-to-b from-[#0a0a1a] via-[#0f0f23] to-[#1a1a2e]
        border-r border-blue-500/20
        overflow-y-auto
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-blue-500/20">
          <div className="flex items-center space-x-3">
            <div className="text-3xl floating">🦉</div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">OwlVault</h1>
              <p className="text-blue-300 text-sm">Secure Digital Legacy</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-blue-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center px-4 py-4 rounded-xl
                  transition-all duration-300 group
                  ${activeTab === item.id
                    ? 'bg-blue-500/20 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30'
                    : 'text-blue-300 hover:text-white hover:bg-blue-500/10 hover:border hover:border-blue-400/20'
                  }
                `}
              >
                <span className={`
                  text-xl mr-3 transition-transform duration-300
                  ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}
                `}>
                  {item.icon}
                </span>
                <span className="font-medium text-left flex-1">{item.label}</span>
                {activeTab === item.id && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full ml-2 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-blue-500/20">
          {/* Status Indicator */}
          <div className="glass rounded-lg p-3 mb-4 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Connected</span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="glass rounded-lg p-3 text-center border border-blue-500/20">
            <p className="text-blue-300 text-xs">
              Secure • Encrypted • Decentralized
            </p>
          </div>
        </div>
      </div>

      {/* Mobile padding */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default Sidebar;
