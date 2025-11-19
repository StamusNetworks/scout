/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PATH: string;
  readonly VITE_APP_PATH: string;
  readonly VITE_APP_MODE: 'development' | 'production';
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
