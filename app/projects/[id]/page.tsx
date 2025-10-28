"use client";

import { use } from "react";
import { usePhilanthroVeil } from "@/hooks/PhilanthroVeilProvider";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Link from "next/link";

interface Project {
  name: string;
  description: string;
  goal: string;
  imageUrl: string;
  creator: string;
  donorCount: number;
  isActive: boolean;
  createdAt: number;
}

interface LeaderboardEntry {
  rank: number;
  donor: string;
  amount: string;
  amountWei: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { contract, donate, decryptTotalDonations, getLeaderboard, isLoading: contractLoading } = usePhilanthroVeil();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [totalDonations, setTotalDonations] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      if (!contract) {
        setIsLoading(false);
        return;
      }

      try {
        const projectData = await contract.getProject(Number(id));
        setProject({
          name: projectData[0],
          description: projectData[1],
          goal: projectData[2],
          imageUrl: projectData[3],
          creator: projectData[4],
          donorCount: Number(projectData[5]),
          // projectData[6] is totalDonations (euint64) - skip it
          isActive: projectData[7],
          createdAt: Number(projectData[8]),
        });
      } catch (error) {
        console.error("Failed to load project:", error);
        setError("Failed to load project details");
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [contract, id]);

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }

    setIsDonating(true);
    setError("");

    try {
      await donate(Number(id), donationAmount);
      
      // Reload project data after successful donation
      const projectData = await contract!.getProject(Number(id));
      setProject({
        name: projectData[0],
        description: projectData[1],
        goal: projectData[2],
        imageUrl: projectData[3],
        creator: projectData[4],
        donorCount: Number(projectData[5]),
        isActive: projectData[6],
        createdAt: Number(projectData[7]),
      });
      
      setDonationAmount("");
      alert("✅ Donation successful! Your contribution has been encrypted on-chain.");
    } catch (error: any) {
      console.error("Donation failed:", error);
      setError(error.message || "Donation failed. Please try again.");
    } finally {
      setIsDonating(false);
    }
  };

  const handleDecryptTotal = async () => {
    setIsDecrypting(true);
    setError("");

    try {
      const total = await decryptTotalDonations(Number(id));
      setTotalDonations(total);
    } catch (error: any) {
      console.error("Decryption failed:", error);
      setError(error.message || "Failed to decrypt total donations");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleLoadLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    setError("");

    try {
      const data = await getLeaderboard(Number(id), 10);
      setLeaderboard(data);
    } catch (error: any) {
      console.error("Failed to load leaderboard:", error);
      setError(error.message || "Failed to load leaderboard");
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading || contractLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Not Found</h2>
          <p className="text-slate-600 mb-8">
            The project you're looking for doesn't exist or hasn't been created yet.
          </p>
          <Link href="/projects" className="btn-primary px-8 py-3 inline-block">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/projects" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center">
          ← Back to Projects
        </Link>

        <h1 className="text-4xl font-bold mb-2 text-slate-900">{project.name}</h1>
        <p className="text-slate-500 mb-8">Created on {formatDate(project.createdAt)}</p>

        {/* Project Information */}
        <div className="glass-card p-8 mb-6">
          {project.imageUrl && (
            <div className="mb-6 h-64 rounded-lg overflow-hidden bg-slate-200">
              <img
                src={project.imageUrl}
                alt={project.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
          
          <h2 className="text-2xl font-semibold mb-4 text-slate-900">About This Project</h2>
          <p className="text-slate-600 mb-6 whitespace-pre-wrap">{project.description}</p>
          
          {project.goal && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Project Goal</h3>
              <p className="text-slate-700">{project.goal}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Total Donors</p>
              <p className="text-2xl font-bold text-slate-900">{project.donorCount}</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Status</p>
              <p className="text-lg font-bold">
                {project.isActive ? (
                  <span className="text-green-600">● Active</span>
                ) : (
                  <span className="text-red-600">● Closed</span>
                )}
              </p>
            </div>
            <div className="col-span-2 bg-slate-100 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-2">Total Donations (Encrypted)</p>
              {totalDonations ? (
                <p className="text-2xl font-bold text-blue-600">{totalDonations} ETH</p>
              ) : (
                <button
                  onClick={handleDecryptTotal}
                  disabled={isDecrypting}
                  className="btn-outline text-sm px-4 py-2"
                >
                  {isDecrypting ? "Decrypting..." : "🔓 Decrypt Total"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Anonymous Leaderboard */}
        <div className="glass-card p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Anonymous Leaderboard</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Top donors ranked by encrypted contributions (amounts hidden)
                  </p>
                </div>
            {leaderboard.length === 0 && (
              <button
                onClick={handleLoadLeaderboard}
                disabled={isLoadingLeaderboard}
                className="btn-outline px-6 py-2"
              >
                {isLoadingLeaderboard ? "Loading..." : "🏆 Load Leaderboard"}
              </button>
            )}
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                        ${entry.rank === 1 ? 'bg-yellow-500' : ''}
                        ${entry.rank === 2 ? 'bg-gray-400' : ''}
                        ${entry.rank === 3 ? 'bg-amber-700' : ''}
                        ${entry.rank > 3 ? 'bg-blue-500' : ''}
                      `}
                    >
                      #{entry.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold text-slate-900">
                        {entry.donor.slice(0, 6)}...{entry.donor.slice(-4)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {entry.rank === 1 && '🥇 Top Donor'}
                        {entry.rank === 2 && '🥈 2nd Place'}
                        {entry.rank === 3 && '🥉 3rd Place'}
                        {entry.rank > 3 && `Top ${entry.rank}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">🔒</div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Amount Hidden</p>
                        <p className="text-xs text-slate-400">Privacy Protected</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-slate-600 mb-4">
                {project.donorCount === 0
                  ? "No donations yet. Be the first!"
                  : "Click the button above to decrypt and view the leaderboard"}
              </p>
                <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto mt-4">
                  <p className="text-sm text-slate-700">
                    <strong>🔐 Privacy Notice:</strong> The leaderboard shows donor addresses and 
                    rankings, but <strong>donation amounts remain encrypted</strong>. This allows 
                    verification of participation while protecting financial privacy.
                  </p>
                </div>
            </div>
          )}
        </div>

        {/* Donation Form */}
        {project.isActive ? (
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold mb-6 text-slate-900">Make a Donation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="0.001"
                  disabled={isDonating}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleDonate}
                disabled={isDonating || !donationAmount}
                className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDonating ? "Processing..." : "🔒 Donate Anonymously"}
              </button>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-slate-700">
                  <strong>🔐 Privacy Notice:</strong> Your donation amount will be fully encrypted
                  on-chain. Only you can decrypt your contribution amount. The project creator can
                  see the total donations but not individual amounts or donor identities.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Project Closed</h3>
            <p className="text-slate-600">
              This project is no longer accepting donations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

