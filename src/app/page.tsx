'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WalletButton from '@/components/WalletButton';
import WalletProfileButton from '@/components/WalletProfileButton';
import LiveChat from '@/components/LiveChat';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalWagered: 0,
    gamesPlayed: 0,
    biggestWin: 0,
    onlinePlayers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from blockchain when page loads[web:115][web:119]
  useEffect(() => {
    fetchRealStats();
    
    // Update every 30 seconds
    const interval = setInterval(fetchRealStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchRealStats = async () => {
    try {
      console.log('Fetching real Solana data...');
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      console.log('Received data:', data);
      setStats(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setIsLoading(false);
    }
  };


  return (
    <>
      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.4),
                        0 0 60px rgba(168, 85, 247, 0.2);
          }
          50% { 
            box-shadow: 0 0 50px rgba(168, 85, 247, 0.6),
                        0 0 90px rgba(168, 85, 247, 0.3);
          }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .game-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }

        .game-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s;
        }

        .game-card:hover::before {
          left: 100%;
        }

        .game-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 30px 60px rgba(168, 85, 247, 0.3);
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, #1a1a2e, #0f0f1e);
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #10b981);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s;
        }

        .gradient-border:hover::before {
          opacity: 1;
        }

        .stat-card {
          animation: slide-up 0.6s ease-out backwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 255, 255, 0.8) 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0a15;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #8b5cf6, #ec4899);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #a78bfa, #f472b6);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#0a0a15] via-[#0f0f1e] to-[#1a0a2e]">
        {/* Enhanced Top Bar */}
        <div className="bg-black/70 backdrop-blur-xl border-b border-purple-900/30">
          <div className="container mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-gray-400 font-semibold">{stats.onlinePlayers} <span className="text-green-400">online</span></span>
                </div>
                <span className="text-gray-700">|</span>
                <span className="text-gray-400 font-medium flex items-center gap-2">
                  <span className="text-purple-400">💬</span> 24/7 Support
                </span>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href="https://x.com/SkillBetco" 
                  target="_blank" 
                  className="text-gray-400 hover:text-purple-400 transition-all duration-300 transform hover:scale-110 font-bold"
                >
                  <span className="text-lg">𝕏</span>
                </a>
                <a 
                  href="https://pump.fun/coin/" 
                  target="_blank" 
                  className="glass-effect hover:bg-white/10 text-green-400 px-4 py-1.5 rounded-lg transition-all duration-300 font-bold text-xs transform hover:scale-105"
                >
                  💰 $SKILL
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Header */}
        <header className="bg-black/80 backdrop-blur-2xl border-b border-purple-900/30 sticky top-0 z-50 shadow-lg shadow-purple-900/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Enhanced Logo */}
              <Link href="/" className="flex items-center gap-3 group">
  <div className="relative">
    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-xl flex items-center justify-center overflow-hidden transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-purple-500/50">
      <img 
        src="/logo.png" 
        alt="SkillBet Logo" 
        className="w-8 h-8 object-contain"
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
  </div>
  <div>
    <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
      SkillBet
    </h1>
    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Casino</p>
  </div>
