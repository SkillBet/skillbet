import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SolanaWalletProvider from "@/components/SolanaWalletProvider";


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "SkillBet 2.0 - Turn Your Skills Into Passive Income",
  description: "Challenge others in typing, Wordle, chess & trivia. Winners earn, creators profit 24/7.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
