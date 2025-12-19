// @ts-nocheck
"use client";

import { subscriptionAbi } from "./components/abi/subscriptionAbi";
import MySubscriptionsCard from "./components/subscriptions/MySubscriptionsCard";
import type { Address, Hash } from "viem";
import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useSignTypedData,
} from "wagmi";

import { parseUnits, decodeEventLog } from "viem";

/* ======================================================
   ADDRESSES
   ====================================================== */

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as Address;
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as Address;

const SUB_MANAGER = "0x89AF98F9AD04e44e6Eb5749ee73dE3d5036080E1" as Address;
const PAYMENT_ROUTER = "0xDdACFF9260c66b2F0258F0B0E2ad992ca95d1e10" as Address;

const ARC_TESTNET_CHAIN_ID = 5042002;

/* ======================================================
   ABIs
   ====================================================== */

const erc20Abi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;


const paymentRouterAbi = [
  {
    name: "nonces",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const paymentIntentTypes = {
  PaymentIntent: [
    { name: "user", type: "address" },
    { name: "token", type: "address" },
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

/* ======================================================
   COMPONENT
   ====================================================== */

export default function Home() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();
  useWaitForTransactionReceipt();

  /* ======================================================
     STATES
     ====================================================== */

  // Transfer
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const [token, setToken] = useState<"USDC" | "EURC">("USDC");

  // Subscription
  const [subToken, setSubToken] = useState<"USDC" | "EURC">("USDC");
  const [subRecipient, setSubRecipient] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [subInterval, setSubInterval] =
    useState<"daily" | "weekly" | "monthly">("monthly");

  const [paymentRules, setPaymentRules] = useState({
    maxPerTx: "",
    dailyLimit: "",
    monthlyLimit: "",
  });

  const [transferState, setTransferState] = useState({
    isLoading: false,
    error: null as string | null,
    txHash: null as Hash | null,
  });

  const [subscriptionState, setSubscriptionState] = useState({
    isLoading: false,
    error: null as string | null,
    txHash: null as Hash | null,
  });

  const [savedSubId, setSavedSubId] = useState<string | null>(null);

  /* ======================================================
     HELPERS
     ====================================================== */

  const resolveToken = (t: "USDC" | "EURC") => ({
    address: t === "USDC" ? USDC_ADDRESS : EURC_ADDRESS,
    decimals: 6,
  });

  const getIntervalSeconds = () =>
    subInterval === "daily"
      ? 86400
      : subInterval === "weekly"
      ? 604800
      : 2592000;

  /* ======================================================
     SEND TOKENS
     ====================================================== */

  const handleSend = async () => {
    if (!isConnected || !address) return alert("Connect wallet first.");
    if (!to || !amount) return alert("Recipient & amount required.");

    const { address: tokenAddr, decimals } = resolveToken(token);

    try {
      setTransferState({ ...transferState, isLoading: true, error: null });

      const txHash = await writeContractAsync({
        address: tokenAddr,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to as Address, parseUnits(amount, decimals)],
      });

      setTransferState({ isLoading: false, error: null, txHash });
      alert("Transfer successful!");
      setAmount("");
      setTo("");
    } catch (err: any) {
      setTransferState({
        isLoading: false,
        error: err.message,
        txHash: null,
      });
      alert("Transfer failed: " + err.message);
    }
  };

/* ======================================================
   CREATE SUBSCRIPTION
   ====================================================== */

const handleSaveSubscription = async () => {
  if (!isConnected || !address) {
    alert("Connect wallet first.");
    return;
  }

  if (!subRecipient || !subAmount) {
    alert("Fill subscription fields.");
    return;
  }

  const { address: tokenAddr, decimals } = resolveToken(subToken);
  const intervalSeconds = getIntervalSeconds();

  try {
    // loading state
    setSubscriptionState({
      isLoading: true,
      error: null,
      txHash: null,
    });

    const txHash = await writeContractAsync({
      address: SUB_MANAGER,
      abi: subscriptionAbi,
      functionName: "createSubscription",
      args: [
        tokenAddr,
        subRecipient as Address,
        parseUnits(subAmount, decimals),
        BigInt(intervalSeconds),
      ],
    });

    const receipt = await publicClient?.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });

    if (!receipt?.logs?.length) {
      throw new Error("Transaction succeeded but no logs found.");
    }

    let subId: string | null = null;

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: subscriptionAbi,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === "SubscriptionCreated" && decoded.args) {
  subId = (decoded.args as any).subscriptionId.toString();
          break;
        }
      } catch {
        // non-matching log, ignore
      }
    }

    if (!subId) {
      throw new Error("Subscription ID not found");
    }

    // save subscription id
    setSavedSubId(subId);

    // success state
    setSubscriptionState({
      isLoading: false,
      error: null,
      txHash,
    });

    alert("Subscription created! ID = " + subId);
  } catch (err: any) {
    setSubscriptionState({
      isLoading: false,
      error: err?.message ?? "Unknown error",
      txHash: null,
    });

    alert("Failed: " + (err?.message ?? "Unknown error"));
  }
};


  /* ======================================================
     SIGN INTENT FOR AI AGENT
     ====================================================== */

  const handleGenerateSignature = async () => {
    if (!isConnected || !address) return alert("Connect wallet first.");
    if (!savedSubId) return alert("Save subscription first.");

    const { address: tokenAddr, decimals } = resolveToken(subToken);
    const intervalSeconds = getIntervalSeconds();
    const amountBig = parseUnits(subAmount, decimals);

    try {
      const nonce = (await publicClient?.readContract({
        address: PAYMENT_ROUTER,
        abi: paymentRouterAbi,
        functionName: "nonces",
        args: [address],
      })) as bigint;

      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
      );

      const domain = {
        name: "ArcPaymentRouter",
        version: "1",
        chainId: ARC_TESTNET_CHAIN_ID,
        verifyingContract: PAYMENT_ROUTER,
      };

      const message = {
        user: address,
        token: tokenAddr,
        to: subRecipient as Address,
        amount: amountBig,
        nonce,
        deadline,
      };

      const signature = await signTypedDataAsync({
        domain,
        types: paymentIntentTypes,
        primaryType: "PaymentIntent",
        message,
      });

      const payload = {
        subscriptionId: savedSubId,
        payload: {
          router: PAYMENT_ROUTER,
          subscriptionManager: SUB_MANAGER,
          chainId: ARC_TESTNET_CHAIN_ID,
          token: tokenAddr,

          subscription: {
            recipient: subRecipient,
            amount: amountBig.toString(),
            interval: subInterval,
            intervalSeconds,
          },

          paymentRules: {
            maxPerTx: paymentRules.maxPerTx || "0",
            dailyLimit: paymentRules.dailyLimit || "0",
            monthlyLimit: paymentRules.monthlyLimit || "0",
          },

          intent: {
            user: address,
            token: tokenAddr,
            to: subRecipient,
            amount: amountBig.toString(),
            nonce: nonce.toString(),
            deadline: deadline.toString(),
          },

          signature,
        },
      };

      await fetch("/api/intents/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("AI-Agent intent saved!");
    } catch (err: any) {
      alert("Failed: " + err.message);
    }
  };

