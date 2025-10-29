'use client';

import { useState } from 'react';
import Link from 'next/link';
import WalletButton from '@/components/WalletButton';
import WalletProfileButton from '@/components/WalletProfileButton';

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
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition hidden sm:inline-block"
            >
              Launch App
            </Link>
            <WalletProfileButton />
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
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
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
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

        {/* Skill Types */}
        <section className="mb-20">
          <h2 className="text-5xl font-bold mb-12 text-center text-white">
            Challenge Types 🎮
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                title: 'Typing Speed', 
                icon: '⌨️', 
                desc: 'Set WPM targets for challengers to beat',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                title: 'Wordle', 
                icon: '🔤', 
                desc: 'Create word puzzles with score requirements',
                color: 'from-green-500 to-emerald-500'
              },
              { 
                title: 'Chess Puzzles', 
                icon: '♟️', 
                desc: 'Set up tactical puzzles with rating thresholds',
                color: 'from-purple-500 to-pink-500'
              }
            ].map((skill, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transform transition">
                <div className="text-6xl mb-4 text-center">{skill.icon}</div>
                <h3 className={`text-2xl font-bold bg-gradient-to-r ${skill.color} bg-clip-text text-transparent mb-3 text-center`}>
                  {skill.title}
                </h3>
                <p className="text-gray-300 text-center">{skill.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-20">
          <h2 className="text-5xl font-bold mb-12 text-center text-white">
            Why SkillBet? 💎
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { 
                title: 'Passive Income', 
                icon: '💰', 
                desc: 'Earn SOL every time someone attempts your challenge'
              },
              { 
                title: 'No Maintenance', 
                icon: '🔄', 
                desc: 'Set it once, earn forever. Fully automated'
              },
              { 
                title: 'Fair & Transparent', 
                icon: '✅', 
                desc: 'All transactions on-chain. No hidden fees'
              },
              { 
                title: 'Anti-Cheat System', 
                icon: '🛡️', 
                desc: 'Advanced detection prevents cheating'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 flex items-start gap-4 hover:bg-white/10 transition">
                <div className="text-5xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Example Earnings */}
        <section className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-lg rounded-3xl p-12 mb-20 border border-green-500/30">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            💵 Example Earnings
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-gray-300 mb-2">Entry Fee: 0.1 SOL</p>
              <p className="text-green-400 font-bold text-3xl mb-1">+0.09 SOL</p>
              <p className="text-sm text-gray-400">per attempt</p>
            </div>
            <div>
              <p className="text-gray-300 mb-2">10 attempts/day</p>
              <p className="text-green-400 font-bold text-3xl mb-1">+0.9 SOL</p>
              <p className="text-sm text-gray-400">≈ $135/day</p>
            </div>
            <div>
              <p className="text-gray-300 mb-2">Monthly</p>
              <p className="text-green-400 font-bold text-3xl mb-1">+27 SOL</p>
              <p className="text-sm text-gray-400">≈ $4,050/month</p>
            </div>
          </div>
          
          <p className="text-center text-gray-400 text-sm mt-8">
            * Example based on 0.1 SOL entry fee at $150/SOL. Actual earnings vary by challenge popularity.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl p-12 text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            Ready to Monetize Your Skills? 🎯
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join early adopters earning passive income
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/challenges"
              className="inline-block bg-white text-purple-600 px-12 py-5 rounded-xl font-bold text-xl hover:scale-105 transform transition shadow-2xl"
            >
              Get Started Now →
            </Link>
            <Link 
              href="/create"
              className="inline-block bg-white/10 backdrop-blur-sm text-white border-2 border-white px-12 py-5 rounded-xl font-bold text-xl hover:bg-white/20 transform transition"
            >
              Create Challenge
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-lg text-white p-8 mt-20 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">⚡</span>
                <h3 className="text-2xl font-bold">SkillBet 2.0</h3>
              </div>
              <p className="text-gray-400">
                Turn your skills into passive income on Solana
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/challenges" className="block text-gray-400 hover:text-white transition">
                  Challenges
                </Link>
                <Link href="/create" className="block text-gray-400 hover:text-white transition">
                  Create Challenge
                </Link>
                <Link href="/profile" className="block text-gray-400 hover:text-white transition">
                  Profile
                </Link>
              </div>
            </div>
            
            {/* Social */}
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition">
                  🐦 Twitter
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition">
                  💬 Discord
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition">
                  📱 Telegram
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="mb-2">© 2025 SkillBet 2.0. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Powered by Solana & x402</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
