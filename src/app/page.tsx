'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            <div>
              <h1 className="text-2xl font-bold text-white">SkillBet 2.0</h1>
              <p className="text-xs text-gray-400">Powered by Solana</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <Link 
              href="/challenges"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Launch App
            </Link>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Rest of your homepage code stays the same... */}
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="mb-6 animate-bounce">
            <span className="text-8xl">💰</span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Earn While You Sleep
          </h2>
          
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Create skill challenges. Others pay to attempt. 
            <span className="text-purple-400 font-bold"> You earn 24/7.</span>
          </p>
          
          <div className="flex justify-center gap-4">
            <Link 
              href="/challenges"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transform transition shadow-2xl"
            >
              🚀 Start Earning
            </Link>
            <a 
              href="#how-it-works"
              className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 transform transition border border-white/20"
            >
              📖 How It Works
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { title: '$0', subtitle: 'Total Volume', icon: '💵', color: 'from-blue-500 to-cyan-500' },
            { title: '0', subtitle: 'Active Challenges', icon: '🎯', color: 'from-green-500 to-emerald-500' },
            { title: '0', subtitle: 'Total Earnings', icon: '💎', color: 'from-purple-500 to-pink-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 hover:scale-105 transform transition">
              <div className="text-5xl mb-4">{stat.icon}</div>
              <h3 className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                {stat.title}
              </h3>
              <p className="text-gray-300">{stat.subtitle}</p>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 mb-20 border border-white/10">
          <h2 className="text-5xl font-bold mb-12 text-center text-white">
            How It Works ⚡
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Connect Wallet', desc: 'Use Phantom or any Solana wallet', icon: '🔗' },
              { step: '2', title: 'Create Challenge', desc: 'Set skill type & target score', icon: '⚔️' },
              { step: '3', title: 'Set Entry Fee', desc: 'Choose how much challengers pay', icon: '💰' },
              { step: '4', title: 'Earn Passively', desc: 'Get paid when others attempt', icon: '🚀' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="text-purple-400 font-bold text-sm mb-2">STEP {item.step}</div>
                <h3 className="font-bold text-xl mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl p-12 text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            Ready to Monetize Your Skills? 🎯
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join early adopters earning passive income
          </p>
          <Link 
            href="/challenges"
            className="inline-block bg-white text-purple-600 px-12 py-5 rounded-xl font-bold text-xl hover:scale-105 transform transition shadow-2xl"
          >
            Get Started Now →
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-lg text-white p-8 mt-20 border-t border-white/10">
        <div className="container mx-auto text-center">
          <p className="mb-4">© 2025 SkillBet 2.0. All rights reserved.</p>
          <p className="text-gray-400 text-sm">Powered by Solana & x402</p>
        </div>
      </footer>
    </div>
  );
}
