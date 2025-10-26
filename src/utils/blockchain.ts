import { ethers } from "ethers";

export const CONTRACT_ABI = [
  "function storeDocument(string docId, string encryptedHash) public",
  "function grantDocumentAccess(address user, string docId) public",
  "function createVault(uint256 unlockDelay) public payable returns (uint256)",
  "function depositToVault(uint256 vaultId) public payable",
  "function requestWithdrawal(uint256 vaultId, uint256 amount) public",
  "function approveWithdrawal(uint256 vaultId) public",
  "function executeWithdrawal(uint256 vaultId) public",
  "function connectAssets(string docId, uint256 vaultId) public",
  "function getDocument(string docId) public view returns (string encryptedHash, address owner, uint256 timestamp, bool hasAccess)",
  "function getVaultInfo(uint256 vaultId) public view returns (address owner, uint256 balance, uint256 unlockTime, address[] guardians, bool isGuardian, bool hasPendingWithdrawal, uint256 pendingApprovals)",
  "function addGuardian(uint256 vaultId, address guardian) public",
  "function hasDocumentAccess(address user, string docId) public view returns (bool)",
  "function getVaultBalance(uint256 vaultId) public view returns (uint256)",
  "function isVaultLocked(uint256 vaultId) public view returns (bool)"
];

export const CONTRACT_ADDRESS = "0xc840f946A4f39102127735b727A807d305FE145C";

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error("No Ethereum provider found");
};

export const getContract = async () => {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const formatAddress = (addr: string) => {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const formatBalance = (balance: bigint) => {
  return `${ethers.formatEther(balance)} BDAG`;
};
