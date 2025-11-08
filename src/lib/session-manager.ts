'use client';

import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';

export class SessionManager {
  private sessionActive: boolean = false;
  private sessionBudget: number = 0;
  private usedBudget: number = 0;
  private connection: Connection;
  private houseWallet: PublicKey;

  constructor(connection: Connection, houseWallet: PublicKey) {
    this.connection = connection;
    this.houseWallet = houseWallet;
  }

  // Start a session - user approves a budget
  async startSession(
    playerPublicKey: PublicKey, 
    budgetSOL: number,
    signTransaction: any
  ): Promise<boolean> {
    try {
      // Create transaction to approve session budget
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: playerPublicKey,
          toPubkey: this.houseWallet,
          lamports: budgetSOL * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = playerPublicKey;

      const signed = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signed.serialize());
      await this.connection.confirmTransaction(signature);

      this.sessionActive = true;
      this.sessionBudget = budgetSOL;
      this.usedBudget = 0;

      return true;
    } catch (error) {
      console.error('Failed to start session:', error);
      return false;
    }
  }

  // Place a bet from session budget (no signing needed!)
  placeBet(amount: number): boolean {
    if (!this.sessionActive) return false;
    if (this.usedBudget + amount > this.sessionBudget) return false;
    
    this.usedBudget += amount;
    return true;
  }

  // Refund bet (when player wins)
  refundBet(amount: number) {
    this.usedBudget -= amount;
    if (this.usedBudget < 0) this.usedBudget = 0;
  }

  // Check if session is still active
  isActive(): boolean {
    return this.sessionActive && this.usedBudget < this.sessionBudget;
  }

  // Get remaining budget
  getRemainingBudget(): number {
    return this.sessionBudget - this.usedBudget;
  }

  // End session
  endSession() {
    this.sessionActive = false;
    this.sessionBudget = 0;
    this.usedBudget = 0;
  }

  getSessionInfo() {
    return {
      active: this.sessionActive,
      budget: this.sessionBudget,
      used: this.usedBudget,
      remaining: this.sessionBudget - this.usedBudget,
    };
  }
}
