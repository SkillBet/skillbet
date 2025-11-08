'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import WalletButton from '@/components/WalletButton';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const HOUSE_WALLET = new PublicKey('63vypu8B8fjnucMJcfabmBHj7aG9bD1rz2nK5VSj2MU4');
const GRID_SIZE = 25;

const getMultiplier = (minesCount: number, clicksCount: number): number => {
  const safeSpots = GRID_SIZE - minesCount;
  const baseMultiplier = 1 + (minesCount / safeSpots) * 0.5;
  return Math.pow(baseMultiplier, clicksCount);
};

export default function MinesPage() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [demoMode, setDemoMode] = useState(false);
  const [demoBalance, setDemoBalance] = useState(10);
  const [walletBalance, setWalletBalance] = useState(0);
  
  const [betAmount, setBetAmount] = useState('0.1');
  const [minesCount, setMinesCount] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [grid, setGrid] = useState<Array<{revealed: boolean, isMine: boolean}>>([]);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [clicksCount, setClicksCount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [history, setHistory] = useState<any[]>([]);

  // Auto mode settings
  const [numberOfBets, setNumberOfBets] = useState(0);
  const [tilesToReveal, setTilesToReveal] = useState(5);
  const [onWinAction, setOnWinAction] = useState<'reset' | 'increase'>('reset');
  const [onWinPercent, setOnWinPercent] = useState('0');
  const [onLossAction, setOnLossAction] = useState<'reset' | 'increase'>('reset');
  const [onLossPercent, setOnLossPercent] = useState('0');
  const [stopOnProfit, setStopOnProfit] = useState('');
  const [stopOnLoss, setStopOnLoss] = useState('');
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoGamesPlayed, setAutoGamesPlayed] = useState(0);
  const autoRunningRef = useRef(false);

  const [stats, setStats] = useState({
    totalGames: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWin: 0,
  });

  useEffect(() => {
    const savedStats = localStorage.getItem('mines-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  useEffect(() => {
    if (connected && publicKey && !demoMode) {
      loadWalletBalance();
    }
  }, [connected, publicKey, demoMode]);

  const loadWalletBalance = async () => {
    if (!publicKey) return;
    try {
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const updateStats = (bet: number, won: boolean, payout: number) => {
    const newStats = {
      totalGames: stats.totalGames + 1,
      totalWagered: stats.totalWagered + bet,
      totalWon: stats.totalWon + (won ? payout - bet : 0),
      biggestWin: won && (payout - bet) > stats.biggestWin ? payout - bet : stats.biggestWin,
    };
    setStats(newStats);
    localStorage.setItem('mines-stats', JSON.stringify(newStats));
  };

  const placeBet = async (currentBet: number) => {
    const currentBalance = demoMode ? demoBalance : walletBalance;
    if (currentBet > currentBalance) {
      return false;
    }

    if (demoMode) {
      setDemoBalance(prev => prev - currentBet);
    } else {
      if (!connected || !publicKey) return false;
      try {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: HOUSE_WALLET,
            lamports: currentBet * LAMPORTS_PER_SOL,
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        await sendTransaction(transaction, connection);
      } catch (error) {
        console.error('Transaction failed:', error);
        return false;
      }
    }
    return true;
  };

  const generateGame = () => {
    const mines: number[] = [];
    while (mines.length < minesCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE);
      if (!mines.includes(pos)) {
        mines.push(pos);
      }
    }
    return mines;
  };

  const startManualGame = async () => {
    const bet = parseFloat(betAmount);
    if (bet <= 0 || isNaN(bet)) {
      alert('Invalid bet amount!');
      return;
    }

    if (!demoMode && !connected) {
      alert('Connect wallet or use demo mode!');
      return;
    }

    const success = await placeBet(bet);
    if (!success) {
      alert('Insufficient balance or transaction failed!');
      return;
    }

    const mines = generateGame();
    setMinePositions(mines);
    setGrid(Array(GRID_SIZE).fill(null).map(() => ({ revealed: false, isMine: false })));
    setGameState('playing');
    setClicksCount(0);
    setCurrentMultiplier(1);
  };

  const revealTile = (index: number) => {
    if (gameState !== 'playing' || grid[index].revealed) return;

    const newGrid = [...grid];
    newGrid[index].revealed = true;

    if (minePositions.includes(index)) {
      newGrid[index].isMine = true;
      setGrid(newGrid);
      setGameState('lost');
      
      setTimeout(() => {
        const allRevealed = newGrid.map((tile, i) => ({
          ...tile,
          revealed: true,
          isMine: minePositions.includes(i),
        }));
        setGrid(allRevealed);
      }, 500);

      updateStats(parseFloat(betAmount), false, 0);
      
      setHistory([{
        bet: parseFloat(betAmount),
        mines: minesCount,
        clicks: clicksCount,
        result: 'lost',
        payout: 0,
        timestamp: new Date().toISOString(),
        demo: demoMode,
      }, ...history]);
    } else {
      setGrid(newGrid);
      const newClicks = clicksCount + 1;
      setClicksCount(newClicks);
      const newMultiplier = getMultiplier(minesCount, newClicks);
      setCurrentMultiplier(newMultiplier);
    }
  };

  const cashOut = async () => {
    if (gameState !== 'playing' || clicksCount === 0) return;

    const bet = parseFloat(betAmount);
    const payout = bet * currentMultiplier;

    setGameState('won');

    if (demoMode) {
      setDemoBalance(prev => prev + payout);
    } else {
      await fetch('/api/casino/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner: publicKey?.toString(),
          amount: payout,
          game: 'mines',
        }),
      });
    }

    updateStats(bet, true, payout);

    setHistory([{
      bet,
      mines: minesCount,
      clicks: clicksCount,
      result: 'won',
      payout,
      multiplier: currentMultiplier,
      timestamp: new Date().toISOString(),
      demo: demoMode,
    }, ...history]);

    const allRevealed = grid.map((tile, i) => ({
      ...tile,
      revealed: true,
      isMine: minePositions.includes(i),
    }));
    setGrid(allRevealed);

    return { won: true, payout, profit: payout - bet };
  };

  const resetGame = () => {
    setGameState('idle');
    setGrid([]);
    setMinePositions([]);
    setClicksCount(0);
    setCurrentMultiplier(1);
  };

  const runAutoMode = async () => {
    setIsAutoRunning(true);
    autoRunningRef.current = true;
    setAutoGamesPlayed(0);
    
    let gamesPlayed = 0;
    let currentBet = parseFloat(betAmount);
    let totalProfit = 0;

    while (autoRunningRef.current && (numberOfBets === 0 || gamesPlayed < numberOfBets)) {
      if (stopOnProfit && totalProfit >= parseFloat(stopOnProfit)) {
        break;
      }
      if (stopOnLoss && Math.abs(totalProfit) >= parseFloat(stopOnLoss)) {
        break;
      }

      const success = await placeBet(currentBet);
      if (!success) {
        alert('Insufficient balance!');
        break;
      }

      const mines = generateGame();
      setMinePositions(mines);
      const newGrid = Array(GRID_SIZE).fill(null).map(() => ({ revealed: false, isMine: false }));
      setGrid(newGrid);
      setGameState('playing');

      let revealed = 0;
      let hitMine = false;
      const availablePositions = Array.from({ length: GRID_SIZE }, (_, i) => i);

      for (let i = 0; i < tilesToReveal && revealed < tilesToReveal && !hitMine; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));

        const unrevealedPositions = availablePositions.filter(pos => !newGrid[pos].revealed);
        if (unrevealedPositions.length === 0) break;

        const randomIndex = Math.floor(Math.random() * unrevealedPositions.length);
        const position = unrevealedPositions[randomIndex];

        newGrid[position].revealed = true;

        if (mines.includes(position)) {
          newGrid[position].isMine = true;
          hitMine = true;
          setGrid([...newGrid]);
          setGameState('lost');
          
          setTimeout(() => {
            const allRevealed = newGrid.map((tile, i) => ({
              ...tile,
              revealed: true,
              isMine: mines.includes(i),
            }));
            setGrid(allRevealed);
          }, 300);

          updateStats(currentBet, false, 0);
          totalProfit -= currentBet;

          setHistory(prev => [{
            bet: currentBet,
            mines: minesCount,
            clicks: revealed,
            result: 'lost',
            payout: 0,
            timestamp: new Date().toISOString(),
            demo: demoMode,
          }, ...prev]);

          if (onLossAction === 'increase') {
            const percent = parseFloat(onLossPercent) || 0;
            currentBet = currentBet * (1 + percent / 100);
          } else {
            currentBet = parseFloat(betAmount);
          }
        } else {
          revealed++;
          setGrid([...newGrid]);
          setClicksCount(revealed);
          const mult = getMultiplier(minesCount, revealed);
          setCurrentMultiplier(mult);
        }
      }

      if (!hitMine && revealed > 0) {
        const mult = getMultiplier(minesCount, revealed);
        const payout = currentBet * mult;
        const profit = payout - currentBet;

        setGameState('won');

        if (demoMode) {
          setDemoBalance(prev => prev + payout);
        } else {
          await fetch('/api/casino/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              winner: publicKey?.toString(),
              amount: payout,
              game: 'mines',
            }),
          });
        }

        updateStats(currentBet, true, payout);
        totalProfit += profit;

        setHistory(prev => [{
          bet: currentBet,
          mines: minesCount,
          clicks: revealed,
          result: 'won',
          payout,
          multiplier: mult,
          timestamp: new Date().toISOString(),
          demo: demoMode,
        }, ...prev]);

        const allRevealed = newGrid.map((tile, i) => ({
          ...tile,
          revealed: true,
          isMine: mines.includes(i),
        }));
        setGrid(allRevealed);

        if (onWinAction === 'increase') {
          const percent = parseFloat(onWinPercent) || 0;
          currentBet = currentBet * (1 + percent / 100);
        } else {
          currentBet = parseFloat(betAmount);
        }
      }

      gamesPlayed++;
      setAutoGamesPlayed(gamesPlayed);

      await new Promise(resolve => setTimeout(resolve, 1000));
      resetGame();
    }

    setIsAutoRunning(false);
    autoRunningRef.current = false;
  };

  const stopAuto = () => {
    autoRunningRef.current = false;
    setIsAutoRunning(false);
  };

  const currentBalance = demoMode ? demoBalance : walletBalance;
  const potentialWin = parseFloat(betAmount) * currentMultiplier;

  return (
    <>
      <style jsx global>{`
        @keyframes tileReveal {
          from { 
            transform: rotateY(90deg) scale(0.8); 
            opacity: 0; 
          }
          to { 
            transform: rotateY(0deg) scale(1); 
            opacity: 1; 
          }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4),
                        0 0 40px rgba(168, 85, 247, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.6),
                        0 0 60px rgba(168, 85, 247, 0.3);
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tile-reveal {
          animation: tileReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .pulse-animation {
          animation: pulse 2s infinite;
        }

        .glow-effect {
          animation: glow 2s infinite;
        }

        .slide-up {
          animation: slideUp 0.3s ease-out;
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1a1a2e;
        }

        ::-webkit-scrollbar-thumb {
          background: #6b21a8;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#0a0a15] via-[#0f0f1e] to-[#1a0a2e]">
        {/* Header with enhanced styling */}
        <header className="bg-black/70 backdrop-blur-xl border-b border-purple-900/30 sticky top-0 z-50 shadow-lg shadow-purple-900/10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-xl flex items-center justify-center text-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-purple-500/50">
                    🎰
                  </div>
                  <span className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    SkillBet
                  </span>
                </Link>
                
                <Link href="/" className="text-gray-400 hover:text-purple-400 transition-all text-sm font-medium flex items-center gap-1">
                  <span>←</span> Casino
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 glass-effect rounded-xl p-1">
                  <button
                    onClick={() => setDemoMode(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                      !demoMode 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Real
                  </button>
                  <button
                    onClick={() => setDemoMode(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                      demoMode 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Demo
                  </button>
                </div>

                {connected && (
                  <div className={`glass-effect rounded-xl px-4 py-2 ${
                    demoMode 
                      ? 'border-blue-500/50 shadow-blue-500/20' 
                      : 'border-green-500/50 shadow-green-500/20'
                  } shadow-lg`}>
                    <p className={`font-semibold text-[10px] uppercase tracking-wider ${
                      demoMode ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {demoMode ? 'Demo' : 'Balance'}
                    </p>
                    <p className="text-white font-black text-sm flex items-center gap-1">
                      <span className="text-purple-400">◎</span>
                      {currentBalance.toFixed(4)}
                    </p>
                  </div>
                )}
                
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced stats bar */}
        <div className="bg-black/40 backdrop-blur-sm border-b border-purple-900/20">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="slide-up" style={{ animationDelay: '0ms' }}>
                <div className="text-2xl font-black text-white mb-1">{stats.totalGames}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Games Played</div>
              </div>
              <div className="slide-up" style={{ animationDelay: '100ms' }}>
                <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                  {stats.totalWagered.toFixed(2)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Total Wagered</div>
              </div>
              <div className="slide-up" style={{ animationDelay: '200ms' }}>
                <div className="text-2xl font-black text-green-400 mb-1">+{stats.totalWon.toFixed(2)}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Total Won</div>
              </div>
              <div className="slide-up" style={{ animationDelay: '300ms' }}>
                <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-1">
                  {stats.biggestWin.toFixed(2)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Biggest Win</div>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <span className="text-5xl">💎</span> Mines
            </h1>
            <p className="text-gray-400 font-medium">Uncover gems • Avoid mines • Cash out anytime</p>
          </div>

          {/* Demo mode enhanced banner */}
          {demoMode && (
            <div className="glass-effect border-blue-500/30 rounded-2xl p-4 mb-8 slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 font-black text-base flex items-center gap-2">
                    🎮 Demo Mode Active
                  </p>
                  <p className="text-gray-400 text-sm font-medium mt-1">
                    Balance: <span className="text-white font-bold">{demoBalance.toFixed(4)} SOL</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDemoBalance(10)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border border-blue-500/30"
                  >
                    Reset Balance
                  </button>
                  <button
                    onClick={() => setDemoMode(false)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-green-500/30"
                  >
                    Switch to Real
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-[360px_1fr] gap-8">
            {/* Enhanced left panel */}
            <div className="space-y-5">
              <div className="glass-effect rounded-2xl p-6 border-purple-900/30 shadow-xl">
                {/* Mode toggle with better styling */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => {
                      setMode('manual');
                      if (isAutoRunning) stopAuto();
                    }}
                    className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                      mode === 'manual'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/40 scale-105'
                        : 'glass-effect text-gray-400 hover:text-white hover:scale-105'
                    }`}
                  >
                    Manual Mode
                  </button>
                  <button
                    onClick={() => setMode('auto')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                      mode === 'auto'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/40 scale-105'
                        : 'glass-effect text-gray-400 hover:text-white hover:scale-105'
                    }`}
                  >
                    Auto Mode
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Bet amount with enhanced styling */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Bet Amount</label>
                      <span className="text-gray-500 text-xs font-semibold">{currentBalance.toFixed(4)} SOL</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-black text-lg">◎</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-full glass-effect border-purple-900/30 text-white text-base font-semibold pl-10 pr-4 py-3.5 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <button
                        onClick={() => setBetAmount((parseFloat(betAmount) / 2).toFixed(4))}
                        className="glass-effect hover:bg-white/10 text-gray-300 font-bold py-2 rounded-lg text-sm transition-all hover:scale-105 border border-gray-700/50"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      >
                        ½
                      </button>
                      <button
                        onClick={() => setBetAmount((parseFloat(betAmount) * 2).toFixed(4))}
                        className="glass-effect hover:bg-white/10 text-gray-300 font-bold py-2 rounded-lg text-sm transition-all hover:scale-105 border border-gray-700/50"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      >
                        2×
                      </button>
                      <button
                        onClick={() => setBetAmount(currentBalance.toFixed(4))}
                        className="glass-effect hover:bg-white/10 text-gray-300 font-bold py-2 rounded-lg text-sm transition-all hover:scale-105 border border-gray-700/50"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {/* Mines count and auto settings */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Mines</label>
                      <select
                        value={minesCount}
                        onChange={(e) => setMinesCount(parseInt(e.target.value))}
                        className="w-full glass-effect border-purple-900/30 text-white font-semibold text-sm py-3 px-3 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 24].map(num => (
                          <option key={num} value={num} className="bg-gray-900">{num}</option>
                        ))}
                      </select>
                    </div>

                    {mode === 'auto' && (
                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Number of Bets</label>
                        <input
                          type="number"
                          min="0"
                          value={numberOfBets}
                          onChange={(e) => setNumberOfBets(parseInt(e.target.value) || 0)}
                          placeholder="∞"
                          className="w-full glass-effect border-purple-900/30 text-white font-semibold text-sm py-3 px-3 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                          disabled={isAutoRunning}
                        />
                        <p className="text-xs text-gray-500 mt-2 font-medium">0 = infinite</p>
                      </div>
                    )}
                  </div>

                  {/* Tiles to reveal for auto mode */}
                  {mode === 'auto' && (
                    <div>
                      <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Tiles to Reveal</label>
                      <input
                        type="number"
                        min="1"
                        max={25 - minesCount}
                        value={tilesToReveal}
                        onChange={(e) => setTilesToReveal(parseInt(e.target.value) || 1)}
                        className="w-full glass-effect border-purple-900/30 text-white font-semibold text-sm py-3 px-3 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                        disabled={isAutoRunning}
                      />
                    </div>
                  )}

                  {/* Auto mode options with enhanced styling */}
                  {mode === 'auto' && (
                    <>
                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">On Win</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOnWinAction('reset')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                              onWinAction === 'reset'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                : 'glass-effect text-gray-400 hover:text-white'
                            }`}
                            disabled={isAutoRunning}
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setOnWinAction('increase')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                              onWinAction === 'increase'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                : 'glass-effect text-gray-400 hover:text-white'
                            }`}
                            disabled={isAutoRunning}
                          >
                            Increase by
                          </button>
                        </div>
                        {onWinAction === 'increase' && (
                          <div className="flex items-center gap-2 mt-3">
                            <input
                              type="number"
                              value={onWinPercent}
                              onChange={(e) => setOnWinPercent(e.target.value)}
                              placeholder="0"
                              className="flex-1 glass-effect border-purple-900/30 text-white font-semibold text-sm py-2.5 px-3 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                              disabled={isAutoRunning}
                            />
                            <span className="text-gray-400 text-sm font-bold">%</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">On Loss</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOnLossAction('reset')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                              onLossAction === 'reset'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                : 'glass-effect text-gray-400 hover:text-white'
                            }`}
                            disabled={isAutoRunning}
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setOnLossAction('increase')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                              onLossAction === 'increase'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                : 'glass-effect text-gray-400 hover:text-white'
                            }`}
                            disabled={isAutoRunning}
                          >
                            Increase by
                          </button>
                        </div>
                        {onLossAction === 'increase' && (
                          <div className="flex items-center gap-2 mt-3">
                            <input
                              type="number"
                              value={onLossPercent}
                              onChange={(e) => setOnLossPercent(e.target.value)}
                              placeholder="0"
                              className="flex-1 glass-effect border-purple-900/30 text-white font-semibold text-sm py-2.5 px-3 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                              disabled={isAutoRunning}
                            />
                            <span className="text-gray-400 text-sm font-bold">%</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Stop on Profit</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xs font-bold">◎</span>
                            <input
                              type="number"
                              step="0.01"
                              value={stopOnProfit}
                              onChange={(e) => setStopOnProfit(e.target.value)}
                              placeholder="0.00"
                              className="w-full glass-effect border-purple-900/30 text-white font-semibold text-sm pl-7 pr-3 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                              disabled={isAutoRunning}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Stop on Loss</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xs font-bold">◎</span>
                            <input
                              type="number"
                              step="0.01"
                              value={stopOnLoss}
                              onChange={(e) => setStopOnLoss(e.target.value)}
                              placeholder="0.00"
                              className="w-full glass-effect border-purple-900/30 text-white font-semibold text-sm pl-7 pr-3 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                              disabled={isAutoRunning}
                            />
                          </div>
                        </div>
                      </div>

                      {isAutoRunning && (
                        <div className="glass-effect border-blue-500/50 rounded-xl p-4 text-center glow-effect">
                          <p className="text-blue-400 font-black text-base">🚀 Auto Running...</p>
                          <p className="text-white text-sm mt-2 font-bold">Games: {autoGamesPlayed}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Enhanced action buttons */}
                  {mode === 'manual' && gameState === 'idle' && (
                    <button
                      onClick={startManualGame}
                      disabled={!connected && !demoMode}
                      className={`w-full py-4 rounded-xl font-black text-base transition-all duration-300 ${
                        (connected || demoMode)
                          ? `bg-gradient-to-r ${demoMode ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-pink-600'} hover:scale-105 text-white transform shadow-2xl shadow-purple-500/40 glow-effect`
                          : 'glass-effect text-gray-500 cursor-not-allowed border border-gray-700/50'
                      }`}
                    >
                      Place Bet
                    </button>
                  )}

                  {mode === 'manual' && gameState === 'playing' && (
                    <button
                      onClick={cashOut}
                      disabled={clicksCount === 0}
                      className={`w-full py-4 rounded-xl font-black text-base transition-all duration-300 ${
                        clicksCount > 0
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 text-white transform shadow-2xl shadow-green-500/50 pulse-animation glow-effect'
                          : 'glass-effect text-gray-500 cursor-not-allowed border border-gray-700/50'
                      }`}
                    >
                      💰 Cash Out {potentialWin.toFixed(4)} SOL
                    </button>
                  )}

                  {mode === 'manual' && (gameState === 'won' || gameState === 'lost') && (
                    <button
                      onClick={resetGame}
                      className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white transform transition-all duration-300 shadow-2xl shadow-purple-500/40 glow-effect"
                    >
                      Play Again
                    </button>
                  )}

                  {mode === 'auto' && !isAutoRunning && (
                    <button
                      onClick={runAutoMode}
                      disabled={!connected && !demoMode}
                      className={`w-full py-4 rounded-xl font-black text-base transition-all duration-300 ${
                        (connected || demoMode)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 text-white transform shadow-2xl shadow-green-500/40 glow-effect'
                          : 'glass-effect text-gray-500 cursor-not-allowed border border-gray-700/50'
                      }`}
                    >
                      🚀 Start Auto
                    </button>
                  )}

                  {mode === 'auto' && isAutoRunning && (
                    <button
                      onClick={stopAuto}
                      className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-red-500 to-orange-600 hover:scale-105 text-white transform transition-all duration-300 shadow-2xl shadow-red-500/40"
                    >
                      ⏹ Stop Auto
                    </button>
                  )}
                </div>
              </div>

              {/* Current game stats with enhanced styling */}
              {gameState === 'playing' && mode === 'manual' && (
                <div className="glass-effect rounded-2xl p-6 border-purple-900/30 shadow-xl slide-up">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Current Game</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs font-bold uppercase">Tiles Revealed</span>
                      <span className="text-white font-black text-lg">{clicksCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs font-bold uppercase">Multiplier</span>
                      <span className="text-green-400 font-black text-lg">{currentMultiplier.toFixed(2)}×</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs font-bold uppercase">Potential Win</span>
                      <span className="text-purple-400 font-black text-lg">{potentialWin.toFixed(4)} SOL</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced center game grid */}
            <div>
              <div className="glass-effect rounded-2xl p-8 border-purple-900/30 shadow-2xl">
                {gameState === 'idle' && (
                  <div className="text-center py-20">
                    <div className="text-8xl mb-6 animate-bounce">💎</div>
                    <h2 className="text-3xl font-black text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Ready to Play?
                    </h2>
                    <p className="text-gray-400 font-medium">Set your bet and mines count, then start the game!</p>
                  </div>
                )}

                {gameState !== 'idle' && (
                  <>
                    {/* Enhanced result banner */}
                    {(gameState === 'won' || gameState === 'lost') && (
                      <div className={`mb-6 p-5 rounded-2xl border-2 slide-up ${
                        gameState === 'won' 
                          ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/30' 
                          : 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30'
                      }`}>
                        <p className={`text-center text-2xl font-black ${
                          gameState === 'won' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {gameState === 'won' ? `🎉 YOU WON ${potentialWin.toFixed(4)} SOL!` : '💥 MINE HIT!'}
                        </p>
                      </div>
                    )}

                    {/* Enhanced grid with better tile styling */}
                    <div className="grid grid-cols-5 gap-3 max-w-[550px] mx-auto">
                      {grid.map((tile, index) => (
                        <button
                          key={index}
                          onClick={() => revealTile(index)}
                          disabled={tile.revealed || gameState !== 'playing' || mode === 'auto'}
                          className={`aspect-square rounded-xl font-black text-3xl transition-all duration-300 transform relative overflow-hidden ${
                            !tile.revealed
                              ? 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 hover:scale-110 hover:shadow-xl cursor-pointer border border-gray-600/50 hover:border-purple-500/50'
                              : tile.isMine
                              ? 'bg-gradient-to-br from-red-600 via-red-700 to-red-800 border-2 border-red-400 shadow-2xl shadow-red-500/60 scale-95'
                              : 'bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 border-2 border-green-400 shadow-2xl shadow-green-500/60 scale-95'
                          } ${tile.revealed ? 'tile-reveal' : ''}`}
                        >
                          {!tile.revealed && (
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                          )}
                          {tile.revealed && (
                            <span className={tile.isMine ? 'animate-bounce' : 'animate-pulse'}>
                              {tile.isMine ? '💣' : '💎'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced history section */}
          {history.length > 0 && (
            <div className="mt-8 glass-effect rounded-2xl p-6 border-purple-900/30 shadow-xl slide-up">
              <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wider">Recent Games</h3>
              <div className="space-y-3">
                {history.slice(0, 5).map((game, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-102 ${
                      game.result === 'won' 
                        ? 'bg-green-500/10 border-2 border-green-500/30 hover:border-green-500/50' 
                        : 'bg-red-500/10 border-2 border-red-500/30 hover:border-red-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{game.result === 'won' ? '💎' : '💣'}</span>
                      <div>
                        <p className="text-white text-sm font-black">
                          {game.mines}M • {game.clicks}C
                          {game.demo && <span className="ml-2 text-blue-400 text-xs font-bold">(DEMO)</span>}
                        </p>
                        <p className="text-gray-500 text-xs font-semibold">{game.bet.toFixed(4)} SOL</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-base ${game.result === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                        {game.result === 'won' 
                          ? `+${(game.payout - game.bet).toFixed(4)}` 
                          : `-${game.bet.toFixed(4)}`}
                      </p>
                      {game.result === 'won' && (
                        <p className="text-gray-500 text-xs font-bold">{game.multiplier.toFixed(2)}×</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
