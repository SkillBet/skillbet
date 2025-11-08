'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import WalletButton from '@/components/WalletButton';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const HOUSE_WALLET = new PublicKey('63vypu8B8fjnucMJcfabmBHj7aG9bD1rz2nK5VSj2MU4');
const HOUSE_EDGE = 0.02;

export default function CoinFlipPage() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [demoMode, setDemoMode] = useState(false);
  const [demoBalance, setDemoBalance] = useState(10);
  const [walletBalance, setWalletBalance] = useState(0);
  const [betAmount, setBetAmount] = useState('0.1');
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  // Real stats from local storage
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWin: 0,
  });

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('coinflip-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  useEffect(() => {
    if (connected && publicKey && !demoMode) {
      loadWalletBalance();
      const interval = setInterval(loadWalletBalance, 5000);
      return () => clearInterval(interval);
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
      totalBets: stats.totalBets + 1,
      totalWagered: stats.totalWagered + bet,
      totalWon: stats.totalWon + (won ? payout - bet : 0),
      biggestWin: won && (payout - bet) > stats.biggestWin ? payout - bet : stats.biggestWin,
    };
    setStats(newStats);
    localStorage.setItem('coinflip-stats', JSON.stringify(newStats));
  };

  const flipCoin = async () => {
    const bet = parseFloat(betAmount);
    if (bet <= 0 || isNaN(bet)) {
      alert('Please enter a valid bet amount!');
      return;
    }

    if (demoMode) {
      if (bet > demoBalance) {
        alert('Insufficient demo balance!');
        return;
      }

      setIsFlipping(true);
      setShowResult(false);
      setResult(null);
      setWon(null);
      setDemoBalance(demoBalance - bet);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const randomResult = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(randomResult);
      const playerWon = randomResult === selectedSide;
      setWon(playerWon);
      setShowResult(true);

      const payout = bet * (2 - HOUSE_EDGE);
      if (playerWon) {
        setDemoBalance(demoBalance - bet + payout);
      }

      updateStats(bet, playerWon, payout);

      setHistory([{
        bet,
        choice: selectedSide,
        result: randomResult,
        won: playerWon,
        payout: playerWon ? payout : 0,
        timestamp: new Date().toISOString(),
        demo: true,
      }, ...history]);

      setIsFlipping(false);
      return;
    }

    if (!connected || !publicKey) {
      alert('Please connect your wallet or use demo mode!');
      return;
    }

    if (bet > walletBalance) {
      alert('Insufficient balance!');
      return;
    }

    setIsFlipping(true);
    setShowResult(false);
    setResult(null);
    setWon(null);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: HOUSE_WALLET,
          lamports: bet * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      
      const randomResult = Math.random() < 0.5 ? 'heads' : 'tails';
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResult(randomResult);
      const playerWon = randomResult === selectedSide;
      setWon(playerWon);
      setShowResult(true);

      const payout = bet * (2 - HOUSE_EDGE);
      updateStats(bet, playerWon, payout);

      connection.confirmTransaction(signature).then(() => {
        if (playerWon) {
          fetch('/api/casino/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              winner: publicKey.toString(),
              amount: payout,
              game: 'coinflip',
              transactionSignature: signature,
            }),
          });
        }
      });

      await loadWalletBalance();

      setHistory([{
        bet,
        choice: selectedSide,
        result: randomResult,
        won: playerWon,
        payout: playerWon ? payout : 0,
        timestamp: new Date().toISOString(),
        demo: false,
      }, ...history]);

    } catch (error: any) {
      console.error('Error:', error);
      if (error.message.includes('User rejected')) {
        alert('Transaction cancelled');
      } else {
        alert('Transaction failed: ' + error.message);
      }
    } finally {
      setIsFlipping(false);
    }
  };

  const currentBalance = demoMode ? demoBalance : walletBalance;

  return (
    <>
      <style jsx global>{`
        @keyframes flip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(1800deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .coin-container {
          perspective: 1000px;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 250px;
        }

        .coin {
          width: 200px;
          height: 200px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.1s;
        }

        .coin.flipping {
          animation: flip 2s ease-in-out;
        }

        .coin.show-tails {
          transform: rotateY(180deg);
        }

        .coin-side {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          border: 6px solid;
        }

        .coin-heads {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-color: #FFD700;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
        }

        .coin-tails {
          background: linear-gradient(135deg, #C0C0C0, #808080);
          border-color: #C0C0C0;
          transform: rotateY(180deg);
          box-shadow: 0 0 30px rgba(192, 192, 192, 0.6);
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-[#0f0f1e]">
        {/* Header */}
        <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-xl transform group-hover:scale-110 transition">
                    🎰
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      SkillBet
                    </span>
                  </div>
                </Link>
                
                <Link href="/" className="text-gray-400 hover:text-white transition text-sm">
                  ← Casino
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {/* Mode Toggle */}
                <div className="hidden sm:flex items-center gap-1 bg-black/50 rounded-lg p-1 border border-gray-800">
                  <button
                    onClick={() => setDemoMode(false)}
                    className={`px-3 py-1.5 rounded text-sm font-semibold transition ${!demoMode ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Real
                  </button>
                  <button
                    onClick={() => setDemoMode(true)}
                    className={`px-3 py-1.5 rounded text-sm font-semibold transition ${demoMode ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Demo
                  </button>
                </div>

                {/* Balance */}
                {connected && (
                  <div className={`border rounded-lg px-3 py-2 ${demoMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    <p className={`font-bold text-xs ${demoMode ? 'text-blue-400' : 'text-green-400'}`}>
                      {demoMode ? 'Demo' : 'Balance'}
                    </p>
                    <p className="text-white font-bold text-sm">{currentBalance.toFixed(4)}</p>
                  </div>
                )}
                
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalBets}</div>
                <div className="text-xs text-gray-500">Total Bets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalWagered.toFixed(2)} SOL</div>
                <div className="text-xs text-gray-500">Total Wagered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">+{stats.totalWon.toFixed(2)} SOL</div>
                <div className="text-xs text-gray-500">Total Won</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{stats.biggestWin.toFixed(2)} SOL</div>
                <div className="text-xs text-gray-500">Biggest Win</div>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🪙 Coin Flip</h1>
            <p className="text-gray-400">Choose heads or tails • Win 2x your bet • {demoMode ? 'Demo Mode' : '2% house edge'}</p>
          </div>

          {/* Demo Banner */}
          {demoMode && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 font-semibold">🎮 Demo Mode • Free Play</p>
                  <p className="text-gray-400 text-sm">Demo balance: {demoBalance.toFixed(4)} SOL</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDemoBalance(10)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setDemoMode(false)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Play Real
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Game Area */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
                {/* Coin Display */}
                <div className="text-center mb-8">
                  <div className="coin-container">
                    <div className={`coin ${isFlipping ? 'flipping' : ''} ${result === 'tails' ? 'show-tails' : ''}`}>
                      <div className="coin-side coin-heads">
                        <div className="text-9xl">👑</div>
                        <p className="text-yellow-400 font-bold text-2xl mt-2">HEADS</p>
                      </div>
                      <div className="coin-side coin-tails">
                        <div className="text-9xl">💀</div>
                        <p className="text-gray-300 font-bold text-2xl mt-2">TAILS</p>
                      </div>
                    </div>
                  </div>

                  {showResult && result && (
                    <div className="mt-8 animate-fade-in">
                      <div className={`inline-block px-8 py-4 rounded-xl ${won ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}>
                        <p className={`text-4xl font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
                          {won ? '🎉 YOU WIN!' : '😢 YOU LOSE'}
                        </p>
                        <p className={`text-2xl mt-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
                          {won ? `+${(parseFloat(betAmount) * (2 - HOUSE_EDGE) - parseFloat(betAmount)).toFixed(4)}` : `-${parseFloat(betAmount).toFixed(4)}`} SOL
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Choose Side */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedSide('heads')}
                    className={`p-6 rounded-xl font-bold text-xl transition transform border-2 ${selectedSide === 'heads' ? 'bg-yellow-500/20 border-yellow-500 scale-105' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                    disabled={isFlipping}
                  >
                    <div className="text-5xl mb-2">👑</div>
                    <span className="text-white">HEADS</span>
                  </button>
                  <button
                    onClick={() => setSelectedSide('tails')}
                    className={`p-6 rounded-xl font-bold text-xl transition transform border-2 ${selectedSide === 'tails' ? 'bg-gray-500/20 border-gray-400 scale-105' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                    disabled={isFlipping}
                  >
                    <div className="text-5xl mb-2">💀</div>
                    <span className="text-white">TAILS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Betting Panel */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Place Bet</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Amount (SOL)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={currentBalance}
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 text-white text-xl text-center rounded-lg p-3 focus:border-purple-500 focus:outline-none"
                      disabled={isFlipping}
                    />
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {['0.01', '0.05', '0.1', '0.5', '1'].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setBetAmount(amount)}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded text-xs transition"
                          disabled={isFlipping}
                        >
                          {amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Potential Win</span>
                      <span className="text-green-400 font-bold">
                        +{(parseFloat(betAmount || '0') * (2 - HOUSE_EDGE) - parseFloat(betAmount || '0')).toFixed(4)} SOL
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Total Payout</span>
                      <span className="text-gray-400">{(parseFloat(betAmount || '0') * (2 - HOUSE_EDGE)).toFixed(4)} SOL</span>
                    </div>
                  </div>

                  <button
                    onClick={flipCoin}
                    disabled={isFlipping || currentBalance < parseFloat(betAmount)}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition ${!isFlipping && currentBalance >= parseFloat(betAmount) ? `bg-gradient-to-r ${demoMode ? 'from-blue-500 to-purple-500' : 'from-purple-600 to-pink-600'} hover:scale-105 text-white transform shadow-lg` : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                  >
                    {isFlipping ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin text-2xl">🪙</span>
                        Flipping...
                      </span>
                    ) : currentBalance < parseFloat(betAmount) ? (
                      'Insufficient Balance'
                    ) : demoMode ? (
                      '🎮 Flip (Demo)'
                    ) : (
                      '🎲 Flip Coin'
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Game Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">House Edge</span>
                    <span className="text-white">2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Win Chance</span>
                    <span className="text-white">50%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Multiplier</span>
                    <span className="text-green-400">1.96x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game History */}
          {history.length > 0 && (
            <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Recent Games</h3>
              <div className="space-y-2">
                {history.slice(0, 10).map((game, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg ${game.won ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{game.result === 'heads' ? '👑' : '💀'}</span>
                      <div>
                        <p className="text-white text-sm font-semibold">
                          {game.choice} → {game.result}
                          {game.demo && <span className="ml-2 text-blue-400 text-xs">(DEMO)</span>}
                        </p>
                        <p className="text-gray-500 text-xs">{game.bet.toFixed(4)} SOL</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                        {game.won ? '+' : '-'}{game.won ? (game.payout - game.bet).toFixed(4) : game.bet.toFixed(4)}
                      </p>
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
