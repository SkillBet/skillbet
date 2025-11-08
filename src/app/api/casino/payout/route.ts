import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { env } from '@/lib/env';

const connection = new Connection(env.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');

export async function POST(req: NextRequest) {
  try {
    const { winner, amount, game } = await req.json();

    // Get house keypair
    if (!env.SOLANA_PRIVATE_KEY) {
      throw new Error('House wallet not configured');
    }

    const houseKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(env.SOLANA_PRIVATE_KEY))
    );

    const winnerPublicKey = new PublicKey(winner);

    // Send payout
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: houseKeypair.publicKey,
        toPubkey: winnerPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = houseKeypair.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    transaction.sign(houseKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature);

    return NextResponse.json({
      success: true,
      signature,
      message: 'Payout sent!',
    });
  } catch (error) {
    console.error('Error sending payout:', error);
    return NextResponse.json(
      { error: 'Failed to send payout' },
      { status: 500 }
    );
  }
}
