# 🦉 OwlVault – Decentralized Multi-Signature & Encrypted Document Vault on BlockDAG

> **"Secure access, shared wisely."**

OwlVault is a decentralized access control and document vault built on the **BlockDAG ecosystem**.  
It combines **multi-signature smart contracts**, **encrypted document sharing**, and **granular permissions** to ensure data security and trustless collaboration.

---

## 🚀 Project Overview

**Problem:**  
In traditional systems, sensitive records like insurance policies, legal contracts, or identity documents can be lost, altered, or accessed by unauthorized parties.  
These issues cause massive financial and trust damage.

**Our Solution:**  
OwlVault leverages **BlockDAG’s distributed ledger** to ensure every document access, approval, or change is **immutable and transparent**, while protecting content with **end-to-end encryption**.

---

## 🧠 Core Features

### 👥 Vault Guardians Management
- Create **multi-signature vaults** for sensitive data.
- Add/remove **guardians** with 2-of-3 approval security.
- Real blockchain integration with **demo fallback** for offline presentation.

### 📄 Document Access Control
- Grant encrypted file access to selected wallet addresses.
- Define roles — *Viewer*, *Editor*, or *Approver*.
- Smart contract ensures access control integrity.

### 🧩 Security Architecture
- AES-256 encryption for documents.
- Private key–based access permissions.
- Immutable on-chain activity logging.

---

## 🎯 Demo Flow (for Hackathon Judges)

1. **Create a Vault**  
   → Initialize a new secure storage vault.

2. **Add Guardians**  
   → Assign 3 trusted wallets as co-owners.

3. **Grant Access to Document**  
   → Upload a mock policy or record and grant wallet access.

4. **Simulate 2/3 Approval**  
   → Two guardians approve access; one declines.

5. **Unlock Document**  
   → Decryption happens only after multi-signature validation.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React + Vite |
| Blockchain | BlockDAG Testnet |
| Smart Contracts | Solidity  |
| Encryption | AES + Web Crypto API |
| Wallet Integration | MetaMask |
| Hosting | Vercel |
| Version Control | GitHub |

---

## 🧪 Run Locally

```bash
# Clone repository
git clone https://github.com/bamiebot-maker/OwlVault.git
cd owlvault

# Install dependencies
npm install

# Run the development server
npm run dev
🟢 Visit the app on: http://localhost:5173

🦾 Smart Contract Features
createVault() → Initializes a new vault with guardians.

grantAccess() → Grants a wallet temporary or permanent access.

approveRequest() → Guardian approval (requires 2 of 3).

revokeAccess() → Removes access rights from a wallet.

logActivity() → Immutable event logging.

🧠 Future Upgrades
🔐 On-chain file storage with IPFS integration.

🪙 Policy-based NFT representation for audit tracking.

📱 Mobile-first version for organizations and insurance brokers.

🏁 Hackathon Deliverables
✅ Fully functional DApp (frontend + smart contract)
✅ Complete access control demo
✅ 2-min explainer video
✅ Technical README
✅ Professional UI

👥 Team EagleDevs
🦉 Innovation through security.

Role	Name
Project Lead / Fullstack Dev	Ibrahim Bamidele
Smart Contract Dev	Ibrahim Bamidele
Frontend Developer	Makama Joses
Product Designer	Naimah Abdulzeez

📜 License
MIT License © 2025 EagleDevs

