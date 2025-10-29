'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function WalletProfileButton() {
  const { connected, publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      loadBalance();
    }
  }, [connected, publicKey]);

  const loadBalance = async () => {
    if (!publicKey) return;
    
    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        'confirmed'
      );
      const balanceLamports = await connection.getBalance(publicKey);
      setBalance(balanceLamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  if (!mounted || !connected || !publicKey) {
    return null;
  }

  return (
    <Link
      href="/profile"
      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 transition group"
    >
      {/* Avatar */}
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition">
        👤
      </div>
      
      {/* Wallet Info */}
      <div className="hidden md:block">
        <p className="text-white font-semibold text-sm leading-tight">
          {publicKey.toString().substring(0, 4)}...{publicKey.toString().slice(-4)}
        </p>
        <p className="text-gray-400 text-xs">
          {balance.toFixed(3)} SOL
        </p>
      </div>
      
      {/* Arrow */}
      <svg 
        className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
