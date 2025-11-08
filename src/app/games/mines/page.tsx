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

const generateSeed = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const hashSeed = async (seed: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateGameFromSeed = (seed: string, isDemoMode: boolean, minesCount: number): number[] => {
  const mines: number[] = [];
  
  if (isDemoMode) {
    const safeFactor = 0.7;
    const corners = [0, 4, 20, 24];
    const edges = [1, 2, 3, 5, 9, 10, 14, 15, 19, 21, 22, 23];
    const safeZones = [...corners, ...edges];
    
    let seedIndex = 0;
    while (mines.length < minesCount) {
      const seedByte = parseInt(seed.slice(seedIndex * 2, (seedIndex * 2) + 2), 16) / 255;
      seedIndex = (seedIndex + 1) % (seed.length / 2);
      
      let pos;
      if (seedByte < safeFactor) {
        pos = safeZones[Math.floor((seedByte / safeFactor) * safeZones.length)];
      } else {
        pos = Math.floor(((seedByte - safeFactor) / (1 - safeFactor)) * GRID_SIZE);
      }
      
      if (!mines.includes(pos)) {
        mines.push(pos);
      }
    }
  } else {
    let seedIndex = 0;
    while (mines.length < minesCount) {
      const seedByte = parseInt(seed.slice(seedIndex * 2, (seedIndex * 2) + 2), 16) / 255;
      seedIndex = (seedIndex + 1) % (seed.length / 2);
      const pos = Math.floor(seedByte * GRID_SIZE);
      if (!mines.includes(pos)) {
        mines.push(pos);
      }
    }
  }
  
  return mines;
};

export default function MinesPage() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [demoMode, setDemoMode] = useState(false);
  const [demoBalance, setDemoBalance] = useState(10);
  const [walletBalance, setWalletBalance] = useState(0);
  
  const [betAmount, setBetAmount] = useState('0.001');
  const [minesCount, setMinesCount] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [grid, setGrid] = useState<Array<{revealed: boolean, isMine: boolean}>>([]);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [clicksCount, setClicksCount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
  
  const [clientSeed, setClientSeed] = useState('');
  const [serverSeed, setServerSeed] = useState('');
  const [serverSeedHash, setServerSeedHash] = useState('');
  const [showSeedModal, setShowSeedModal] = useState(false);

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
    
    const newClientSeed = generateSeed();
    const newServerSeed = generateSeed();
    setClientSeed(newClientSeed);
    setServerSeed(newServerSeed);
    hashSeed(newServerSeed).then(hash => setServerSeedHash(hash));
  }, []);

  useEffect(() => {
    if (connected && publicKey && !demoMode) {
      loadWalletBalance();
    }
  }, [connected, publicKey, demoMode]);

  const lastBalanceCheck = useRef(0);

