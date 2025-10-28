"use client";

import { MetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { MetaMaskEthersSignerProvider } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { PhilanthroVeilProvider } from "@/hooks/PhilanthroVeilProvider";

const initialMockChains = {
  31337: "http://127.0.0.1:8545",
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MetaMaskProvider>
      <MetaMaskEthersSignerProvider initialMockChains={initialMockChains}>
        <PhilanthroVeilProvider>
          {children}
        </PhilanthroVeilProvider>
      </MetaMaskEthersSignerProvider>
    </MetaMaskProvider>
  );
}

