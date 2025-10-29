'use client';

import { useState } from 'react';

export default function UnderDevModal() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-3xl p-8 max-w-md w-full border-2 border-purple-500 shadow-2xl animate-fade-in">
        {/* Icon */}
        <div className="text-center mb-6">
          <span className="text-7xl block mb-4">🚧</span>
          <h2 className="text-3xl font-bold text-white mb-2">Under Development</h2>
        </div>

        {/* Message */}
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
          <p className="text-yellow-300 text-center font-semibold">
            SkillBet 2.0 is currently being built!
          </p>
        </div>

        <p className="text-gray-300 text-center mb-6">
          We're working hard to bring you the best skill-based earning platform on Solana. 
          <span className="block mt-2 text-purple-400 font-semibold">Coming Soon! 🚀</span>
        </p>

        {/* Token Link */}
        <a
          href="https://pump.fun"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-center py-4 rounded-xl font-bold mb-3 transition hover:scale-105 transform"
        >
          🪙 Buy SKILL Token
        </a>

        {/* Twitter Link */}
        <a 
          href="https://x.com/SkillBetco"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg transition mb-6 font-semibold"
        >
          🐦 Follow on Twitter
        </a>

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-full bg-white/10 hover:bg-white/20 text-gray-300 py-3 rounded-lg transition"
        >
          Explore Site (Preview Mode)
        </button>

        {/* Note */}
        <p className="text-gray-500 text-xs text-center mt-4">
          Features are not functional yet. Full launch coming soon!
        </p>
      </div>
    </div>
  );
}
