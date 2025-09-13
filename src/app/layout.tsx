import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "x402 AI Starter Kit - Solana Edition",
  description:
    "A demo of agentic payments powered by x402 using Next.js, AI SDK, AI Elements, AI Gateway, and Solana blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div className="size-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <header className={`${geistSans.className} border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">x4</span>
                    </div>
                    <div>
                      <Link
                        href="https://github.com/vercel-labs/x402-ai-starter"
                        className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        x402 AI Starter Kit
                      </Link>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Solana Edition
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Powered by</span>
                      <Link href="https://nextjs.org" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                        Next.js
                      </Link>
                      <span>•</span>
                      <Link href="https://ai-sdk.dev" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                        AI SDK
                      </Link>
                      <span>•</span>
                      <Link href="https://docs.solana.com/" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                        Solana
                      </Link>
                    </div>
                    
                    <Link href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fx402-ai-starter&env=SOLANA_PRIVATE_KEY,SOLANA_NETWORK,SOLANA_RPC_URL&envDescription=Solana%20configuration%20needed%20for%20blockchain%20integration%20and%20payments&envLink=https%3A%2F%2Fdocs.solana.com%2F&project-name=x402-ai-starter-solana&repository-name=x402-ai-starter-solana&demo-title=x402%20AI%20Starter%20-%20Solana%20Edition&demo-description=A%20fullstack%20template%20for%20using%20x402%20with%20Solana%20blockchain%2C%20MCP%20and%20AI%20SDK&demo-url=https%3A%2F%2Fx402-ai-starter.labs.vercel.dev%2F&demo-image=https%3A%2F%2Fx402-ai-starter.labs.vercel.dev%2Fscreenshot.png"
                      className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Deploy to Vercel
                    </Link>
                  </div>
                </div>
                
                <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Chat with x402 Solana tools
                  </Link>
                  <Link 
                    href="/playground" 
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                  >
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    API playground (coming soon)
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
