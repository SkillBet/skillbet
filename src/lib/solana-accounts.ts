import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { env } from './env';

let connection: Connection | null = null;

function getDefaultRpcUrl(network: string): string {
  switch (network) {
    case 'mainnet-beta':
      return 'https://api.mainnet-beta.solana.com';
    case 'testnet':
      return 'https://api.testnet.solana.com';
    case 'devnet':
    default:
      return 'https://api.devnet.solana.com';
  }
}

function getConnection(): Connection {
  if (!connection) {
    // Fixed: Use NEXT_PUBLIC_SOLANA_RPC_URL instead of SOLANA_RPC_URL
    const rpcUrl = env.NEXT_PUBLIC_SOLANA_RPC_URL || getDefaultRpcUrl(env.NEXT_PUBLIC_SOLANA_NETWORK);
    connection = new Connection(rpcUrl, 'confirmed');
  }
  return connection;
}

export function getSolanaConnection(): Connection {
  return getConnection();
}

export function getKeypair(): Keypair {
  if (!env.SOLANA_PRIVATE_KEY) {
    throw new Error('SOLANA_PRIVATE_KEY not configured');
  }
  
  try {
    // Parse the private key array
    const secretKey = JSON.parse(env.SOLANA_PRIVATE_KEY);
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } catch (error) {
    throw new Error('Invalid SOLANA_PRIVATE_KEY format');
  }
}

export function getPublicKey(address: string): PublicKey {
  return new PublicKey(address);
}
