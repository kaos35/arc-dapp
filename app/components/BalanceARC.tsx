"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";

// ARC token adresi
const ARC_ADDRESS = "0x58D3e325b6a8c31a4F3f5fB90762e067c8baF046";

// Minimal ERC20 ABI (balanceOf)
const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
];

export function BalanceARC() {
  const { address } = useAccount();

  const { data: balance, isLoading } = useReadContract({
    abi: erc20Abi,
    address: ARC_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const formatted = balance ? formatUnits(balance as bigint, 18) : "0";

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "12px 20px",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#4da6ff",
        fontWeight: "bold",
      }}
    >
      ARC Balance: {isLoading ? "Loading..." : formatted}
    </div>
  );
}
