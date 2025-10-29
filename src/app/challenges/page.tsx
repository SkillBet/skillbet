'use client';

import { useState } from 'react';
import Link from 'next/link';
import WalletButton from '@/components/WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';

interface Challenge {
  id: string;
  creator: string;
  skillType: 'typing' | 'wordle' | 'chess' | 'trivia';
  targetScore: number;
  entryFee: number;
  attempts: number;
  createdAt: Date;
}

export default function ChallengesPage() {
  const { connected, publicKey } = useWallet();
  
  // Sample data - replace with real data from your API/smart contract later
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      creator: '7xKX...gAsU',
      skillType: 'typing',
      targetScore: 85,
      entryFee: 0.1,
      attempts: 12,
      createdAt: new Date()
    },
    {
      id: '2',
      creator: '5bNm...pQrT',
      skillType: 'wordle',
      targetScore: 4,
      entryFee: 0.05,
      attempts: 8,
      createdAt: new Date()
    },
    {
      id: '3',
      creator: '9cDk...sVwX',
      skillType: 'chess',
      targetScore: 2000,
      entryFee: 0.2,
      attempts: 5,
      createdAt: new Date()
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState('All');

  const skillIcons = {
    typing: '⌨️',
    wordle: '🔤',
    chess: '♟️',
    trivia: '🧠'
  };

  const skillNames = {
    typing: 'Typing Speed',
    wordle: 'Wordle',
    chess: 'Chess Puzzle',
    trivia: 'Trivia'
  };

  const filteredChallenges = selectedFilter === 'All' 
    ? challenges 
    : challenges.filter(c => c.skillType === selectedFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <span className="text-4xl">⚡</span>
            <div>
              <h1 className="text-2xl font-bold text-white">SkillBet 2.0</h1>
              <p className="text-xs text-gray-400">Browse Challenges</p>
            </div>
          </Link>
          
          <div className="flex gap-4 items-center">
            {connected && (
              <Link 
                href="/create"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition hover:scale-105 transform"
              >
                + Create Challenge
              </Link>
            )}
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Wallet Connection Alert */}
        {!connected && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-6 mb-8 text-center animate-pulse">
            <p className="text-yellow-300 text-lg mb-2 font-semibold">
              🔒 Connect your wallet to view and attempt challenges
            </p>
            <p className="text-yellow-200 text-sm">
              Click "Select Wallet" in the top right corner
            </p>
          </div>
        )}

        {/* Connected Wallet Info */}
        {connected && publicKey && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-8">
            <p className="text-green-400 font-semibold">
              ✅ Wallet Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </p>
          </div>
        )}

        {/* Page Title */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-white">Active Challenges 🎯</h1>
          <div className="text-gray-400">
            {filteredChallenges.length} challenge{filteredChallenges.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['All', 'Typing', 'Wordle', 'Chess', 'Trivia'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105 ${
                selectedFilter === filter
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Challenge Grid */}
        {filteredChallenges.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map(challenge => (
              <div 
                key={challenge.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 hover:border-purple-500/50 transform transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-5xl">{skillIcons[challenge.skillType]}</span>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
                    {challenge.attempts} attempts
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {skillNames[challenge.skillType]}
                </h3>

                {/* Target Score */}
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <p className="text-gray-300 text-sm mb-1">Beat this score:</p>
                  <p className="text-white font-bold text-xl">
                    {challenge.targetScore}
                    {challenge.skillType === 'typing' && ' WPM'}
                    {challenge.skillType === 'wordle' && ' guesses'}
                    {challenge.skillType === 'chess' && ' ELO'}
                    {challenge.skillType === 'trivia' && ' points'}
                  </p>
                </div>

                {/* Entry Fee */}
                <div className="flex justify-between items-center mb-4 p-3 bg-green-500/10 rounded-lg">
                  <span className="text-gray-300 font-semibold">Entry Fee:</span>
                  <span className="text-green-400 font-bold text-xl">{challenge.entryFee} SOL</span>
                </div>

                {/* Creator */}
                <p className="text-gray-400 text-sm mb-4 flex items-center gap-2">
                  <span>👤</span>
                  <span>By: {challenge.creator}</span>
                </p>

                {/* Attempt Button - THIS IS THE UPDATED PART */}
                {connected ? (
                  <Link 
                    href={`/challenges/${challenge.id}`}
                    className="block text-center w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-bold transition transform hover:scale-105"
                  >
                    Attempt Challenge →
                  </Link>
                ) : (
                  <button 
                    disabled
                    className="w-full bg-gray-600 text-gray-400 py-3 rounded-lg font-bold cursor-not-allowed"
                  >
                    Connect Wallet First
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <span className="text-8xl mb-4 block">🔍</span>
            <h2 className="text-3xl font-bold text-white mb-4">
              No {selectedFilter !== 'All' ? selectedFilter.toLowerCase() : ''} challenges found
            </h2>
            <p className="text-gray-400 mb-8">
              {selectedFilter === 'All' 
                ? 'Be the first to create a challenge!' 
                : `Try a different filter or create the first ${selectedFilter} challenge!`
              }
            </p>
            {connected && (
              <Link 
                href="/create"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold transition hover:scale-105 transform"
              >
                Create Challenge
              </Link>
            )}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
            <p className="text-gray-400 mb-2">Total Challenges</p>
            <p className="text-4xl font-bold text-white">{challenges.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
            <p className="text-gray-400 mb-2">Total Volume</p>
            <p className="text-4xl font-bold text-green-400">
              {challenges.reduce((sum, c) => sum + (c.entryFee * c.attempts), 0).toFixed(2)} SOL
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
            <p className="text-gray-400 mb-2">Total Attempts</p>
            <p className="text-4xl font-bold text-purple-400">
              {challenges.reduce((sum, c) => sum + c.attempts, 0)}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-lg text-white p-8 mt-20 border-t border-white/10">
        <div className="container mx-auto text-center">
          <p className="mb-4">© 2025 SkillBet 2.0. All rights reserved.</p>
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/" className="text-gray-400 hover:text-white transition">Home</Link>
            <Link href="/create" className="text-gray-400 hover:text-white transition">Create</Link>
            <Link href="/challenges" className="text-gray-400 hover:text-white transition">Challenges</Link>
          </div>
          <p className="text-gray-400 text-sm">Powered by Solana & x402</p>
        </div>
      </footer>
    </div>
  );
}
