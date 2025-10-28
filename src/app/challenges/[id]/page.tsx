'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Sample challenge data (replace with real data from API later)
const challengeData: any = {
  '1': {
    id: '1',
    creator: '7xKX...gAsU',
    skillType: 'typing',
    targetScore: 85,
    entryFee: 0.1,
    attempts: 12,
  },
  '2': {
    id: '2',
    creator: '5bNm...pQrT',
    skillType: 'wordle',
    targetScore: 4,
    entryFee: 0.05,
    attempts: 8,
  },
  '3': {
    id: '3',
    creator: '9cDk...sVwX',
    skillType: 'chess',
    targetScore: 2000,
    entryFee: 0.2,
    attempts: 5,
  },
};

export default function AttemptChallengePage() {
  const params = useParams();
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const challengeId = params.id as string;
  const challenge = challengeData[challengeId];

  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [paid, setPaid] = useState(false);

  // Typing game state
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(60);
  const [wpm, setWpm] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const typingTexts = [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
    "Programming is the art of telling another human what one wants the computer to do. Code is like humor. When you have to explain it, it's bad.",
    "Blockchain technology enables trustless transactions between parties. Smart contracts execute automatically when conditions are met."
  ];

  useEffect(() => {
    if (!challenge) {
      router.push('/challenges');
    }
  }, [challenge, router]);

  useEffect(() => {
    if (gameStarted && !gameEnded && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && gameStarted) {
      endGame();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, gameStarted, gameEnded]);

  const handlePayment = () => {
    // TODO: Implement actual x402 payment here
    console.log('Processing payment of', challenge.entryFee, 'SOL');
    setPaid(true);
  };

  const startGame = () => {
    if (challenge.skillType === 'typing') {
      setCurrentText(typingTexts[Math.floor(Math.random() * typingTexts.length)]);
      setUserInput('');
      setTimer(60);
      setWpm(0);
    }
    setGameStarted(true);
    setGameEnded(false);
  };

  const endGame = () => {
    setGameEnded(true);
    if (challenge.skillType === 'typing') {
      const words = userInput.trim().split(' ').length;
      const minutes = (60 - timer) / 60;
      const calculatedWpm = Math.round(words / minutes);
      setWpm(calculatedWpm);
      setScore(calculatedWpm);
    }
  };

  const handleTypingInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setUserInput(input);
    
    // Calculate WPM in real-time
    const words = input.trim().split(' ').length;
    const minutes = (60 - timer) / 60;
    if (minutes > 0) {
      const currentWpm = Math.round(words / minutes);
      setWpm(currentWpm);
    }
  };

  if (!challenge) {
    return <div>Loading...</div>;
  }

  const didWin = score >= challenge.targetScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/challenges" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
            <span>←</span>
            <span>Back to Challenges</span>
          </Link>
          <WalletMultiButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Challenge Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 capitalize">
                {challenge.skillType} Challenge
              </h1>
              <p className="text-gray-400">by {challenge.creator}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Target Score</p>
              <p className="text-4xl font-bold text-white">{challenge.targetScore} WPM</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Entry Fee</p>
              <p className="text-2xl font-bold text-purple-300">{challenge.entryFee} SOL</p>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Potential Win</p>
              <p className="text-2xl font-bold text-green-300">{(challenge.entryFee * 0.9).toFixed(2)} SOL</p>
            </div>
          </div>
        </div>

        {/* Payment Step */}
        {!paid && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-3xl font-bold text-white mb-4">Pay Entry Fee</h2>
            <p className="text-gray-300 mb-6">
              Pay {challenge.entryFee} SOL to attempt this challenge
            </p>
            <button
              onClick={handlePayment}
              disabled={!connected}
              className={`px-12 py-4 rounded-xl font-bold text-xl transition ${
                connected
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transform'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {connected ? `Pay ${challenge.entryFee} SOL` : 'Connect Wallet First'}
            </button>
          </div>
        )}

        {/* Game Area */}
        {paid && !gameStarted && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
            <div className="text-6xl mb-4">⌨️</div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
            <p className="text-gray-300 mb-6">
              You have 60 seconds to type as much as you can. Beat {challenge.targetScore} WPM to win!
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-4 rounded-xl font-bold text-xl hover:scale-105 transform transition"
            >
              Start Challenge 🚀
            </button>
          </div>
        )}

        {/* Typing Game */}
        {gameStarted && !gameEnded && challenge.skillType === 'typing' && (
          <div className="space-y-6">
            {/* Timer & WPM */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
                <p className="text-gray-400 text-sm mb-2">Time Left</p>
                <p className="text-5xl font-bold text-white">{timer}s</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
                <p className="text-gray-400 text-sm mb-2">Current WPM</p>
                <p className={`text-5xl font-bold ${wpm >= challenge.targetScore ? 'text-green-400' : 'text-white'}`}>
                  {wpm}
                </p>
              </div>
            </div>

            {/* Text to Type */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <p className="text-gray-400 text-sm mb-4">Type this text:</p>
              <p className="text-white text-lg leading-relaxed font-mono mb-4">
                {currentText}
              </p>
            </div>

            {/* Input Area */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <textarea
                value={userInput}
                onChange={handleTypingInput}
                placeholder="Start typing here..."
                className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-4 text-lg font-mono min-h-[200px] focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>

            <button
              onClick={endGame}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-bold transition"
            >
              Finish Early
            </button>
          </div>
        )}

        {/* Results */}
        {gameEnded && (
          <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 ${didWin ? 'border-green-500' : 'border-red-500'} text-center`}>
            <div className="text-8xl mb-4">{didWin ? '🎉' : '😢'}</div>
            <h2 className={`text-4xl font-bold mb-4 ${didWin ? 'text-green-400' : 'text-red-400'}`}>
              {didWin ? 'You Won!' : 'You Lost'}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Your Score</p>
                <p className="text-3xl font-bold text-white">{score} WPM</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Target</p>
                <p className="text-3xl font-bold text-white">{challenge.targetScore} WPM</p>
              </div>
            </div>

            {didWin && (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 mb-6">
                <p className="text-green-400 font-bold text-xl mb-2">You earned:</p>
                <p className="text-4xl font-bold text-green-300">{(challenge.entryFee * 0.9).toFixed(2)} SOL</p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setPaid(false);
                  setGameStarted(false);
                  setGameEnded(false);
                  setScore(0);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition"
              >
                Try Again
              </button>
              <Link
                href="/challenges"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-bold transition"
              >
                Back to Challenges
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
