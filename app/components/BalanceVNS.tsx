"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";

// VNS ARC TESTNET ADDRESS
const VNS_ADDRESS = "0x8b0220cBbd658b5f2bAD2CDC24199278dA95f4DF" as const;

// Minimal ERC20 ABI
const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export function BalanceVNS() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<string>("0");

  const { data } = useReadContract({
    abi: erc20Abi,
    address: VNS_ADDRESS,
    functionName: "balanceOf",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!address,
      refetchInterval: 4000, // 4 saniyede bir refresh
    },
  });

  useEffect(() => {
    if (data) {
      const formatted = formatUnits(data as bigint, 18);
      setBalance(formatted);
    }
  }, [data]);

  if (!address)
    return (
      <p
        style={{
          color: "#fff",
          marginBottom: "20px",
          opacity: 0.7,
          fontSize: "16px",
        }}
      >
        Connect wallet to see VNS balance.
      </p>
    );

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "14px 20px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#4da6ff",
        fontSize: "20px",
        fontWeight: "600",
      }}
    >
      VNS Balance: {balance}
    </div>
  );
}

