<div align="center">

# 🎰 SkillBet Casino

### The Future of Crypto Gaming on Solana

[![Solana](https://img.shields.io/badge/Solana-14F195?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[🎮 Live Demo](https://skillbet-casino.vercel.app) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/yourusername/skillbet-casino/issues) • [✨ Request Feature](https://github.com/yourusername/skillbet-casino/issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Games](#games)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Provably Fair](#provably-fair)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About

**SkillBet Casino** is a decentralized, provably fair crypto casino built on the Solana blockchain. Experience instant deposits and withdrawals, non-custodial gaming, and transparent game outcomes verified on-chain.

### Why SkillBet?

- ⚡ **Lightning Fast** - Built on Solana for instant transactions
- 🔒 **Non-Custodial** - You control your funds, always
- ✅ **Provably Fair** - Verifiable game outcomes using cryptographic seeds
- 💰 **Low Fees** - Minimal transaction costs on Solana
- 🎮 **Demo Mode** - Try games risk-free before playing with real money
- 🌐 **No KYC** - Play anonymously, no registration required

---

## ✨ Features

### Core Features

- 🎲 **Three Exciting Games**
  - 💎 Mines - Uncover gems, avoid bombs
  - 🚀 Crash - Ride the multiplier, cash out before crash
  - 🪙 Coin Flip - Classic 50/50 double or nothing

- 🔐 **Provably Fair System**
  - SHA-256 cryptographic seed generation
  - Client + Server seed verification
  - Transparent game outcomes

- 🎮 **Dual Mode Gaming**
  - Demo Mode - Practice with virtual balance
  - Real Mode - Play with SOL or $SKILL token

- 🤖 **Advanced Betting**
  - Manual betting with strategic control
  - Auto-betting with customizable strategies
  - Stop on profit/loss limits
  - Progressive betting (increase on win/loss)

- 💳 **Seamless Wallet Integration**
  - Phantom Wallet
  - Solflare
  - Slope
  - And more via Solana Wallet Adapter

### Player Experience

- 📊 Real-time statistics tracking
- 📜 Complete game history
- 🎨 Modern, responsive UI
- 📱 Mobile-friendly design
- ⚡ Instant payouts
- 🔄 Auto-refresh balance

---

## 🎮 Games

### 💎 Mines

Uncover hidden gems while avoiding mines in a 5x5 grid.

**Features:**
- Adjustable mine count (1-24)
- Progressive multipliers
- Cash out anytime
- Auto-play mode with custom tile reveals

**RTP:** 98% (2% house edge)

---

### 🚀 Crash

Watch the multiplier rise and cash out before it crashes!

**Features:**
- Real-time multiplayer
- Up to 1000x multiplier
- Auto-cashout option
- Live player tracking

**RTP:** 97% (3% house edge)

---

### 🪙 Coin Flip

Classic heads or tails - double your bet or lose it all.

**Features:**
- Instant results
- 50/50 odds
- Simple gameplay
- Perfect for quick wins

**RTP:** 98% (2% house edge)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Animations:** Custom CSS animations

### Blockchain
- **Blockchain:** Solana
- **Wallet Integration:** @solana/wallet-adapter-react
- **Web3 Library:** @solana/web3.js
- **Token Standard:** SPL Token

### Deployment
- **Hosting:** Vercel
- **Backend:** Node.js (for WebSocket server)
- **Database:** LocalStorage (client-side stats)

### Security
- **Cryptography:** Web Crypto API (SHA-256)
- **Seed Generation:** Cryptographically secure random values
- **Transaction Signing:** Client-side only

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Solana wallet (Phantom recommended)
- Git

### Installation

