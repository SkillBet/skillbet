'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '@/components/WalletButton';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Platform wallet that receives entry fees
const PLATFORM_WALLET = new PublicKey('D8UeL1pEWffA4rVVWoM4eLtiTPk9anRWMufi7zj5NKwX'); // ← Replace with your wallet

export default function CreateChallengePage() {
  const router = useRouter();
  const { connected, publicKey, sendTransaction } = useWallet();
  
  const [formData, setFormData] = useState({
    skillType: 'typing',
    targetScore: '',
    entryFee: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!connected || !publicKey) {
      setError('Please connect your wallet first!');
      return;
    }

    if (!formData.targetScore || !formData.entryFee) {
      setError('Please fill in all required fields!');
      return;
    }

    const entryFee = parseFloat(formData.entryFee);
    if (entryFee <= 0) {
      setError('Entry fee must be greater than 0!');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Connect to Solana
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        'confirmed'
      );

      // Calculate platform fee (creator pays 0.01 SOL to create)
      const creationFee = 0.01 * LAMPORTS_PER_SOL;

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PLATFORM_WALLET,
          lamports: creationFee,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      console.log('Transaction sent:', signature);
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      // Save challenge to your database/backend
      const response = await fetch('/api/challenges/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creatorWallet: publicKey.toString(),
          transactionSignature: signature,
          createdAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert('✅ Challenge created successfully!');
        router.push('/challenges');
      } else {
        // If backend fails but transaction succeeded, show partial success
        alert('⚠️ Transaction succeeded but failed to save challenge. Please contact support with signature: ' + signature);
      }
    } catch (err: any) {
      console.error('Error creating challenge:', err);
      setError(err.message || 'Failed to create challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              ← Back to Challenges
            </Link>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-4">Create Challenge 🎯</h1>
        <p className="text-gray-400 mb-8">Set up your skill challenge and start earning</p>

        {/* Wallet Connection Warning */}
        {!connected && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 font-semibold">
              ⚠️ Please connect your wallet to create a challenge
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {/* Skill Type */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Skill Type</label>
            <select 
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-3 focus:border-purple-500 focus:outline-none"
              value={formData.skillType}
              onChange={(e) => setFormData({...formData, skillType: e.target.value})}
            >
              <option value="typing">⌨️ Typing Speed</option>
              <option value="wordle">🔤 Wordle</option>
              <option value="chess">♟️ Chess Puzzle</option>
              <option value="trivia">🧠 Trivia</option>
            </select>
          </div>

          {/* Target Score */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Target Score</label>
            <input 
              type="number"
              placeholder="e.g., 85 WPM"
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-3 focus:border-purple-500 focus:outline-none"
              value={formData.targetScore}
              onChange={(e) => setFormData({...formData, targetScore: e.target.value})}
              required
            />
            <p className="text-gray-400 text-sm mt-1">Challengers must beat this score to win</p>
          </div>

          {/* Entry Fee */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Entry Fee (SOL)</label>
            <input 
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g., 0.1"
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-3 focus:border-purple-500 focus:outline-none"
              value={formData.entryFee}
              onChange={(e) => setFormData({...formData, entryFee: e.target.value})}
              required
            />
            <p className="text-gray-400 text-sm mt-1">How much challengers pay to attempt</p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Description (Optional)</label>
            <textarea 
              placeholder="Add details about your challenge..."
              rows={4}
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-3 focus:border-purple-500 focus:outline-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Platform Fee Notice */}
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-blue-400 font-semibold mb-2">💰 Creation Fee:</p>
            <p className="text-white text-2xl font-bold">0.01 SOL</p>
            <p className="text-gray-300 text-sm mt-1">
              One-time fee to create this challenge
            </p>
          </div>

          {/* Earnings Preview */}
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-semibold mb-2">💵 Your Earnings Per Attempt:</p>
            <p className="text-white text-2xl font-bold">
              {formData.entryFee ? `${(parseFloat(formData.entryFee) * 0.9).toFixed(2)} SOL` : '-- SOL'}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              Challengers pay: {formData.entryFee || '--'} SOL<br />
              You keep: {formData.entryFee ? `${(parseFloat(formData.entryFee) * 0.9).toFixed(2)} SOL` : '--'} (90%)<br />
              Platform fee: {formData.entryFee ? `${(parseFloat(formData.entryFee) * 0.1).toFixed(2)} SOL` : '--'} (10%)
            </p>
          </div>

          {/* Revenue Calculator */}
          {formData.entryFee && (
            <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-4 mb-6">
              <p className="text-purple-400 font-semibold mb-2">📊 Revenue Potential:</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-xs">10 attempts</p>
                  <p className="text-white font-bold">{(parseFloat(formData.entryFee) * 0.9 * 10).toFixed(2)} SOL</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">50 attempts</p>
                  <p className="text-white font-bold">{(parseFloat(formData.entryFee) * 0.9 * 50).toFixed(2)} SOL</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">100 attempts</p>
                  <p className="text-white font-bold">{(parseFloat(formData.entryFee) * 0.9 * 100).toFixed(2)} SOL</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={!connected || loading}
            className={`w-full py-4 rounded-lg font-bold text-lg transition ${
              connected && !loading
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transform'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating Challenge...
              </span>
            ) : !connected ? (
              'Connect Wallet to Create'
            ) : (
              'Create Challenge 🚀 (Pay 0.01 SOL)'
            )}
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-400 text-center mt-4">
            By creating a challenge, you agree to our terms of service and understand that the 0.01 SOL creation fee is non-refundable.
          </p>
        </form>
      </main>
    </div>
  );
}
