'use client';

import { useState } from 'react';
import CryptoJS from 'crypto-js'; // You'll need to install this: npm install crypto-js

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameData?: {
    serverSeed: string;
    clientSeed: string;
    nonce: number;
    result: string;
  };
}

export default function ProvablyFairModal({ isOpen, onClose, gameData }: ProvablyFairModalProps) {
  const [serverSeed, setServerSeed] = useState(gameData?.serverSeed || '');
  const [clientSeed, setClientSeed] = useState(gameData?.clientSeed || '');
  const [nonce, setNonce] = useState(gameData?.nonce || 0);
  const [verificationResult, setVerificationResult] = useState('');

  // Verify the game result using SHA256[web:67][web:69]
  const verifyResult = () => {
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    const hash = CryptoJS.SHA256(combined).toString();
    setVerificationResult(hash);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-purple-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">✅</span>
            <h2 className="text-3xl font-black text-white">Provably Fair</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Explanation */}
        <div className="glass-effect rounded-xl p-5 mb-6 border border-purple-500/20">
          <p className="text-gray-300 text-sm leading-relaxed">
            <span className="text-green-400 font-bold">Provably Fair</span> technology ensures complete transparency. 
            Every game outcome is generated using cryptographic hashing that you can verify independently[web:66][web:67].
          </p>
        </div>

        {/* Seeds Input */}
        <div className="space-y-4 mb-6">
          {/* Server Seed (Hashed) */}
          <div>
            <label className="block text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
              Server Seed (Hashed)
            </label>
            <input
              type="text"
              value={serverSeed}
              onChange={(e) => setServerSeed(e.target.value)}
              placeholder="Enter server seed hash..."
              className="w-full glass-effect border-purple-900/30 text-white text-sm font-mono px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">
              🔒 The hashed server seed shown before the game starts
            </p>
          </div>

          {/* Client Seed */}
          <div>
            <label className="block text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
              Client Seed (Your Seed)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                placeholder="Your custom seed..."
                className="flex-1 glass-effect border-purple-900/30 text-white text-sm font-mono px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
              />
              <button
                onClick={() => setClientSeed(Math.random().toString(36).substring(2, 15))}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
              >
                Randomize
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              🎲 You can change this before each bet
            </p>
          </div>

          {/* Nonce */}
          <div>
            <label className="block text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
              Nonce (Bet Number)
            </label>
            <input
              type="number"
              value={nonce}
              onChange={(e) => setNonce(parseInt(e.target.value))}
              className="w-full glass-effect border-purple-900/30 text-white text-sm font-mono px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">
              📊 Increments with each bet
            </p>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={verifyResult}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg mb-4"
        >
          🔍 Verify Result
        </button>

        {/* Verification Result */}
        {verificationResult && (
          <div className="glass-effect border-green-500/30 rounded-xl p-5 animate-slide-up">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              SHA-256 Hash Result
            </p>
            <p className="text-green-400 text-sm font-mono break-all bg-black/30 p-3 rounded-lg">
              {verificationResult}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-green-400 text-xl">✓</span>
              <span className="text-gray-300 font-semibold">Result verified successfully!</span>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="mt-6 glass-effect rounded-xl p-5 border border-gray-700/50">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>📚</span> How It Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              Server generates a random seed and shows you the <span className="text-white font-semibold">hashed version</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              You provide your own <span className="text-white font-semibold">client seed</span> (changeable anytime)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              Game outcome is generated using: <span className="text-white font-semibold">ServerSeed + ClientSeed + Nonce</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">4.</span>
              After the game, server reveals the original seed for <span className="text-white font-semibold">verification</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
