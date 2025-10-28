"use client";

import Link from "next/link";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useEffect, useState } from "react";

export function Navbar() {
  const { accounts, connect, isConnected } = useMetaMask();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    try {
      connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };
  
  const selectedAccount = accounts?.[0];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="glass-card sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎭</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              PhilanthroVeil
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/projects"
              className="text-slate-700 hover:text-blue-600 font-medium transition"
            >
              Projects
            </Link>
            <Link
              href="/projects/create"
              className="text-slate-700 hover:text-blue-600 font-medium transition"
            >
              Create Project
            </Link>
            <Link
              href="/my-donations"
              className="text-slate-700 hover:text-blue-600 font-medium transition"
            >
              My Donations
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {mounted && selectedAccount ? (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  {formatAddress(selectedAccount)}
                </span>
              </div>
            ) : (
              <button onClick={handleConnect} className="btn-primary">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

