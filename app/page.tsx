"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";

// Sadece transfer için token adresleri
const USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as const;
const EURC_ADDRESS =
  "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;

// Minimal ERC-20 ABI
const erc20Abi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

export default function Home() {
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const [token, setToken] = useState<"USDC" | "EURC">("USDC");

  const { isConnected } = useAccount();

  const {
    writeContract,
    data: txHash,
    isPending,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // -----------------------------
  // TRANSFER HANDLER 
  // -----------------------------
  const handleTransfer = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!to || !amount) {
      alert("Recipient address and amount are required.");
      return;
    }

    const tokenAddress = token === "USDC" ? USDC_ADDRESS : EURC_ADDRESS;

    await writeContract({
      abi: erc20Abi,
      address: tokenAddress,
      functionName: "transfer",
      args: [to, parseUnits(amount, 6)],
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "40px",
      }}
    >
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>
        Transfer USDC & EURC on Arc
      </h1>

      <div
        style={{
          width: "480px",
          padding: "48px",
          borderRadius: "20px",
        }}
        className="glass-card"
      >
        <label>Recipient</label>
        <input
          className="input"
          placeholder="0x..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        <label style={{ marginTop: "16px" }}>Token</label>
        <select
          className="select"
          value={token}
          onChange={(e) =>
            setToken(e.target.value === "USDC" ? "USDC" : "EURC")
          }
        >
          <option value="USDC">USDC</option>
          <option value="EURC">EURC</option>
        </select>

        <label style={{ marginTop: "16px" }}>Amount</label>
        <input
          className="input"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          className="btn-primary"
          style={{ marginTop: "20px" }}
          onClick={handleTransfer}
          disabled={isPending || isConfirming}
        >
          {isPending
            ? "Waiting for wallet confirmation..."
            : isConfirming
            ? "Confirming on-chain..."
            : "Send"}
        </button>
      </div>

      {isSuccess && (
        <p style={{ marginTop: "12px", color: "#4ade80" }}>
          Transaction confirmed successfully!
        </p>
      )}
      {isError && (
        <p style={{ marginTop: "12px", color: "#f87171" }}>
          Transaction failed.
        </p>
      )}
      <footer
  style={{
    marginTop: "60px",
    padding: "20px",
    textAlign: "center",
    opacity: 0.6,
    fontSize: "14px",
    color: "#fff"
  }}
>
  <div>© 2025 Powered by 
    <a 
      href="https://x.com/mustafa29460849" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        textDecoration: "none",
        color: "#4da6ff",
        marginLeft: "6px",
        fontWeight: "bold"
      }}
    >
      Venus
    </a>
  </div>
</footer>

    </div>
  );
}
