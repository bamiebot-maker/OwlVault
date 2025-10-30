import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const OWL_VAULT_ABI = [
  "function createVault(address[3] calldata, address, string calldata) returns (uint256)",
  "function approveVault(uint256) external",
  "function createDocument(string calldata) returns (uint256)",
  "function grantDocumentAccess(uint256, address) external",
  "function revokeDocumentAccess(uint256, address) external",
  "function getMyVaults() view returns (uint256[])",
  "function getMyDocuments() view returns (uint256[])",
  "function getGuardianVaults() view returns (uint256[])",
  "function hasVaultAccess(uint256, address) view returns (bool)",
  "function hasDocumentAccess(uint256, address) view returns (bool)",
  "function getVaultDetails(uint256) view returns (address, address[3] memory, address, string memory, uint8, bool)",
  "function getDocumentDetails(uint256) view returns (address, string)",
  "event VaultCreated(uint256 indexed vaultId, address indexed owner, address[3] guardians, address beneficiary, string ipfsHash)",
  "event DocumentCreated(uint256 indexed docId, address indexed owner, string ipfsHash)"
];

// BlockDAG Network Configuration
const BLOCKDAG_CONFIG = {
  chainId: '0x413', // 1043 in hexadecimal
  chainName: 'BlockDAG Awakening',
  rpcUrls: ['https://relay.awakening.bdagscan.com'],
  blockExplorerUrls: ['https://awakening.bdagscan.com'],
  nativeCurrency: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18,
  },
};

