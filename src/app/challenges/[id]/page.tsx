'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '@/components/WalletButton';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Platform wallet that receives entry fees
const PLATFORM_WALLET = new PublicKey('D8UeL1pEWffA4rVVWoM4eLtiTPk9anRWMufi7zj5NKwX'); // ← Replace with your wallet

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
  const { connected, publicKey, sendTransaction } = useWallet();
  const challengeId = params.id as string;
  const challenge = challengeData[challengeId];

  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [transactionSignature, setTransactionSignature] = useState('');

  // Typing game state
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(60);
  const [wpm, setWpm] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ⚠️ ANTI-CHEAT: Cheat detection state
  const [cheated, setCheated] = useState(false);
  const [cheatReason, setCheatReason] = useState('');
  const lastKeyTime = useRef<number>(Date.now());
  const keyIntervals = useRef<number[]>([]);
  const characterCount = useRef<number>(0);

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

  // 💰 ACTUAL PAYMENT TRANSACTION
  const handlePayment = async () => {
    if (!connected || !publicKey) {
      setPaymentError('Please connect your wallet first!');
      return;
    }

    try {
      setPaying(true);
      setPaymentError('');

      // Connect to Solana
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        'confirmed'
      );

      // Check balance first
      const balance = await connection.getBalance(publicKey);
      const requiredAmount = challenge.entryFee * LAMPORTS_PER_SOL;
      
      if (balance < requiredAmount) {
        setPaymentError(`Insufficient balance. You need ${challenge.entryFee} SOL but have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        setPaying(false);
        return;
      }

      // Create payment transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PLATFORM_WALLET,
          lamports: requiredAmount,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      console.log('Payment transaction sent:', signature);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      // Save payment record to backend
      await fetch('/api/challenges/record-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          playerWallet: publicKey.toString(),
          amount: challenge.entryFee,
          transactionSignature: signature,
          timestamp: new Date().toISOString(),
        }),
      });

      setTransactionSignature(signature);
      setPaid(true);
      alert(`✅ Payment successful! ${challenge.entryFee} SOL paid.`);
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const startGame = () => {
    if (challenge.skillType === 'typing') {
      setCurrentText(typingTexts[Math.floor(Math.random() * typingTexts.length)]);
      setUserInput('');
      setTimer(60);
      setWpm(0);
      setCheated(false);
      setCheatReason('');
      lastKeyTime.current = Date.now();
      keyIntervals.current = [];
      characterCount.current = 0;
    }
    setGameStarted(true);
    setGameEnded(false);
  };

  const endGame = async () => {
    setGameEnded(true);
    if (challenge.skillType === 'typing' && !cheated) {
      const words = userInput.trim().split(' ').length;
      const minutes = (60 - timer) / 60;
      const calculatedWpm = Math.round(words / minutes);
      
      if (calculatedWpm > 280) {
        setCheated(true);
        setCheatReason('Impossibly high final speed (>280 WPM)');
        setWpm(0);
        setScore(0);
      } else {
        setWpm(calculatedWpm);
        setScore(calculatedWpm);

        // Record the attempt result
        const won = calculatedWpm >= challenge.targetScore;
        await fetch('/api/challenges/record-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            playerWallet: publicKey?.toString(),
            score: calculatedWpm,
            won,
            transactionSignature,
            timestamp: new Date().toISOString(),
          }),
        });

        // If won, trigger payout
        if (won) {
          await fetch('/api/challenges/pay-winner', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId,
              winnerWallet: publicKey?.toString(),
              amount: challenge.entryFee * 0.9,
            }),
          });
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setCheated(true);
    setCheatReason('Copy/paste detected - not allowed');
    alert('⚠️ Pasting is not allowed! Your attempt will not count.');
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setCheated(true);
    setCheatReason('Drag and drop detected - not allowed');
  };

  const handleTypingInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (cheated) return;

    const input = e.target.value;
    const now = Date.now();
    const interval = now - lastKeyTime.current;
    
    const charactersAdded = input.length - userInput.length;
    
    if (charactersAdded > 3) {
      setCheated(true);
      setCheatReason('Multiple characters entered simultaneously - paste or automation detected');
      return;
    }

    if (charactersAdded > 0 && keyIntervals.current.length > 10) {
      keyIntervals.current.push(interval);
      characterCount.current += charactersAdded;
      lastKeyTime.current = now;

      if (keyIntervals.current.length > 30) {
        const recentIntervals = keyIntervals.current.slice(-30);
        const avgInterval = recentIntervals.reduce((a, b) => a + b, 0) / 30;
        
        if (avgInterval < 15) {
          setCheated(true);
          setCheatReason('Sustained impossible typing speed - automation suspected');
          return;
        }
      }
    } else if (charactersAdded > 0) {
      keyIntervals.current.push(interval);
      characterCount.current += charactersAdded;
      lastKeyTime.current = now;
    }

    setUserInput(input);
    
    const words = input.trim().split(' ').length;
    const minutes = (60 - timer) / 60;
    if (minutes > 0) {
      const currentWpm = Math.round(words / minutes);
      setWpm(currentWpm);

      if (currentWpm > 300) {
        setCheated(true);
        setCheatReason('Impossibly high WPM detected (>300 WPM)');
        return;
      }
    }
  };

  if (!challenge) {
    return <div>Loading...</div>;
  }

  const didWin = score >= challenge.targetScore && !cheated;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/challenges" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
            <span>←</span>
            <span>Back to Challenges</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-gray-400 hover:text-white transition">
              👤 Profile
            </Link>
            <WalletButton />
          </div>
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

            {paymentError && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-400">{paymentError}</p>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={!connected || paying}
              className={`px-12 py-4 rounded-xl font-bold text-xl transition ${
                connected && !paying
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transform'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {paying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing Payment...
                </span>
              ) : connected ? (
                `Pay ${challenge.entryFee} SOL`
              ) : (
                'Connect Wallet First'
              )}
            </button>

            {transactionSignature && (
              <p className="text-xs text-gray-400 mt-4">
                Transaction: {transactionSignature.substring(0, 20)}...
              </p>
            )}
          </div>
        )}

        {/* Game Area - Rest of your existing game code stays the same */}
        {/* ... (keep all the existing game code) */}

      </main>
    </div>
  );
}
