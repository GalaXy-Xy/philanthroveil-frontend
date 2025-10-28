"use client";

import { ethers } from "ethers";
import { useCallback, useMemo, useRef, useState } from "react";
import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { PhilanthroVeilABI } from "@/abi/PhilanthroVeilABI";
import { PhilanthroVeilAddresses } from "@/abi/PhilanthroVeilAddresses";

export const usePhilanthroVeil = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
  } = parameters;

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const contractAddress = useMemo(() => {
    if (!chainId) return undefined;
    const entry =
      PhilanthroVeilAddresses[
        chainId.toString() as keyof typeof PhilanthroVeilAddresses
      ];
    if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
      return undefined;
    }
    return entry.address as `0x${string}`;
  }, [chainId]);

  const contract = useMemo(() => {
    if (!contractAddress || !ethersReadonlyProvider) return null;
    return new ethers.Contract(
      contractAddress,
      PhilanthroVeilABI.abi,
      ethersReadonlyProvider
    );
  }, [contractAddress, ethersReadonlyProvider]);

  const writeContract = useMemo(() => {
    if (!contractAddress || !ethersSigner) return null;
    return new ethers.Contract(
      contractAddress,
      PhilanthroVeilABI.abi,
      ethersSigner
    );
  }, [contractAddress, ethersSigner]);

  // Create project
  const createProject = useCallback(
    async (name: string, description: string, goal: string, imageUrl: string) => {
      if (!writeContract || !contract) throw new Error("No signer");
      
      setIsLoading(true);
      setMessage("Creating project...");
      try {
        const tx = await writeContract.createProject(name, description, goal, imageUrl);
        setMessage("Waiting for confirmation...");
        await tx.wait();
        
        // Get the current project count (newly created project ID is count - 1)
        const projectCount = await contract.projectCount();
        const projectId = Number(projectCount) - 1;
        
        setMessage("Project created successfully!");
        return projectId;
      } catch (error: any) {
        setMessage("Failed to create project: " + error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [writeContract, contract]
  );

  // Donate with encrypted amount
  const donate = useCallback(
    async (projectId: number, amountInEth: string) => {
      if (!writeContract || !instance || !ethersSigner) {
        throw new Error("Not ready");
      }

      setIsLoading(true);
      setMessage("Encrypting donation...");
      
      try {
        const amountInWei = ethers.parseEther(amountInEth);
        
        // Create encrypted input
        const input = instance.createEncryptedInput(
          contractAddress!,
          await ethersSigner.getAddress()
        );
        input.add64(BigInt(amountInWei.toString()));
        
        const encrypted = await input.encrypt();
        
        setMessage("Submitting donation...");
        const tx = await writeContract.donate(
          projectId,
          encrypted.handles[0],
          encrypted.inputProof,
          { value: amountInWei }
        );
        
        setMessage("Waiting for confirmation...");
        await tx.wait();
        setMessage("Donation successful!");
        return true;
      } catch (error: any) {
        setMessage("Donation failed: " + error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [writeContract, instance, ethersSigner, contractAddress]
  );

  // Decrypt total donations
  const decryptTotalDonations = useCallback(
    async (projectId: number) => {
      if (!writeContract || !instance || !ethersSigner || !contractAddress) {
        throw new Error("Not ready");
      }

      setIsLoading(true);
      setMessage("Requesting authorization...");
      
      try {
        // Send real transaction to trigger FHE.allowTransient
        const tx = await writeContract.getTotalDonations(projectId);
        await tx.wait();
        
        setMessage("Fetching encrypted data...");
        // Now use staticCall to get the return value (authorization is active)
        const encryptedTotal = await writeContract.getTotalDonations.staticCall(projectId);
        
        setMessage("Requesting decryption signature...");
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contractAddress],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (!sig) {
          throw new Error("Failed to get decryption signature");
        }

        setMessage("Decrypting...");
        const res = await instance.userDecrypt(
          [{ handle: encryptedTotal, contractAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const decrypted = res[encryptedTotal];
        setMessage("Decryption successful!");
        // Convert to BigInt if needed
        const amount = typeof decrypted === 'bigint' ? decrypted : BigInt(decrypted.toString());
        return ethers.formatEther(amount);
      } catch (error: any) {
        setMessage("Decryption failed: " + error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [writeContract, instance, ethersSigner, contractAddress, fhevmDecryptionSignatureStorage]
  );

  // Get and decrypt leaderboard
  const getLeaderboard = useCallback(
    async (projectId: number, limit: number = 10) => {
      if (!writeContract || !instance || !ethersSigner || !contractAddress) {
        throw new Error("Not ready");
      }

      setIsLoading(true);
      setMessage("Requesting authorization...");
      
      try {
        // Send real transaction to grant permanent authorization
        const tx = await writeContract.getLeaderboard(projectId, limit);
        await tx.wait();
        
        setMessage("Fetching leaderboard...");
        // Use staticCall to get return value
        const result = await writeContract.getLeaderboard.staticCall(projectId, limit);
        const encryptedAmounts = result[0];
        const donorAddresses = result[1];
        
        if (encryptedAmounts.length === 0) {
          setMessage("No donations yet");
          return [];
        }

        setMessage("Requesting decryption signature...");
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contractAddress],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (!sig) {
          throw new Error("Failed to get decryption signature");
        }

        setMessage("Decrypting leaderboard...");
        // Prepare handles for decryption
        const handles = encryptedAmounts.map((amount: any) => ({
          handle: amount,
          contractAddress,
        }));

        const res = await instance.userDecrypt(
          handles,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        // Aggregate by donor address
        setMessage("Aggregating by donor...");
        const donorMap = new Map<string, bigint>();
        
        for (let i = 0; i < encryptedAmounts.length; i++) {
          const amount = encryptedAmounts[i];
          const donor = donorAddresses[i].toLowerCase();
          const decrypted = res[amount];
          const amountBigInt = typeof decrypted === 'bigint' ? decrypted : BigInt(decrypted.toString());
          
          // Aggregate amounts for the same donor
          if (donorMap.has(donor)) {
            donorMap.set(donor, donorMap.get(donor)! + amountBigInt);
          } else {
            donorMap.set(donor, amountBigInt);
          }
        }

        // Convert map to array and sort by amount descending
        const leaderboard = Array.from(donorMap.entries()).map(([donor, totalAmount]) => ({
          donor,
          amount: ethers.formatEther(totalAmount),
          amountWei: totalAmount.toString(),
          rank: 0, // Will be updated after sorting
        }));

        // Sort by amount descending
        leaderboard.sort((a, b) => {
          return BigInt(b.amountWei) > BigInt(a.amountWei) ? 1 : -1;
        });

        // Update ranks after sorting
        leaderboard.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        setMessage("Leaderboard decrypted!");
        return leaderboard;
      } catch (error: any) {
        setMessage("Failed to load leaderboard: " + error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [writeContract, instance, ethersSigner, contractAddress, fhevmDecryptionSignatureStorage]
  );

  return {
    contractAddress,
    contract,
    writeContract,
    createProject,
    donate,
    decryptTotalDonations,
    getLeaderboard,
    isLoading,
    message,
  };
};

