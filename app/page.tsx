"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            PhilanthroVeil
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8">
            Privacy-Preserving Charitable Giving on Blockchain
          </p>
          <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
            Donate anonymously with fully encrypted amounts. Support causes you care about while maintaining complete privacy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/projects"
              className="btn-primary px-8 py-4 text-lg inline-block"
            >
              Explore Projects
            </Link>
            <Link
              href="/projects/create"
              className="btn-outline px-8 py-4 text-lg inline-block"
            >
              Create Project
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-8 hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Complete Privacy</h3>
              <p className="text-slate-600">
                Donation amounts are fully encrypted on-chain
              </p>
            </div>
            
            <div className="glass-card p-8 hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">🧮</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Verifiable Aggregation</h3>
              <p className="text-slate-600">
                Calculate totals without revealing individual amounts
              </p>
            </div>
            
            <div className="glass-card p-8 hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Anonymous Rankings</h3>
              <p className="text-slate-600">
                See leaderboards without exposing donor identities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

