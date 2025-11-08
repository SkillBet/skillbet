import { NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function GET() {
  try {
    // Step 1: Connect to Solana blockchain[web:112][web:117]
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    
    // Step 2: Your house wallet address (replace with your actual wallet)
    const HOUSE_WALLET = '63vypu8B8fjnucMJcfabmBHj7aG9bD1rz2nK5VSj2MU4';
    const houseWalletPubkey = new PublicKey(HOUSE_WALLET);

    // Step 3: Get transaction signatures from your wallet[web:115][web:119]
    const signatures = await connection.getSignaturesForAddress(houseWalletPubkey, {
      limit: 100 // Get last 100 transactions
    });

    console.log(`Found ${signatures.length} transactions`);

    // Step 4: Calculate statistics from transactions
    let totalWagered = 0;
    let totalPaid = 0;
    let transactionCount = 0;
    let biggestTransaction = 0;

    // Go through each transaction[web:112][web:115]
    for (const sigInfo of signatures.slice(0, 50)) { // Check first 50 for speed
      try {
        // Get full transaction details[web:112]
        const tx = await connection.getTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0
        });

        if (tx && tx.meta) {
          // Calculate amount moved (in lamports, then convert to SOL)[web:117]
          const preBalance = tx.meta.preBalances[0] || 0;
          const postBalance = tx.meta.postBalances[0] || 0;
          const amount = Math.abs(preBalance - postBalance) / LAMPORTS_PER_SOL;

          if (amount > 0 && amount < 1000) { // Filter out weird amounts
            totalWagered += amount;
            
            if (amount > biggestTransaction) {
              biggestTransaction = amount;
            }
            
            transactionCount++;
          }
        }
      } catch (txError) {
        // Skip failed transactions
        console.log('Skipping transaction:', sigInfo.signature);
      }
    }

    // Step 5: Get current online players (simulated for now)
    // In real app, track this when users connect wallets
    const onlinePlayers = Math.floor(Math.random() * 30) + 5;

    // Step 6: Return the statistics[web:119]
    const stats = {
      totalWagered: parseFloat(totalWagered.toFixed(2)),
      gamesPlayed: transactionCount,
      biggestWin: parseFloat(biggestTransaction.toFixed(2)),
      onlinePlayers: onlinePlayers,
    };

    console.log('Stats calculated:', stats);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching Solana data:', error);
    
    // Return default values if error
    return NextResponse.json({
      totalWagered: 0,
      gamesPlayed: 0,
      biggestWin: 0,
      onlinePlayers: 0,
    });
  }
}

// Enable caching for 30 seconds to avoid rate limits[web:115]
export const revalidate = 30;