/* ======================================================
   UI
   ====================================================== */

return (
  <div
    style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      paddingTop: "40px",
    }}
  >
    <div
      style={{
        width: "1500px", // ⬅️ 3 kart sığsın diye artırdık
        display: "flex",
        justifyContent: "center",
        gap: "24px",
      }}
    >
      {/* LEFT — TRANSFER */}
      <div
        className="glass-card"
        style={{ width: "480px", padding: "40px", borderRadius: "20px" }}
      >
        <h2 style={{ marginBottom: "20px" }}>Transfer Tokens</h2>

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
            setToken(e.target.value as "USDC" | "EURC")
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
          onClick={handleSend}
          disabled={!isConnected || !amount || !to}
        >
          Send
        </button>

        {/* SLOGAN */}
        <div
          style={{
            marginTop: "32px",
            textAlign: "center",
            fontSize: "42px",
            fontWeight: 600,
            opacity: 0.85,
            lineHeight: "50px",
          }}
        >
          Instant money real stability{" "}
          <span
            style={{
              background: "linear-gradient(to right, #00E0FF, #B57CFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
            }}
          >
            USDC & EURC
          </span>
        </div>
      </div>

      {/* MIDDLE — SUBSCRIPTION */}
      <div
        className="glass-card"
        style={{ width: "480px", padding: "40px", borderRadius: "20px" }}
      >
        <h2 style={{ marginBottom: "20px" }}>Subscription Settings</h2>

        {/* TOKEN SELECT */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div
            onClick={() => setSubToken("USDC")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              border:
                subToken === "USDC"
                  ? "2px solid #00E0FF"
                  : "2px solid #333",
              background:
                subToken === "USDC"
                  ? "rgba(0, 224, 255, 0.15)"
                  : "rgba(255,255,255,0.06)",
            }}
          >
            USDC
          </div>

          <div
            onClick={() => setSubToken("EURC")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              border:
                subToken === "EURC"
                  ? "2px solid #B57CFF"
                  : "2px solid #333",
              background:
                subToken === "EURC"
                  ? "rgba(181, 124, 255, 0.18)"
                  : "rgba(255,255,255,0.06)",
            }}
          >
            EURC
          </div>
        </div>

        <label>Recipient</label>
        <input
          className="input"
          placeholder="0x..."
          value={subRecipient}
          onChange={(e) => setSubRecipient(e.target.value)}
        />

        <label style={{ marginTop: "16px" }}>Amount</label>
        <input
          className="input"
          placeholder="e.g. 10"
          value={subAmount}
          onChange={(e) => setSubAmount(e.target.value)}
        />

        <label style={{ marginTop: "16px" }}>Interval</label>
        <select
          className="select"
          value={subInterval}
          onChange={(e) =>
            setSubInterval(
              e.target.value as "daily" | "weekly" | "monthly"
            )
          }
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <button
          className="btn-primary"
          style={{ marginTop: "24px", width: "100%" }}
          onClick={handleSaveSubscription}
          disabled={!isConnected || !subRecipient || !subAmount}
        >
          Save Subscription
        </button>

        <button
          className="btn-primary"
          style={{ marginTop: "12px", width: "100%" }}
          onClick={handleGenerateSignature}
          disabled={!isConnected || !savedSubId}
        >
          Run With AI
        </button>
      </div>

      {/* RIGHT — MY SUBSCRIPTIONS */}
      <MySubscriptionsCard />
    </div>
  </div>
);
}
