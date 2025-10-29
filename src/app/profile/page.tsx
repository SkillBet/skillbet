'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '@/components/WalletButton';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface GameHistory {
  id: string;
  challengeType: string;
  score: number;
  won: boolean;
  amount: number;
  timestamp: string;
}

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalEarnings: 0,
    totalSpent: 0,
    netProfit: 0,
    winRate: 0,
  });
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      loadProfileData();
    }
  }, [connected, publicKey]);

  const loadProfileData = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);

      // Get wallet balance
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        'confirmed'
      );
      const balanceLamports = await connection.getBalance(publicKey);
      setBalance(balanceLamports / LAMPORTS_PER_SOL);

      // Fetch user stats from backend
      const response = await fetch(`/api/profile/${publicKey.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4">🔒</div>
          <h1 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">Connect your wallet to view your profile</p>
          <WalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            <h1 className="text-2xl font-bold text-white">SkillBet 2.0</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/challenges" className="text-gray-400 hover:text-white transition">
              Challenges
            </Link>
            <Link href="/create" className="text-gray-400 hover:text-white transition">
              Create
            </Link>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl">
              👤
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Your Profile</h1>
              <p className="text-gray-400 font-mono text-sm">
                {publicKey?.toString().substring(0, 8)}...{publicKey?.toString().slice(-8)}
              </p>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500 rounded-xl p-6 text-center">
            <p className="text-green-400 text-sm font-semibold mb-2">Wallet Balance</p>
            <p className="text-5xl font-bold text-white mb-2">{balance.toFixed(4)} SOL</p>
            <p className="text-gray-400 text-sm">≈ ${(balance * 150).toFixed(2)} USD</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Games */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎮</span>
              <span className="text-gray-400 text-sm">Total Games</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalGames}</p>
          </div>

          {/* Win Rate */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📈</span>
              <span className="text-gray-400 text-sm">Win Rate</span>
            </div>
            <p className="text-4xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-400 mt-2">{stats.wins}W / {stats.losses}L</p>
          </div>

          {/* Total Earnings */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">💰</span>
              <span className="text-gray-400 text-sm">Total Earnings</span>
            </div>
            <p className="text-4xl font-bold text-green-400">{stats.totalEarnings.toFixed(2)} SOL</p>
          </div>

          {/* Net Profit */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📊</span>
              <span className="text-gray-400 text-sm">Net Profit</span>
            </div>
            <p className={`text-4xl font-bold ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(2)} SOL
            </p>
            <p className="text-sm text-gray-400 mt-2">Spent: {stats.totalSpent.toFixed(2)} SOL</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Wins */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🎉</span>
              <span className="text-green-400 font-semibold">Wins</span>
            </div>
            <p className="text-5xl font-bold text-green-400 mb-2">{stats.wins}</p>
            <p className="text-gray-400 text-sm">
              Earned: {stats.totalEarnings.toFixed(2)} SOL
            </p>
          </div>

          {/* Losses */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">😔</span>
              <span className="text-red-400 font-semibold">Losses</span>
            </div>
            <p className="text-5xl font-bold text-red-400 mb-2">{stats.losses}</p>
            <p className="text-gray-400 text-sm">
              Lost: {stats.totalSpent.toFixed(2)} SOL
            </p>
          </div>

          {/* Best Streak */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🔥</span>
              <span className="text-purple-400 font-semibold">Current Streak</span>
            </div>
            <p className="text-5xl font-bold text-purple-400 mb-2">0</p>
            <p className="text-gray-400 text-sm">
              Best: 0 games
            </p>
          </div>
        </div>

        {/* Game History */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Game History</h2>
            <button
              onClick={loadProfileData}
              className="text-purple-400 hover:text-purple-300 transition"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">⏳</div>
              <p className="text-gray-400">Loading your game history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-gray-400 mb-4">No games played yet</p>
              <Link
                href="/challenges"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-bold transition"
              >
                Play Your First Game
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((game) => (
                <div
                  key={game.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition hover:scale-[1.02] ${
                    game.won
                      ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                      : 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{game.won ? '🎉' : '😔'}</div>
                    <div>
                      <p className="text-white font-semibold capitalize">
                        {game.challengeType} Challenge
                      </p>
                      <p className="text-gray-400 text-sm">
                        Score: <span className="font-semibold">{game.score}</span>
                        {' • '}
                        {new Date(game.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                      {game.won ? '+' : '-'}{game.amount.toFixed(2)} SOL
                    </p>
                    <p className={`text-sm font-semibold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                      {game.won ? 'Won' : 'Lost'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Link
            href="/challenges"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-lg font-bold text-center transition hover:scale-105"
          >
            🎮 Browse Challenges
          </Link>
          <Link
            href="/create"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-4 rounded-lg font-bold text-center transition hover:scale-105"
          >
            ➕ Create Challenge
          </Link>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm mb-1">Avg. Score</p>
              <p className="text-2xl font-bold text-white">--</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Highest Score</p>
              <p className="text-2xl font-bold text-white">--</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Best Win</p>
              <p className="text-2xl font-bold text-green-400">-- SOL</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Played</p>
              <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
