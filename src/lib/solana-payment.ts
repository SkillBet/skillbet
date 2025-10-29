import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { env } from './env';

const connection = new Connection(
  env.NEXT_PUBLIC_SOLANA_RPC_URL,
  'confirmed'
);

// Platform wallet (your wallet that receives fees)
const PLATFORM_WALLET = new PublicKey('YOUR_WALLET_ADDRESS_HERE'); // ← Add your wallet

// Entry fee: 0.1 SOL
export const ENTRY_FEE = 0.1 * LAMPORTS_PER_SOL;

// Prize pool: 90% of entry fee
export const PRIZE_AMOUNT = 0.09 * LAMPORTS_PER_SOL;

// Platform fee: 10%
export const PLATFORM_FEE = 0.01 * LAMPORTS_PER_SOL;

/**
 * Create a challenge - User pays entry fee
 */
export async function createChallenge(
  creatorPublicKey: PublicKey
): Promise<Transaction> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: creatorPublicKey,
      toPubkey: PLATFORM_WALLET,
      lamports: ENTRY_FEE,
    })
  );

  transaction.feePayer = creatorPublicKey;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  return transaction;
}

/**
 * Attempt a challenge - User pays entry fee
 */
export async function attemptChallenge(
  playerPublicKey: PublicKey
): Promise<Transaction> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: playerPublicKey,
      toPubkey: PLATFORM_WALLET,
      lamports: ENTRY_FEE,
    })
  );

  transaction.feePayer = playerPublicKey;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  return transaction;
}

/**
 * Pay winner - Platform sends prize to winner
 * This would be called from your backend with your platform wallet's private key
 */
export async function payWinner(
  winnerPublicKey: PublicKey
): Promise<{ signature: string }> {
  // TODO: This should be called from your backend API
  // with your platform wallet's private key
  // For security, NEVER expose private keys in frontend!
  
  return {
    signature: 'BACKEND_TRANSACTION_SIGNATURE',
  };
}

/**
 * Verify transaction on-chain
 */
export async function verifyTransaction(
  signature: string
): Promise<boolean> {
  try {
    const confirmation = await connection.confirmTransaction(signature);
    return !confirmation.value.err;
  } catch (error) {
    console.error('Transaction verification failed:', error);
    return false;
  }
}
