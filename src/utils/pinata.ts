import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadToIPFS = async (file: File) => {
  try {
    console.log('Uploading to IPFS via Pinata...', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        encrypted: 'true',
        timestamp: Date.now().toString(),
        app: 'OwlVault'
      }
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    console.log('Making request to Pinata...');
    
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${PINATA_JWT}`, // Using JWT instead of API key/secret
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY
        },
      }
    );
    
    console.log('IPFS Upload Success:', res.data);
    return { success: true, ipfsHash: res.data.IpfsHash };
    
  } catch (error: any) {
    console.error("IPFS upload error:", error);
    
    // Provide more detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      return { 
        success: false, 
        error: `Pinata error: ${error.response.status} - ${JSON.stringify(error.response.data)}` 
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Unknown IPFS upload error' 
    };
  }
};

export const encryptFile = async (file: File, password: string): Promise<Blob> => {
  // For now, return the original file (encryption can be added later)
  console.log('Encryption placeholder for file:', file.name);
  return new Blob([await file.arrayBuffer()], { type: file.type });
};

// Fallback function if JWT doesn't work
export const uploadToIPFSWithKeys = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY
        },
      }
    );
    
    return { success: true, ipfsHash: res.data.IpfsHash };
  } catch (error) {
    console.error("IPFS upload with keys error:", error);
    return { success: false, error: (error as Error).message };
  }
};
