import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { env } from '@/lib/env';

const connection = new Connection(env.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');

export async function POST(req: NextRequest) {
  try {
    const { winnerWallet, challengeId, score } = await req.json();

    // Verify this is a legit win (check your database, verify score, etc.)
    // TODO: Add your verification logic here

    // Get platform keypair (your wallet with funds)
    if (!env.SOLANA_PRIVATE_KEY) {
      throw new Error('Platform wallet not configured');
    }

    const platformKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(env.SOLANA_PRIVATE_KEY))
    );

    const winnerPublicKey = new PublicKey(winnerWallet);

    // Send 0.09 SOL to winner
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: platformKeypair.publicKey,
        toPubkey: winnerPublicKey,
        lamports: 0.09 * LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = platformKeypair.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Sign and send
    transaction.sign(platformKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature);

    return NextResponse.json({
      success: true,
      signature,
      message: 'Winner paid successfully!',
    });
  } catch (error) {
    console.error('Error paying winner:', error);
    return NextResponse.json(
      { error: 'Failed to pay winner' },
      { status: 500 }
    );
  }
}
