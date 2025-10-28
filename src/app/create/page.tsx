'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateChallengePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    skillType: 'typing',
    targetScore: '',
    entryFee: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Connect to your smart contract here
    console.log('Creating challenge:', formData);
    
    // Simulate success
    alert('Challenge created successfully!');
    router.push('/challenges');
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
          <Link href="/challenges" className="text-gray-400 hover:text-white transition">
            ← Back to Challenges
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-4">Create Challenge 🎯</h1>
        <p className="text-gray-400 mb-8">Set up your skill challenge and start earning</p>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {/* Skill Type */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Skill Type</label>
            <select 
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-3"
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
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-3"
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
              placeholder="e.g., 0.1"
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-3"
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
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Earnings Preview */}
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-semibold mb-2">Potential Earnings:</p>
            <p className="text-white text-2xl font-bold">
              {formData.entryFee ? `${(parseFloat(formData.entryFee) * 0.9).toFixed(2)} SOL per attempt` : '-- SOL'}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              (You keep 90%, 10% platform fee)
            </p>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-lg font-bold text-lg transition"
          >
            Create Challenge 🚀
          </button>
        </form>
      </main>
    </div>
  );
}
