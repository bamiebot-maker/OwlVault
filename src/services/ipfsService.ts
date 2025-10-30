class IPFSService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = import.meta.env.VITE_PINATA_API_KEY;
    const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

    if (apiKey && secretKey && apiKey !== '0f2aff45623d8ddf79e5') {
      this.isInitialized = true;
      console.log('Pinata IPFS service initialized successfully');
    } else {
      console.warn('Pinata API keys not found. Using mock IPFS service.');
      this.isInitialized = false;
    }
  }

  async uploadFile(file: File): Promise<{ success: boolean; ipfsHash?: string; error?: string }> {
    if (!this.isInitialized) {
      return this.mockUploadFile(file);
    }

    try {
      console.log('Uploading file to IPFS via Pinata:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          type: 'owlvault-document',
          timestamp: Date.now().toString(),
        }
      });
      formData.append('pinataMetadata', metadata);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
          'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_API_KEY
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('File uploaded to IPFS:', result.IpfsHash);
      return { success: true, ipfsHash: result.IpfsHash };
    } catch (error) {
      console.error('IPFS upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown IPFS upload error' 
      };
    }
  }

  async uploadJSON(data: any): Promise<{ success: boolean; ipfsHash?: string; error?: string }> {
    if (!this.isInitialized) {
      return this.mockUploadJSON();
    }

    try {
      console.log('Uploading JSON to IPFS via Pinata');
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
          'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_API_KEY
        },
        body: JSON.stringify({
          pinataMetadata: {
            name: 'vault-metadata.json',
            keyvalues: {
              type: 'owlvault-vault',
              timestamp: Date.now().toString(),
            }
          },
          pinataContent: data
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('JSON uploaded to IPFS:', result.IpfsHash);
      return { success: true, ipfsHash: result.IpfsHash };
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown IPFS upload error' 
      };
    }
  }

  private async mockUploadFile(file: File): Promise<{ success: boolean; ipfsHash?: string; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockHash = 'QmMock' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Mock IPFS upload - File:', file.name, 'Hash:', mockHash);
    
    return { 
      success: true, 
      ipfsHash: mockHash 
    };
  }

  private async mockUploadJSON(): Promise<{ success: boolean; ipfsHash?: string; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockHash = 'QmMock' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Mock IPFS upload - JSON data. Hash:', mockHash);
    
    return { 
      success: true, 
      ipfsHash: mockHash 
    };
  }

  getIPFSGatewayURL(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }
}

// Export the service instance
export const ipfsService = new IPFSService();
