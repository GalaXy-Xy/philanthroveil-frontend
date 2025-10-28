"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { usePhilanthroVeil } from "@/hooks/PhilanthroVeilProvider";

interface DonationSummary {
  projectId: number;
  projectName: string;
  projectDescription: string;
}

export default function MyDonationsPage() {
  const { accounts, connect, isConnected } = useMetaMask();
  const { contract } = usePhilanthroVeil();
  const [donations, setDonations] = useState<DonationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedAccount = accounts?.[0];

  const handleConnect = async () => {
    try {
      connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  useEffect(() => {
    const loadDonations = async () => {
      if (!contract || !selectedAccount) {
        return;
      }

      setIsLoading(true);
      try {
        // Get user's project list
        const projectIds = await contract.getUserProjects(selectedAccount);
        
        const donationsData: DonationSummary[] = [];
        for (const projectId of projectIds) {
          const projectData = await contract.getProject(projectId);
          donationsData.push({
            projectId: Number(projectId),
            projectName: projectData[0],
            projectDescription: projectData[1],
          });
        }

        setDonations(donationsData);
      } catch (error) {
        console.error("Failed to load donations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDonations();
  }, [contract, selectedAccount]);

  if (!isConnected || !selectedAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-slate-900">My Donations</h1>

          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-6">🔐</div>
            <p className="text-xl text-slate-600 mb-4">
              Connect your wallet to view your donation history.
            </p>
            <p className="text-sm text-slate-500">
              All your donation amounts are encrypted for maximum privacy
            </p>
            <button onClick={handleConnect} className="btn-primary mt-8 px-8 py-3">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">My Donations</h1>

        {/* Wallet Info */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Connected Wallet</p>
              <p className="font-mono text-lg font-semibold text-slate-900">
                {selectedAccount.slice(0, 10)}...{selectedAccount.slice(-8)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">Projects Supported</p>
              <p className="text-3xl font-bold text-blue-600">{donations.length}</p>
            </div>
          </div>
        </div>

        {/* Donations List */}
        {isLoading ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-slate-600">Loading your donations...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-6">💸</div>
            <p className="text-xl text-slate-600 mb-4">
              You haven't made any donations yet.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Start supporting projects and make a difference!
            </p>
            <Link href="/projects" className="btn-primary px-8 py-3 inline-block">
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <Link
                key={donation.projectId}
                href={`/projects/${donation.projectId}`}
                className="block"
              >
                <div className="glass-card p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {donation.projectName}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {donation.projectDescription}
                      </p>
                    </div>
                    <div className="ml-6 flex flex-col items-end">
                      <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg mb-2">
                        <span className="text-sm font-medium">View Details</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        Click to view project & decrypt your donation
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Privacy Notice */}
        {donations.length > 0 && (
          <div className="glass-card p-6 mt-8 bg-blue-50/70">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🔒</div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  Privacy Protected
                </h4>
                <p className="text-sm text-slate-600">
                  Your donation amounts are encrypted on-chain. Visit each project's detail
                  page to decrypt and view your contribution amount.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