</Link>

              {/* Enhanced Nav */}
              <nav className="hidden md:flex items-center gap-1">
                <Link 
                  href="/" 
                  className="px-5 py-2.5 text-white font-bold bg-purple-600/20 rounded-xl transition-all duration-300 hover:bg-purple-600/30"
                >
                  Casino
                </Link>
                <Link 
                  href="/sports" 
                  className="px-5 py-2.5 text-gray-400 hover:text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5"
                >
                  Sports
                </Link>
                <Link 
                  href="/challenges" 
                  className="px-5 py-2.5 text-gray-400 hover:text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5"
                >
                  Challenges
                </Link>
                <Link 
                  href="/vip" 
                  className="px-5 py-2.5 text-gray-400 hover:text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5 flex items-center gap-1.5"
                >
                  <span className="text-yellow-400">👑</span> VIP
                </Link>
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <WalletProfileButton />
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent"></div>
          </div>

          <div className="container mx-auto px-4 py-20 relative">
            <div className="text-center max-w-5xl mx-auto">
              <div className="animate-slide-up">
                <h2 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift" style={{ animation: 'gradient-shift 3s ease infinite' }}>
                    The Future of
                  </span>
                  <br />
                  <span className="shimmer-text">
                    Crypto Gaming
                  </span>
                </h2>
                <p className="text-2xl text-gray-300 mb-10 font-medium">
                  <span className="text-green-400 font-bold">Provably fair</span> • <span className="text-purple-400 font-bold">Instant withdrawals</span> • Play with <span className="text-orange-400 font-bold">SOL</span> or <span className="text-green-400 font-bold">$SKILL</span>
                </p>
                <div className="flex flex-wrap gap-5 justify-center">
                  <Link 
                    href="/games/mines"
                    className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-10 py-5 rounded-xl font-black text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/40 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      💎 Play Mines
                    </span>
                  </Link>
                  <Link 
                    href="/games/coinflip"
                    className="group relative bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-10 py-5 rounded-xl font-black text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-orange-500/40"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      🪙 Coin Flip
                    </span>
                  </Link>
                  <a
                    href="https://pump.fun/coin/"
                    target="_blank"
                    className="glass-effect hover:bg-white/20 border-2 border-white/20 hover:border-white/40 text-white px-10 py-5 rounded-xl font-black text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    💰 Buy $SKILL
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Bar */}
<div className="bg-black/40 backdrop-blur-xl border-y border-purple-900/20 shadow-lg">
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
{[
  { 
    label: 'Total Wagered', 
    value: isLoading ? '...' : `${stats.totalWagered.toFixed(2)} SOL`,  // 👈 Shows real data
    icon: '💰', 
    color: 'from-purple-400 to-pink-400' 
  },
  { 
    label: 'Games Played', 
    value: isLoading ? '...' : stats.gamesPlayed.toLocaleString(),  // 👈 Shows real data
    icon: '🎮', 
    color: 'from-blue-400 to-cyan-400' 
  },
  { 
    label: 'Biggest Win', 
    value: isLoading ? '...' : `${stats.biggestWin.toFixed(2)} SOL`,  // 👈 Shows real data
    icon: '🏆', 
    color: 'from-yellow-400 to-orange-400' 
  },
  { 
    label: 'Active Players', 
    value: isLoading ? '...' : `${stats.onlinePlayers}+`,  // 👈 Shows real data
    icon: '👥', 
    color: 'from-green-400 to-emerald-400' 
  },
].map((stat, i) => (
        <div key={i} className="stat-card text-center glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
          <div className="text-4xl mb-3 inline-block animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
            {stat.icon}
          </div>
          <div className={`text-3xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
</div>

{/* Recent Bets & Live Feed */}
<div className="bg-black/40 backdrop-blur-xl border-y border-purple-900/20 shadow-lg">
  <div className="container mx-auto px-4 py-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-white font-black text-xl flex items-center gap-3 uppercase tracking-wider">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        Live Bets
      </h3>
    </div>
    

    {/* Recent Bets List */}
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Sample bet 1 */}
      <div className="glass-effect p-4 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-800/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-green-500 to-emerald-600">
              P
            </div>
            <div>
              <p className="text-white text-sm font-bold">Player****123</p>
              <p className="text-gray-400 text-xs font-medium">Mines • 3 mines</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase">Bet</p>
            <p className="text-white text-sm font-bold">0.5 SOL</p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-black text-base">+2.45 SOL</p>
            <p className="text-gray-400 text-xs font-bold">4.9x</p>
          </div>
        </div>
      </div>

      {/* Sample bet 2 */}
      <div className="glass-effect p-4 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-800/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-red-500 to-rose-600">
              C
            </div>
            <div>
              <p className="text-white text-sm font-bold">Crypto****789</p>
              <p className="text-gray-400 text-xs font-medium">Coin Flip • Heads</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase">Bet</p>
            <p className="text-white text-sm font-bold">1.2 SOL</p>
          </div>
          <div className="text-right">
            <p className="text-red-400 font-black text-base">-1.2 SOL</p>
            <p className="text-gray-500 text-xs font-bold">Lost</p>
          </div>
        </div>
      </div>

      {/* Sample bet 3 */}
      <div className="glass-effect p-4 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-800/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-green-500 to-emerald-600">
              L
            </div>
            <div>
              <p className="text-white text-sm font-bold">Lucky****456</p>
              <p className="text-gray-400 text-xs font-medium">Mines • 5 mines</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase">Bet</p>
            <p className="text-white text-sm font-bold">0.1 SOL</p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-black text-base">+1.8 SOL</p>
            <p className="text-gray-400 text-xs font-bold">18.0x</p>
          </div>
        </div>
      </div>

      {/* Sample bet 4 */}
      <div className="glass-effect p-4 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-800/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-green-500 to-emerald-600">
              W
            </div>
            <div>
              <p className="text-white text-sm font-bold">Whale****999</p>
              <p className="text-gray-400 text-xs font-medium">Coin Flip • Tails</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase">Bet</p>
            <p className="text-white text-sm font-bold">5.0 SOL</p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-black text-base">+9.9 SOL</p>
            <p className="text-gray-400 text-xs font-bold">1.98x</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
 
        {/* Enhanced Games Grid */}
        <div className="container mx-auto px-4 py-20">
          <div className="mb-12 animate-slide-up">
            <h3 className="text-4xl font-black text-white mb-3 flex items-center gap-3">
              <span className="text-5xl">🎮</span> Popular Games
            </h3>
            <p className="text-gray-400 text-lg font-medium">Fast, fair, and fun • Provably transparent</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mines - FEATURED (Enhanced) */}
            <Link href="/games/mines" className="game-card gradient-border group lg:col-span-2 lg:row-span-2">
              <div className="bg-gradient-to-br from-purple-900/60 via-pink-900/50 to-purple-900/60 rounded-2xl p-8 border-2 border-purple-500/50 h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-7xl transform group-hover:scale-110 transition-transform duration-300">💎</span>
                    <div className="flex gap-2">
                      <span className="glass-effect bg-purple-500/30 text-purple-300 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg">
                        New
                      </span>
                      <span className="glass-effect bg-yellow-500/30 text-yellow-300 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg animate-pulse">
                        Featured
                      </span>
                    </div>
                  </div>
                  <h4 className="text-5xl font-black text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                    Mines
                  </h4>
                  <p className="text-gray-200 text-lg mb-6 leading-relaxed font-medium">
                    Uncover hidden gems while avoiding mines. The more you reveal, the bigger your multiplier grows!
                  </p>
                  <div className="space-y-3 text-sm text-gray-300 mb-8">
                    <div className="flex items-center gap-3 glass-effect p-3 rounded-lg">
                      <span className="text-green-400 text-lg">✓</span>
                      <span className="font-semibold">5x5 grid • Adjustable difficulty</span>
                    </div>
                    <div className="flex items-center gap-3 glass-effect p-3 rounded-lg">
                      <span className="text-green-400 text-lg">✓</span>
                      <span className="font-semibold">Cash out anytime • Your choice</span>
                    </div>
                    <div className="flex items-center gap-3 glass-effect p-3 rounded-lg">
                      <span className="text-green-400 text-lg">✓</span>
                      <span className="font-semibold">Progressive multipliers • Up to 1000x</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-purple-300 font-black text-2xl group-hover:text-white transition-colors flex items-center gap-2">
                    Play Now <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                  </span>
                  <span className="glass-effect text-gray-300 text-sm font-bold px-4 py-2 rounded-lg">
                    High Risk • High Reward
                  </span>
                </div>
              </div>
            </Link>

            {/* Coin Flip (Enhanced) */}
            <Link href="/games/coinflip" className="game-card gradient-border group">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 h-full flex flex-col justify-between hover:border-yellow-500/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-6xl transform group-hover:scale-110 group-hover:rotate-180 transition-all duration-500">🪙</span>
                    <span className="glass-effect bg-green-500/30 text-green-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg">
                      Hot
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-3 group-hover:text-yellow-400 transition-colors">Coin Flip</h4>
                  <p className="text-gray-400 text-sm mb-4 font-medium leading-relaxed">
                    Classic 50/50 • Double your bet instantly • Pure luck, pure thrill
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <span className="text-purple-400 font-bold text-base group-hover:text-white transition-colors flex items-center gap-2">
                    Play Now <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                  <span className="text-gray-500 text-xs font-semibold glass-effect px-3 py-1.5 rounded-lg">2% edge</span>
                </div>
              </div>
            </Link>

            {/* Crash - NOW MARKED AS SOON */}
            <div className="game-card">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 h-full flex flex-col justify-between opacity-60 cursor-not-allowed">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-6xl grayscale">🚀</span>
                    <span className="glass-effect bg-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg">
                      Soon
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-3">Crash</h4>
                  <p className="text-gray-500 text-sm mb-4 font-medium leading-relaxed">
                    Multiplayer action • Cash out before crash • Up to 1000x multiplier
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <span className="text-gray-600 font-bold text-base">Coming Soon</span>
                  <span className="text-gray-600 text-xs font-semibold glass-effect px-3 py-1.5 rounded-lg">2-5% edge</span>
                </div>
              </div>
            </div>

            {/* Coming Soon - Dice */}
            <div className="game-card">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 h-full flex flex-col justify-between opacity-60 cursor-not-allowed">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-6xl grayscale">🎲</span>
                    <span className="glass-effect bg-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg">
                      Soon
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-3">Dice</h4>
                  <p className="text-gray-500 text-sm mb-4 font-medium leading-relaxed">
                    Roll high or low • Custom odds • Lightning-fast gameplay
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <span className="text-gray-600 font-bold text-base">Coming Soon</span>
                  <span className="text-gray-600 text-xs font-semibold glass-effect px-3 py-1.5 rounded-lg">1% edge</span>
                </div>
              </div>
            </div>

            {/* Coming Soon - Roulette */}
            <div className="game-card">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 h-full flex flex-col justify-between opacity-60 cursor-not-allowed">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-6xl grayscale">🎡</span>
                    <span className="glass-effect bg-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg">
                      Soon
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-3">Roulette</h4>
                  <p className="text-gray-500 text-sm mb-4 font-medium leading-relaxed">
                    Classic casino game • Multiple bets • Smooth animations
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <span className="text-gray-600 font-bold text-base">Coming Soon</span>
                  <span className="text-gray-600 text-xs font-semibold glass-effect px-3 py-1.5 rounded-lg">2.7% edge</span>
                </div>
              </div>
            </div>

            {/* Coming Soon - Plinko */}
            <div className="game-card">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 h-full flex flex-col justify-between opacity-60 cursor-not-allowed">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-6xl grayscale">📍</span>
                    <span className="glass-effect bg-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg">
                      Soon
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-3">Plinko</h4>
                  <p className="text-gray-500 text-sm mb-4 font-medium leading-relaxed">
                    Drop balls • Random bounces • Mega multipliers up to 1000x
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <span className="text-gray-600 font-bold text-base">Coming Soon</span>
                  <span className="text-gray-600 text-xs font-semibold glass-effect px-3 py-1.5 rounded-lg">1% edge</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-slide-up">
              <h3 className="text-4xl font-black text-white mb-3 flex items-center justify-center gap-3">
                <span className="text-5xl">⚡</span> Why Choose SkillBet?
              </h3>
              <p className="text-gray-400 text-lg font-medium">The most trusted casino on Solana blockchain</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '⚡',
                  title: 'Instant Withdrawals',
                  description: 'Withdraw your winnings immediately to your Solana wallet. No delays, no hassle.',
                  color: 'from-yellow-500 to-orange-500',
                },
                {
                  icon: '✅',
                  title: 'Provably Fair',
                  description: 'Every game result is cryptographically verifiable on the blockchain. 100% transparent.',
                  color: 'from-green-500 to-emerald-500',
                },
                {
                  icon: '🔒',
                  title: 'Secure & Safe',
                  description: 'Non-custodial platform. Your keys, your coins. Complete control over your funds.',
                  color: 'from-purple-500 to-pink-500',
                },
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="glass-effect rounded-2xl p-8 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 group hover:transform hover:scale-105 animate-slide-up"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className={`text-6xl mb-6 inline-block p-4 rounded-2xl bg-gradient-to-br ${feature.color} bg-opacity-20 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                    {feature.title}
                  </h4>
                  <p className="text-gray-400 leading-relaxed font-medium">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="relative rounded-3xl p-12 text-center overflow-hidden shadow-2xl animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 animate-gradient-shift bg-[length:200%_auto]" style={{ animation: 'gradient-shift 5s ease infinite' }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h2 className="text-6xl font-black text-white mb-5 leading-tight">
                Ready to Win Big? 🎰
              </h2>
              <p className="text-2xl text-white/95 mb-10 font-semibold">
                Start playing now with SOL or $SKILL token
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link 
                  href="/games/mines"
                  className="inline-block bg-white hover:bg-gray-100 text-purple-600 px-12 py-6 rounded-xl font-black text-xl hover:scale-105 transform transition-all shadow-2xl"
                >
                  💎 Play Mines Now
                </Link>
                <a
                  href="https://pump.fun/coin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-12 py-6 rounded-xl font-black text-xl hover:scale-105 transform transition-all shadow-2xl"
                >
                  💰 Buy $SKILL Token
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="bg-black/70 backdrop-blur-xl border-t border-purple-900/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-10 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    🎰
                  </div>
                  <span className="text-2xl font-black text-white">SkillBet</span>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed">
                  The future of crypto gaming on Solana. Provably fair, instant, and secure.
                </p>
              </div>

              {/* Games */}
              <div>
                <h4 className="text-white font-black mb-5 uppercase tracking-wider text-sm">Games</h4>
                <div className="space-y-3">
                  <Link href="/games/mines" className="block text-gray-400 hover:text-purple-400 transition font-semibold text-sm">
                    💎 Mines
                  </Link>
                  <Link href="/games/coinflip" className="block text-gray-400 hover:text-purple-400 transition font-semibold text-sm">
                    🪙 Coin Flip
                  </Link>
                  <span className="block text-gray-600 text-sm font-semibold">🚀 Crash (Soon)</span>
                  <span className="block text-gray-600 text-sm font-semibold">🎲 Dice (Soon)</span>
                  <span className="block text-gray-600 text-sm font-semibold">🎡 Roulette (Soon)</span>
                </div>
              </div>

              {/* Community */}
              <div>
                <h4 className="text-white font-black mb-5 uppercase tracking-wider text-sm">Community</h4>
                <div className="space-y-3">
                  <a href="https://x.com/SkillBetco" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-purple-400 transition font-semibold text-sm">
                    𝕏 Twitter
                  </a>
                  <a href="https://pump.fun/coin/" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-purple-400 transition font-semibold text-sm">
                    💰 $SKILL Token
                  </a>
                  <span className="block text-gray-600 text-sm font-semibold">💬 Discord (Soon)</span>
                  <span className="block text-gray-600 text-sm font-semibold">📱 Telegram (Soon)</span>
                </div>
              </div>

              {/* Info */}
              <div>
                <h4 className="text-white font-black mb-5 uppercase tracking-wider text-sm">Information</h4>
                <div className="space-y-3">
                  <Link href="/provably-fair" className="block text-gray-400 hover:text-purple-400 transition font-semibold text-sm">
                    Provably Fair
                  </Link>
                  <Link href="/terms" className="block text-gray-400 hover:text-purple-400 transition font-semibold text-sm">
                    Terms of Service
                  </Link>
                  <Link href="/privacy" className="block text-gray-400 hover:text-purple-400 transition font-semibold text-sm">
                    Privacy Policy
                  </Link>
                  <Link href="/responsible-gaming" className="block text-gray-400 hover:text-purple-400 transition font-semibold text-sm">
                    Responsible Gaming
                  </Link>
                </div>
              </div>
              
            </div>

            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-500 text-sm mb-3 font-semibold">
                © 2025 SkillBet Casino. All rights reserved.
              </p>
              <p className="text-gray-600 text-xs font-medium">
                ⚠️ 18+ only • Gamble responsibly • Provably fair gaming on Solana
              </p>
            </div>
          </div>
        </footer>
      </div>

      <LiveChat />
    </>
  );
}