const loadWalletBalance = async () => {
  if (!publicKey) return;
  
  // Only check balance every 5 seconds
  const now = Date.now();
  if (now - lastBalanceCheck.current < 5000) {
    return; // Skip if checked recently
  }
  lastBalanceCheck.current = now;
  
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

  const handleRealBet = async (betAmountValue: number) => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet!');
      return false;
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: HOUSE_WALLET,
          lamports: Math.floor(betAmountValue * LAMPORTS_PER_SOL),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      console.log('Bet placed! Transaction:', signature);
            
      return true;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      if (error.message?.includes('User rejected')) {
        alert('❌ Transaction cancelled');
      } else {
        alert('❌ Transaction failed. Please try again.');
      }
      return false;
    }
  };

  const generateNewSeeds = async () => {
    const newServerSeed = generateSeed();
    setServerSeed(newServerSeed);
    const hash = await hashSeed(newServerSeed);
    setServerSeedHash(hash);
  };

  const startManualGame = async () => {
    const bet = parseFloat(betAmount);
    
    if (bet <= 0 || isNaN(bet)) {
      alert('❌ Invalid bet amount!');
      return;
    }

    if (bet < 0.0001) {
      alert('❌ Minimum bet is 0.0001 SOL');
      return;
    }

    const currentBalance = demoMode ? demoBalance : walletBalance;
    
    if (bet > currentBalance) {
      alert(`❌ Insufficient balance!\n\nYou have: ${currentBalance.toFixed(4)} SOL\nYou need: ${bet.toFixed(4)} SOL\n\nTry demo mode or deposit more SOL.`);
      return;
    }

    if (!demoMode && !connected) {
      alert('❌ Connect wallet or use demo mode!');
      return;
    }

    if (!demoMode) {
      const success = await handleRealBet(bet);
      if (!success) {
        return;
      }
      setWalletBalance(prev => prev - bet);
    } else {
      setDemoBalance(prev => prev - bet);
    }

    const combinedSeed = clientSeed + serverSeed;
    const mines = generateGameFromSeed(combinedSeed, demoMode, minesCount);
    
    setMinePositions(mines);
    setGrid(Array(GRID_SIZE).fill(null).map(() => ({ revealed: false, isMine: false })));
    setGameState('playing');
    setClicksCount(0);
    setCurrentMultiplier(1);
    
    await generateNewSeeds();
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
      setWalletBalance(prev => prev + payout);
      console.log(`✅ Won ${payout.toFixed(4)} SOL!`);
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
      if (stopOnProfit && totalProfit >= parseFloat(stopOnProfit)) break;
      if (stopOnLoss && Math.abs(totalProfit) >= parseFloat(stopOnLoss)) break;

      const currentBalance = demoMode ? demoBalance : walletBalance;
      if (currentBet > currentBalance) {
        alert('Insufficient balance!');
        break;
      }

      if (!demoMode) {
        const success = await handleRealBet(currentBet);
        if (!success) break;
        setWalletBalance(prev => prev - currentBet);
      } else {
        setDemoBalance(prev => prev - currentBet);
      }

      const combinedSeed = clientSeed + serverSeed;
      const mines = generateGameFromSeed(combinedSeed, demoMode, minesCount);
      setMinePositions(mines);
      const newGrid = Array(GRID_SIZE).fill(null).map(() => ({ revealed: false, isMine: false }));
      setGrid(newGrid);
      setGameState('playing');
      
      await generateNewSeeds();

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
          setWalletBalance(prev => prev + payout);
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
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .tile-reveal {
          animation: tileReveal 0.2s ease-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .pulse-animation {
          animation: pulse 1s infinite;
        }
      `}</style>

      <div className="min-h-screen bg-[#0f0f1e]">
        {showSeedModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">🎲 Provably Fair</h3>
                <button
                  onClick={() => setShowSeedModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Client Seed (You can change this)</label>
                  <input
                    type="text"
                    value={clientSeed}
                    onChange={(e) => setClientSeed(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 text-white text-sm p-3 rounded-lg font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Server Seed (Hashed)</label>
                  <input
                    type="text"
                    value={serverSeedHash}
                    disabled
                    className="w-full bg-black/50 border border-gray-700 text-gray-500 text-sm p-3 rounded-lg font-mono"
                  />
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm font-semibold mb-2">✓ How it works:</p>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>• Your seed + server seed = fair game</li>
                    <li>• Server seed is hashed (verifiable)</li>
                    <li>• {demoMode ? 'Demo: Higher win rate' : 'Real: True random'}</li>
                  </ul>
                </div>
                
                <button
                  onClick={async () => {
                    const newSeed = generateSeed();
                    setClientSeed(newSeed);
                    await generateNewSeeds();
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Generate New Seeds
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-xl transform group-hover:scale-110 transition">
                    🎰
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    SkillBet
                  </span>
                </Link>
                
                <Link href="/" className="text-gray-400 hover:text-white transition text-sm">
                  ← Casino
                </Link>
                
                <button
                  onClick={() => setShowSeedModal(true)}
                  className="hidden sm:flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
                >
                  <span>🎲</span>
                  <span>Provably Fair</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 bg-black/50 rounded-lg p-1 border border-gray-800">
                  <button
                    onClick={() => setDemoMode(false)}
                    className={`px-3 py-1.5 rounded text-sm font-semibold transition ${!demoMode ? 'bg-green-500 text-white' : 'text-gray-400'}`}
                  >
                    Real
                  </button>
                  <button
                    onClick={() => setDemoMode(true)}
                    className={`px-3 py-1.5 rounded text-sm font-semibold transition ${demoMode ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
                  >
                    Demo
                  </button>
                </div>

                {connected && (
                  <div className={`border rounded-lg px-3 py-2 ${demoMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    <p className={`font-bold text-xs ${demoMode ? 'text-blue-400' : 'text-green-400'}`}>
                      {demoMode ? 'Demo' : 'Balance'}
                    </p>
                    <p className="text-white font-bold text-sm">{currentBalance.toFixed(4)} SOL</p>
                  </div>
                )}
                
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        <div className="bg-black/30 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">{stats.totalGames}</div>
                <div className="text-xs text-gray-500">Games</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.totalWagered.toFixed(2)} SOL</div>
                <div className="text-xs text-gray-500">Wagered</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">+{stats.totalWon.toFixed(2)} SOL</div>
                <div className="text-xs text-gray-500">Won</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">{stats.biggestWin.toFixed(2)} SOL</div>
                <div className="text-xs text-gray-500">Best</div>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-1">💎 Mines</h1>
            <p className="text-gray-400 text-sm">
              Provably Fair • {demoMode ? '🎮 Demo (Easy Mode)' : '💰 Real Money'} • Click 🎲 for seeds
            </p>
          </div>

          {demoMode && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 font-semibold text-sm">🎮 Demo Mode - Try risk-free!</p>
                  <p className="text-gray-400 text-xs">Higher win rate • Balance: {demoBalance.toFixed(4)} SOL</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDemoBalance(10)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setDemoMode(false)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    Play Real
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => {
                      setMode('manual');
                      if (isAutoRunning) stopAuto();
                    }}
                    className={`py-2.5 rounded-lg font-semibold text-sm transition ${
                      mode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setMode('auto')}
                    className={`py-2.5 rounded-lg font-semibold text-sm transition ${
                      mode === 'auto'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Auto
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-gray-400 text-xs">Bet Amount</label>
                      <span className="text-gray-500 text-xs">{currentBalance.toFixed(4)} SOL</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-bold">◎</span>
                      <input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700 text-white text-base pl-8 pr-3 py-2.5 rounded-lg focus:border-purple-500 focus:outline-none"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      <button
                        onClick={() => setBetAmount((parseFloat(betAmount) / 2).toFixed(4))}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded text-xs transition"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      >
                        ½
                      </button>
                      <button
                        onClick={() => setBetAmount((parseFloat(betAmount) * 2).toFixed(4))}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded text-xs transition"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      >
                        2x
                      </button>
                      <button
                        onClick={() => setBetAmount(Math.max(currentBalance - 0.00001, 0).toFixed(4))}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded text-xs transition"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 text-xs mb-2">Mines</label>
                      <select
                        value={minesCount}
                        onChange={(e) => setMinesCount(parseInt(e.target.value))}
                        className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm py-2.5 rounded-lg focus:border-purple-500 focus:outline-none"
                        disabled={gameState !== 'idle' || isAutoRunning}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 24].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    {mode === 'auto' && (
                      <div>
                        <label className="block text-gray-400 text-xs mb-2">Number of Bets</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={numberOfBets}
                            onChange={(e) => setNumberOfBets(parseInt(e.target.value) || 0)}
                            placeholder="∞"
                            className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm py-2.5 px-2 rounded-lg focus:border-purple-500 focus:outline-none"
                            disabled={isAutoRunning}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">0 = infinite</p>
                      </div>
                    )}
                  </div>

                  {mode === 'auto' && (
                    <>
                      <div>
                        <label className="block text-gray-400 text-xs mb-2">Tiles to Reveal</label>
                        <input
                          type="number"
                          min="1"
                          max={25 - minesCount}
                          value={tilesToReveal}
                          onChange={(e) => setTilesToReveal(parseInt(e.target.value) || 1)}
                          className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm py-2.5 px-3 rounded-lg focus:border-purple-500 focus:outline-none"
                          disabled={isAutoRunning}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs mb-2">On Win</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOnWinAction('reset')}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                              onWinAction === 'reset'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                            disabled={isAutoRunning}
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setOnWinAction('increase')}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                              onWinAction === 'increase'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                            disabled={isAutoRunning}
                          >
                            Increase by
                          </button>
                        </div>
                        {onWinAction === 'increase' && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              value={onWinPercent}
                              onChange={(e) => setOnWinPercent(e.target.value)}
                              placeholder="0"
                              className="flex-1 bg-gray-800/50 border border-gray-700 text-white text-sm py-2 px-2 rounded-lg"
                              disabled={isAutoRunning}
                            />
                            <span className="text-gray-500 text-sm">%</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs mb-2">On Loss</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOnLossAction('reset')}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                              onLossAction === 'reset'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                            disabled={isAutoRunning}
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setOnLossAction('increase')}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                              onLossAction === 'increase'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                            disabled={isAutoRunning}
                          >
                            Increase by
                          </button>
                        </div>
                        {onLossAction === 'increase' && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              value={onLossPercent}
                              onChange={(e) => setOnLossPercent(e.target.value)}
                              placeholder="0"
                              className="flex-1 bg-gray-800/50 border border-gray-700 text-white text-sm py-2 px-2 rounded-lg"
                              disabled={isAutoRunning}
                            />
                            <span className="text-gray-500 text-sm">%</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-400 text-xs mb-2">Stop on Profit</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-400 text-xs">◎</span>
                            <input
                              type="number"
                              step="0.01"
                              value={stopOnProfit}
                              onChange={(e) => setStopOnProfit(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm pl-6 pr-2 py-2 rounded-lg"
                              disabled={isAutoRunning}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs mb-2">Stop on Loss</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-400 text-xs">◎</span>
                            <input
                              type="number"
                              step="0.01"
                              value={stopOnLoss}
                              onChange={(e) => setStopOnLoss(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm pl-6 pr-2 py-2 rounded-lg"
                              disabled={isAutoRunning}
                            />
                          </div>
                        </div>
                      </div>

                      {isAutoRunning && (
                        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 text-center">
                          <p className="text-blue-400 font-semibold text-sm">Auto Running...</p>
                          <p className="text-white text-xs mt-1">Games: {autoGamesPlayed}</p>
                        </div>
                      )}
                    </>
                  )}

                  {mode === 'manual' && gameState === 'idle' && (
                    <button
                      onClick={startManualGame}
                      disabled={!connected && !demoMode}
                      className={`w-full py-3 rounded-lg font-bold text-base transition ${
                        (connected || demoMode)
                          ? `bg-gradient-to-r ${demoMode ? 'from-blue-500 to-purple-500' : 'from-purple-600 to-pink-600'} hover:scale-105 text-white transform shadow-lg`
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {demoMode ? '🎮 Bet (Demo)' : '💰 Bet'}
                    </button>
                  )}

                  {mode === 'manual' && gameState === 'playing' && (
                    <button
                      onClick={cashOut}
                      disabled={clicksCount === 0}
                      className={`w-full py-3 rounded-lg font-bold text-base transition ${
                        clicksCount > 0
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 text-white transform shadow-lg pulse-animation'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      💰 Cash Out ({potentialWin.toFixed(4)} SOL)
                    </button>
                  )}

                  {mode === 'manual' && (gameState === 'won' || gameState === 'lost') && (
                    <button
                      onClick={resetGame}
                      className="w-full py-3 rounded-lg font-bold text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white transform transition shadow-lg"
                    >
                      🎮 Play Again
                    </button>
                  )}

                  {mode === 'auto' && !isAutoRunning && (
                    <button
                      onClick={runAutoMode}
                      disabled={!connected && !demoMode}
                      className={`w-full py-3 rounded-lg font-bold text-base transition ${
                        (connected || demoMode)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 text-white transform shadow-lg'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      ▶️ Start Auto
                    </button>
                  )}

                  {mode === 'auto' && isAutoRunning && (
                    <button
                      onClick={stopAuto}
                      className="w-full py-3 rounded-lg font-bold text-base bg-gradient-to-r from-red-500 to-orange-500 hover:scale-105 text-white transform transition shadow-lg"
                    >
                      ⏹️ Stop Auto
                    </button>
                  )}
                </div>
              </div>

              {gameState === 'playing' && mode === 'manual' && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-xs font-bold text-gray-400 mb-3">Current Game</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Tiles</span>
                      <span className="text-white font-bold">{clicksCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Multiplier</span>
                      <span className="text-green-400 font-bold">{currentMultiplier.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Win</span>
                      <span className="text-purple-400 font-bold">{potentialWin.toFixed(4)} SOL</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                {gameState === 'idle' && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">💎</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ready to Play?</h2>
                    <p className="text-gray-400 text-sm">Set your bet and mines, then start!</p>
                  </div>
                )}

                {gameState !== 'idle' && (
                  <>
                    {(gameState === 'won' || gameState === 'lost') && (
                      <div className={`mb-4 p-3 rounded-lg border ${
                        gameState === 'won' 
                          ? 'bg-green-500/20 border-green-500' 
                          : 'bg-red-500/20 border-red-500'
                      }`}>
                        <p className={`text-center text-lg font-bold ${
                          gameState === 'won' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {gameState === 'won' ? `🎉 WON ${potentialWin.toFixed(4)} SOL!` : '💥 HIT A MINE!'}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-5 gap-2 max-w-[500px] mx-auto">
                      {grid.map((tile, index) => (
                        <button
                          key={index}
                          onClick={() => revealTile(index)}
                          disabled={tile.revealed || gameState !== 'playing' || mode === 'auto'}
                          className={`aspect-square rounded-lg font-bold text-2xl transition-all transform ${
                            !tile.revealed
                              ? 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 hover:scale-105 cursor-pointer shadow-lg'
                              : tile.isMine
                              ? 'bg-gradient-to-br from-red-600 to-red-700 border border-red-500 shadow-lg shadow-red-500/50'
                              : 'bg-gradient-to-br from-green-600 to-emerald-600 border border-green-500 shadow-lg shadow-green-500/50'
                          } ${tile.revealed ? 'tile-reveal' : ''}`}
                        >
                          {tile.revealed && (tile.isMine ? '💣' : '💎')}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {history.length > 0 && (
            <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-base font-bold text-white mb-3">Recent Games</h3>
              <div className="space-y-2">
                {history.slice(0, 5).map((game, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-2.5 rounded-lg ${
                      game.result === 'won' 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{game.result === 'won' ? '💎' : '💣'}</span>
                      <div>
                        <p className="text-white text-xs font-semibold">
                          {game.mines}M • {game.clicks}C
                          {game.demo && <span className="ml-1 text-blue-400 text-xs">(DEMO)</span>}
                        </p>
                        <p className="text-gray-500 text-xs">{game.bet.toFixed(4)} SOL</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${game.result === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                        {game.result === 'won' 
                          ? `+${(game.payout - game.bet).toFixed(4)}` 
                          : `-${game.bet.toFixed(4)}`}
                      </p>
                      {game.result === 'won' && (
                        <p className="text-gray-500 text-xs">{game.multiplier.toFixed(2)}x</p>
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
