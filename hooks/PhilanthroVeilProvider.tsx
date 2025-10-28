"use client";

import { createContext, useContext, ReactNode } from "react";
import { useMetaMask } from "./metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "./metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/fhevm/useFhevm";
import { usePhilanthroVeil as usePhilanthroVeilBase } from "./usePhilanthroVeil";
import { ethers } from "ethers";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";

// Simple in-memory storage for signatures
class InMemoryStorage implements GenericStringStorage {
  private storage = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

const storage = new InMemoryStorage();

type PhilanthroVeilContextType = ReturnType<typeof usePhilanthroVeilBase>;

const PhilanthroVeilContext = createContext<PhilanthroVeilContextType | undefined>(undefined);

export function PhilanthroVeilProvider({ children }: { children: ReactNode }) {
  const { provider, chainId } = useMetaMask();
  const { ethersSigner, ethersReadonlyProvider } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId });

  const value = usePhilanthroVeilBase({
    instance,
    fhevmDecryptionSignatureStorage: storage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
  });

  return (
    <PhilanthroVeilContext.Provider value={value}>
      {children}
    </PhilanthroVeilContext.Provider>
  );
}

export function usePhilanthroVeil() {
  const context = useContext(PhilanthroVeilContext);
  if (!context) {
    throw new Error("usePhilanthroVeil must be used within PhilanthroVeilProvider");
  }
  return context;
}

