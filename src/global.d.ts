/// <reference types="vite/client" />

interface Window {
  ethereum?: any;
}

interface ImportMetaEnv {
  readonly VITE_PINATA_API_KEY: string;
  readonly VITE_PINATA_SECRET_API_KEY: string;
  readonly VITE_PINATA_GATEWAY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
