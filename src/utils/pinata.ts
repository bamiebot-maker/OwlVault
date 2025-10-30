import axios from "axios";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;
const PINATA_GATEWAY_URL = import.meta.env.VITE_PINATA_GATEWAY_URL;

export async function uploadFileToPinata(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return `${PINATA_GATEWAY_URL}/ipfs/${res.data.IpfsHash}`;
}

export async function uploadJSONToPinata(jsonData: any) {
  const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonData, {
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return `${PINATA_GATEWAY_URL}/ipfs/${res.data.IpfsHash}`;
}