export const useOwlVault = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

  // Function to switch to BlockDAG network
  const switchToBlockDAGNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    try {
      // Try to switch to BlockDAG network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKDAG_CONFIG.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add BlockDAG network to MetaMask
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BLOCKDAG_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add BlockDAG network:', addError);
          throw new Error('Failed to add BlockDAG network to MetaMask');
        }
      } else {
        console.error('Failed to switch to BlockDAG network:', switchError);
        throw new Error('Failed to switch to BlockDAG network');
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        setNetworkError(null);
        setIsDisconnected(false); // Reset disconnect state

        console.log('Starting wallet connection...');

        // First, ensure we're on BlockDAG network
        console.log('Switching to BlockDAG network...');
        await switchToBlockDAGNetwork();

        const provider = new ethers.BrowserProvider(window.ethereum);

        // Check current network
        const network = await provider.getNetwork();
        console.log('Connected to network:', network.name, network.chainId);

        // Always request accounts to ensure fresh connection
        console.log('Requesting accounts...');
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts.length === 0) {
          throw new Error('No accounts found - user denied connection');
        }

        const signer = await provider.getSigner();
        const account = await signer.getAddress();

        console.log('Account connected:', account);

        if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x...' && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
          const contract = new ethers.Contract(CONTRACT_ADDRESS, OWL_VAULT_ABI, signer);
          setContract(contract);
          console.log('Contract instance created');
        }

        setProvider(provider);
        setSigner(signer);
        setAccount(account);

        console.log('Wallet connected successfully to BlockDAG Awakening:', account);
        return { success: true, account };
      } catch (error) {
        console.error("Connection error:", error);
        const errorMessage = (error as Error).message;
        setNetworkError(errorMessage);
        setIsDisconnected(true);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    } else {
      const errorMessage = "MetaMask not installed";
      setNetworkError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet...');
    setContract(null);
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setNetworkError(null);
    setIsDisconnected(true);

    // Clear any stored connection state
    localStorage.removeItem('walletConnected');
    sessionStorage.removeItem('walletConnected');

    console.log('Wallet disconnected successfully');
  };

  // Check if wallet was previously connected
  const checkExistingConnection = async () => {
    if (typeof window.ethereum !== 'undefined' && !isDisconnected) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          console.log('Found existing connection, auto-connecting...');
          await connectWallet();
        }
      } catch (error) {
        console.error('Auto-connect error:', error);
      }
    }
  };

  // ============ VAULT FUNCTIONS ============

  const createVault = async (guardians: string[], beneficiary: string, ipfsHash: string) => {
    if (!contract) return { success: false, error: "Contract not connected" };

    try {
      setLoading(true);
      const tx = await contract.createVault(guardians, beneficiary, ipfsHash);
      await tx.wait();
      return { success: true, tx };
    } catch (error) {
      console.error("Create vault error:", error);
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const approveVault = async (vaultId: number) => {
    if (!contract) return { success: false, error: "Contract not connected" };

    try {
      setLoading(true);
      const tx = await contract.approveVault(vaultId);
      await tx.wait();
      return { success: true, tx };
    } catch (error) {
      console.error("Approve vault error:", error);
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const getMyVaults = async () => {
    if (!contract) return { success: false, error: "Contract not connected", vaults: [] };

    try {
      const vaultIds = await contract.getMyVaults();
      const vaults = [];

      for (let id of vaultIds) {
        const details = await contract.getVaultDetails(id);
        vaults.push({
          id: id.toString(),
          owner: details[0],
          guardians: details[1],
          beneficiary: details[2],
          ipfsHash: details[3],
          approvalCount: details[4],
          unlocked: details[5]
        });
      }

      return { success: true, vaults };
    } catch (error) {
      console.error("Get vaults error:", error);
      return { success: false, error: (error as Error).message, vaults: [] };
    }
  };

  const getGuardianVaults = async () => {
    if (!contract) return { success: false, error: "Contract not connected", vaults: [] };

    try {
      const vaultIds = await contract.getGuardianVaults();
      const vaults = [];

      for (let id of vaultIds) {
        const details = await contract.getVaultDetails(id);
        vaults.push({
          id: id.toString(),
          owner: details[0],
          guardians: details[1],
          beneficiary: details[2],
          ipfsHash: details[3],
          approvalCount: details[4],
          unlocked: details[5]
        });
      }

      return { success: true, vaults };
    } catch (error) {
      console.error("Get guardian vaults error:", error);
      return { success: false, error: (error as Error).message, vaults: [] };
    }
  };

  // ============ DOCUMENT FUNCTIONS ============

  const createDocument = async (ipfsHash: string) => {
    if (!contract) return { success: false, error: "Contract not connected" };

    try {
      setLoading(true);
      const tx = await contract.createDocument(ipfsHash);
      await tx.wait();
      return { success: true, tx };
    } catch (error) {
      console.error("Create document error:", error);
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const getMyDocuments = async () => {
    if (!contract) return { success: false, error: "Contract not connected", documents: [] };

    try {
      const docIds = await contract.getMyDocuments();
      const documents = [];

      for (let id of docIds) {
        const details = await contract.getDocumentDetails(id);
        documents.push({
          id: id.toString(),
          owner: details[0],
          ipfsHash: details[1]
        });
      }

      return { success: true, documents };
    } catch (error) {
      console.error("Get documents error:", error);
      return { success: false, error: (error as Error).message, documents: [] };
    }
  };

  const grantDocumentAccess = async (docId: number, user: string) => {
    if (!contract) return { success: false, error: "Contract not connected" };

    try {
      setLoading(true);
      const tx = await contract.grantDocumentAccess(docId, user);
      await tx.wait();
      return { success: true, tx };
    } catch (error) {
      console.error("Grant access error:", error);
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const revokeDocumentAccess = async (docId: number, user: string) => {
    if (!contract) return { success: false, error: "Contract not connected" };

    try {
      setLoading(true);
      const tx = await contract.revokeDocumentAccess(docId, user);
      await tx.wait();
      return { success: true, tx };
    } catch (error) {
      console.error("Revoke access error:", error);
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  // Auto-connect on component mount if wallet was previously connected
  useEffect(() => {
    checkExistingConnection();
  }, []);

  return {
    contract,
    account,
    loading,
    isDisconnected,
    networkError,
    connectWallet,
    disconnectWallet,
    createVault,
    approveVault,
    createDocument,
    grantDocumentAccess,
    revokeDocumentAccess,
    getMyVaults,
    getMyDocuments,
    getGuardianVaults
  };
};
