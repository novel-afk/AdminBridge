/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare var process: {
  env: {
    NODE_ENV: string;
    [key: string]: string;
  }
}
