// Simple environment variables - no external package needed
export const env = {
  // Solana Configuration
  SOLANA_PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY || '',
  NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
  
  // App Configuration
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Type-safe environment variables
export type Env = typeof env;
