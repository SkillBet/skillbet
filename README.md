# x402 Next.js + AI Starter Kit - Solana Edition

<img width="1914" height="911" alt="image" src="https://github.com/user-attachments/assets/6b045fa0-a7a4-413d-a3dd-e95b914e888f" />


[x402](https://x402.org) is a new protocol built on top of HTTP for doing fully accountless payments easily, quickly, cheaply and securely.

This **Solana Edition** template built with [Next.js](https://nextjs.org), [AI SDK](https://ai-sdk.dev), [AI Elements](https://ai-elements.dev), [AI Gateway](https://vercel.com/ai-gateway) and [Solana blockchain](https://docs.solana.com/) shows off using x402 with Solana payments and a modern AI stack.


## ✨ Features

- 🤖 **AI Chat with x402 Solana Integration** - Chat interface with tools that can use x402 payments on Solana
- 🔗 **MCP Server with Solana Support** - Remote MCP server with Solana account management
- 💰 **x402 Payment Protocol** - Real x402 payment functionality using Solana blockchain
- 🔐 **Solana Wallet Management** - Secure server-managed Solana wallets with automatic SOL airdrop (devnet)
- 🌐 **USDC Payments** - Support for USDC payments on both Solana devnet and mainnet
- 🎨 **Modern UI** - Clean, responsive interface built with Tailwind CSS

## 🛠 Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [AI SDK](https://ai-sdk.dev) - AI integration
- [AI Elements](https://ai-elements.dev) - AI UI components
- [AI Gateway](https://vercel.com/ai-gateway) - AI model routing
- [Solana](https://docs.solana.com/) - Blockchain platform
- [x402](https://x402.org) - Payment protocol
- [USDC](https://www.centre.io/usdc) - Stablecoin for payments

## 🚀 Getting Started

```bash
git clone https://github.com/vercel-labs/x402-ai-Solana
cd x402-ai-Solana
pnpm install
```

## 🔧 Running Locally

1. **Generate a Solana Keypair** (for testing):
   ```bash
   node -e "
   const { Keypair } = require('@solana/web3.js');
   const keypair = Keypair.generate();
   console.log('Private Key (base64):', Buffer.from(keypair.secretKey).toString('base64'));
   console.log('Public Key:', keypair.publicKey.toString());
   "
   ```

2. **Configure Environment Variables**:
   Following `.env.example`, set the following environment variables in `.env.local`:
   ```bash
   # Solana Configuration (Required)
   SOLANA_PRIVATE_KEY=<your-base64-private-key>
   SOLANA_NETWORK=solana-devnet
   SOLANA_RPC_URL=https://api.devnet.solana.com
   
   # AI Configuration (Required for Chat) - Choose ONE option:
   
   # Option 1: OpenAI (Easiest to get started)
   OPENAI_API_KEY=<your-openai-api-key>
   
   # Option 2: AI Gateway (Recommended for production)
   AI_GATEWAY_TOKEN=<your-ai-gateway-token>
   
   # Option 3: Other providers
   # ANTHROPIC_API_KEY=<your-anthropic-key>
   # GOOGLE_GENERATIVE_AI_API_KEY=<your-google-key>
   ```

3. **Get AI Provider Credentials**:
   **You need at least one AI provider for the chat to work:**
   
   **Option A: OpenAI (Recommended for testing)**
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add `OPENAI_API_KEY=your-key-here` to `.env.local`
   
   **Option B: AI Gateway (Recommended for production)**
   - Get a token from the [AI Gateway dashboard](https://vercel.com/ai-gateway)
   - Or run: `vc link` then `vc env pull`
   - Add `AI_GATEWAY_TOKEN=your-token-here` to `.env.local`

4. **Start the Development Server**:
   ```bash
   pnpm dev
   ```

5. **Open the App**:
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

## 🧪 Testing x402 Solana Integration

The app uses **Solana devnet** by default - a testing network with fake money:

- **Automatic SOL Airdrop**: The app automatically requests SOL from the devnet faucet when your balance is low
- **USDC Devnet**: Uses devnet USDC tokens for testing payments
- **x402 Integration**: Test the x402 payment protocol with the "Test x402 Payment" tool

### Available Tools:
- 🔍 **Solana Account Info** - View your wallet address and network
- 💰 **Test x402 Payment** - Verify x402 Solana integration is working
- 🎲 **Random Number Generator** - Basic tool functionality
- ➕ **Calculator** - Add two numbers

## 🚀 Going to Production

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to [Vercel](https://vercel.com/) and deploy
3. Add the required environment variables in your Vercel project settings

### Environment Variables for Production

```bash
# Solana Configuration
SOLANA_PRIVATE_KEY=<your-production-private-key>
SOLANA_NETWORK=solana  # Use 'solana' for mainnet
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# AI Gateway
AI_GATEWAY_TOKEN=<your-ai-gateway-token>
```

## 🌐 Moving to Mainnet

To move to Solana mainnet:

1. Set `SOLANA_NETWORK=solana` in your environment variables
2. Use a mainnet RPC URL: `https://api.mainnet-beta.solana.com`
3. **Fund your wallet** with real SOL and USDC for transactions
4. **Security**: Use a secure method to manage your private keys in production

### Funding Your Wallet

- **SOL**: Needed for transaction fees
- **USDC**: Used for x402 payments (mainnet address: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)

## 📚 Learn More

- [x402 Protocol Documentation](https://x402.gitbook.io/x402)
- [Solana Documentation](https://docs.solana.com/)
- [AI SDK Documentation](https://ai-sdk.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
