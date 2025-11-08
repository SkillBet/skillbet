const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Game state
let gameState = {
  status: 'waiting', // 'waiting', 'running', 'crashed'
  countdown: 5,
  multiplier: 1.00,
  crashPoint: 0,
  players: [], // {wallet, bet, cashedOut, cashoutMultiplier}
  history: [], // Last 50 games
};

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Generate crash point (provably fair)
function generateCrashPoint() {
  const random = Math.random();
  if (random < 0.02) return 1.00; // 2% instant crash
  if (random < 0.05) return 1.00 + Math.random() * 0.5; // 3% crash under 1.5x
  return 1.00 + Math.random() * 10; // Normal crash 1-10x
}

// Start game countdown
function startCountdown() {
  gameState.status = 'waiting';
  gameState.countdown = 5;
  gameState.players = [];
  
  const countdownInterval = setInterval(() => {
    gameState.countdown--;
    broadcast({ type: 'countdown', countdown: gameState.countdown });
    
    if (gameState.countdown <= 0) {
      clearInterval(countdownInterval);
      startGame();
    }
  }, 1000);
}

// Start game
function startGame() {
  gameState.status = 'running';
  gameState.multiplier = 1.00;
  gameState.crashPoint = parseFloat(generateCrashPoint().toFixed(2));
  
  broadcast({ type: 'game_started', crashPoint: gameState.crashPoint });
  
  const gameInterval = setInterval(() => {
    gameState.multiplier += 0.01;
    gameState.multiplier = parseFloat(gameState.multiplier.toFixed(2));
    
    broadcast({ 
      type: 'multiplier_update', 
      multiplier: gameState.multiplier,
      players: gameState.players 
    });
    
    if (gameState.multiplier >= gameState.crashPoint) {
      clearInterval(gameInterval);
      endGame();
    }
  }, 100);
}

// End game
function endGame() {
  gameState.status = 'crashed';
  
  // Add to history
  gameState.history.unshift({
    crashPoint: gameState.crashPoint,
    timestamp: Date.now(),
    players: gameState.players.length,
  });
  
  if (gameState.history.length > 50) {
    gameState.history.pop();
  }
  
  broadcast({ 
    type: 'game_crashed', 
    crashPoint: gameState.crashPoint,
    history: gameState.history 
  });
  
  // Start new round after 3 seconds
  setTimeout(() => {
    startCountdown();
  }, 3000);
}

// WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send current state
  ws.send(JSON.stringify({
    type: 'initial_state',
    gameState,
  }));
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'place_bet' && gameState.status === 'waiting') {
      gameState.players.push({
        wallet: data.wallet,
        bet: data.bet,
        cashedOut: false,
        cashoutMultiplier: 0,
      });
      
      broadcast({ 
        type: 'player_joined', 
        players: gameState.players 
      });
    }
    
    if (data.type === 'cash_out' && gameState.status === 'running') {
      const player = gameState.players.find(p => p.wallet === data.wallet);
      if (player && !player.cashedOut) {
        player.cashedOut = true;
        player.cashoutMultiplier = gameState.multiplier;
        
        broadcast({ 
          type: 'player_cashed_out', 
          wallet: data.wallet,
          multiplier: gameState.multiplier,
          players: gameState.players 
        });
      }
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start first game
startCountdown();

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Crash game server running on port ${PORT}`);
});
