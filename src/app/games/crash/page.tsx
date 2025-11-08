'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '@/components/WalletButton';

export default function CrashGamePage() {
  const { connected, publicKey } = useWallet();
  const wsRef = useRef<WebSocket | null>(null);

  const [gameState, setGameState] = useState({
    status: 'waiting',
    countdown: 5,
    multiplier: 1.00,
    crashPoint: 0,
    players: [],
    history: [],
  });

  const [betAmount, setBetAmount] = useState('0.1');
  const [hasBet, setHasBet] = useState(false);
  const [autoCashout, setAutoCashout] = useState('');
  const [cashedOut, setCashedOut] = useState(false);
  const [myCashout, setMyCashout] = useState(0);

  // Connect to WebSocket
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to game server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'initial_state') {
        setGameState(data.gameState);
      }

      if (data.type === 'countdown') {
        setGameState(prev => ({ ...prev, countdown: data.countdown }));
      }

      if (data.type === 'game_started') {
        setGameState(prev => ({ 
          ...prev, 
          status: 'running',
          crashPoint: data.crashPoint 
        }));
        setCashedOut(false);
      }

      if (data.type === 'multiplier_update') {
        setGameState(prev => ({ 
          ...prev, 
          multiplier: data.multiplier,
          players: data.players 
        }));

        // Auto cashout
        if (hasBet && !cashedOut && autoCashout && data.multiplier >= parseFloat(autoCashout)) {
          cashOut();
        }
      }

      if (data.type === 'game_crashed') {
        setGameState(prev => ({ 
          ...prev, 
          status: 'crashed',
          crashPoint: data.crashPoint,
          history: data.history 
        }));
        setHasBet(false);
      }

      if (data.type === 'player_joined') {
        setGameState(prev => ({ ...prev, players: data.players }));
      }

      if (data.type === 'player_cashed_out') {
        setGameState(prev => ({ ...prev, players: data.players }));
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const placeBet = () => {
    if (!connected || !publicKey) {
      alert('Connect wallet first!');
      return;
    }

    if (gameState.status !== 'waiting') {
      alert('Wait for next round!');
      return;
    }

    wsRef.current?.send(JSON.stringify({
      type: 'place_bet',
      wallet: publicKey.toString(),
      bet: parseFloat(betAmount),
    }));

    setHasBet(true);
  };

  const cashOut = () => {
    if (!hasBet || cashedOut) return;

    wsRef.current?.send(JSON.stringify({
      type: 'cash_out',
      wallet: publicKey?.toString(),
    }));

    setCashedOut(true);
    setMyCashout(gameState.multiplier);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e]">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-xl">
              🎰
            </div>
            <span className="text-xl font-bold text-white">SkillBet</span>
          </Link>
          <WalletButton />
        </div>
      </header>

      {/* History Bar */}
      <div className="bg-black/30 border-b border-gray-800 p-3">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-gray-500 text-sm mr-2">History:</span>
            {gameState.history.slice(0, 20).map((game: any, i: number) => (
              <div
                key={i}
                className={`px-3 py-1 rounded text-sm font-bold ${
                  game.crashPoint < 2 ? 'bg-red-500/20 text-red-400' :
                  game.crashPoint < 5 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}
              >
                {game.crashPoint.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Panel - Betting */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Place Bet</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Bet Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 text-white text-lg text-center rounded-lg p-3"
                    disabled={gameState.status !== 'waiting' || hasBet}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Auto Cashout (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(e.target.value)}
                    placeholder="2.00x"
                    className="w-full bg-black/50 border border-gray-700 text-white text-lg text-center rounded-lg p-3"
                  />
                </div>

                <button
                  onClick={placeBet}
                  disabled={gameState.status !== 'waiting' || hasBet}
                  className={`w-full py-4 rounded-xl font-bold transition ${
                    gameState.status === 'waiting' && !hasBet
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {hasBet ? '✅ Bet Placed' : 'Place Bet'}
                </button>
              </div>
            </div>

            {/* Players List */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">
                Players ({gameState.players.length})
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {gameState.players.map((player: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-black/30 rounded">
                    <div>
                      <p className="text-white text-sm font-mono">
                        {player.wallet.slice(0, 4)}...{player.wallet.slice(-4)}
                      </p>
                      <p className="text-gray-500 text-xs">{player.bet} SOL</p>
                    </div>
                    {player.cashedOut ? (
                      <span className="text-green-400 font-bold text-sm">
                        {player.cashoutMultiplier.toFixed(2)}x ✓
                      </span>
                    ) : (
                      <span className="text-yellow-400 text-sm">Playing...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Game Display */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 border border-gray-700 min-h-[600px] flex flex-col justify-center items-center">
              {gameState.status === 'waiting' && (
                <>
                  <div className="text-9xl mb-6 animate-pulse">⏳</div>
                  <h2 className="text-6xl font-bold text-white mb-4">
                    {gameState.countdown}
                  </h2>
                  <p className="text-gray-400 text-xl">Starting soon...</p>
                </>
              )}

              {gameState.status === 'running' && (
                <>
                  <div className="text-9xl mb-6 animate-bounce">🚀</div>
                  <h2 className={`text-9xl font-bold mb-8 ${
                    gameState.multiplier < 2 ? 'text-yellow-400' :
                    gameState.multiplier < 5 ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {gameState.multiplier.toFixed(2)}x
                  </h2>

                  {hasBet && !cashedOut && (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-gray-400 text-lg">Your Profit</p>
                        <p className="text-green-400 text-4xl font-bold">
                          +{(parseFloat(betAmount) * (gameState.multiplier - 1)).toFixed(4)} SOL
                        </p>
                      </div>
                      <button
                        onClick={cashOut}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-20 py-6 rounded-xl font-bold text-3xl hover:scale-105 transform transition shadow-2xl"
                      >
                        💰 CASH OUT
                      </button>
                    </>
                  )}

                  {cashedOut && (
                    <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-8">
                      <p className="text-green-400 font-bold text-4xl text-center">
                        ✅ Cashed Out!
                      </p>
                      <p className="text-white text-3xl mt-4 text-center">
                        {myCashout.toFixed(2)}x = +{(parseFloat(betAmount) * (myCashout - 1)).toFixed(4)} SOL
                      </p>
                    </div>
                  )}
                </>
              )}

              {gameState.status === 'crashed' && (
                <>
                  <div className="text-9xl mb-6">💥</div>
                  <h2 className="text-7xl font-bold text-red-400 mb-4">
                    CRASHED
                  </h2>
                  <p className="text-white text-5xl font-bold">
                    @ {gameState.crashPoint.toFixed(2)}x
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
