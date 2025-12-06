"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useSignTypedData,
} from "wagmi";

import type { Address, Hash } from "viem";
import { parseUnits, decodeEventLog } from "viem";

/* ======================================================
   ADDRESSES
   ====================================================== */

// Tokens
const ARC_ADDRESS = "0x58D3e325b6a8c31a4F3f5fB90762e067c8baF046" as Address;
const VNS_ADDRESS = "0x8b0220cBbd658b5f2bAD2CDC24199278dA95f4DF" as Address;
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as Address; // Kontrol edin!
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as Address;

// SubscriptionManager
const SUB_MANAGER = "0x89AF98F9AD04e44e6Eb5749ee73dE3d5036080E1" as Address;

// PaymentRouter V2
const PAYMENT_ROUTER = "0xDdACFF9260c66b2F0258F0B0E2ad992ca95d1e10" as Address;

const ARC_TESTNET_CHAIN_ID = 5042002;

/* ======================================================
   ABIs
   ====================================================== */

// Minimal ERC20 ABI
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

// SubscriptionManager ABI
const subscriptionAbi = [
  {
    name: "createSubscription",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "intervalSeconds", type: "uint256" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "event",
    name: "SubscriptionCreated",
    inputs: [
      { name: "subscriptionId", type: "uint256", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "intervalSeconds", type: "uint256", indexed: false },
    ],
  },
] as const;

// PaymentRouter ABI
const paymentRouterAbi = [
  {
    name: "nonces",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// EIP-712 intent type
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

interface TransactionState {
  isLoading: boolean;
  error: string | null;
  txHash: Hash | null;
}

interface PaymentRules {
  maxPerTx: string;
  dailyLimit: string;
  monthlyLimit: string;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { signTypedDataAsync } = useSignTypedData();

  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt();

  /* ======================================================
     STATES
     ====================================================== */

  // Transfer
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const [token, setToken] = useState<"USDC" | "EURC" | "VNS" | "ARC">("USDC");

  // Subscription
  const [subRecipient, setSubRecipient] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [subInterval, setSubInterval] = useState<"daily" | "weekly" | "monthly">("monthly");

  // Payment Rules
  const [paymentRules, setPaymentRules] = useState<PaymentRules>({
    maxPerTx: "",
    dailyLimit: "",
    monthlyLimit: "",
  });

  // Transaction states
  const [transferState, setTransferState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    txHash: null,
  });

  const [subscriptionState, setSubscriptionState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    txHash: null,
  });

  // Subscription ID storage
  const [savedSubId, setSavedSubId] = useState<string | null>(null);

  /* ======================================================
     HELPERS
     ====================================================== */

  const getTokenAddressAndDecimals = () => {
    const tokenAddress: Address =
      token === "USDC"
        ? USDC_ADDRESS
        : token === "EURC"
        ? EURC_ADDRESS
        : token === "VNS"
        ? VNS_ADDRESS
        : ARC_ADDRESS;

    const decimals = token === "USDC" || token === "EURC" ? 6 : 18;
    return { tokenAddress, decimals };
  };

  const getIntervalSeconds = () => {
    return subInterval === "daily"
      ? 86400
      : subInterval === "weekly"
      ? 604800
      : 2592000;
  };

  const resetTransferState = () => {
    setTransferState({ isLoading: false, error: null, txHash: null });
  };

  const resetSubscriptionState = () => {
    setSubscriptionState({ isLoading: false, error: null, txHash: null });
  };

  /* ======================================================
     1) DIRECT TRANSFER
     ====================================================== */

  const handleSend = async () => {
    if (!isConnected || !address) {
      alert("Please connect wallet first.");
      return;
    }

    if (!to || !amount) {
      alert("Recipient & amount required.");
      return;
    }

    const { tokenAddress, decimals } = getTokenAddressAndDecimals();

    setTransferState({ ...transferState, isLoading: true, error: null });

    try {
      const txHash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to as Address, parseUnits(amount, decimals)],
      });

      setTransferState({
        isLoading: false,
        error: null,
        txHash,
      });

      alert("Transfer successful!");
      setAmount("");
      setTo("");
    } catch (err: any) {
      console.error("SEND ERROR:", err);
      setTransferState({
        isLoading: false,
        error: err.message || "Transfer failed",
        txHash: null,
      });
      alert(`Transfer failed: ${err.message}`);
    }
  };

  /* ======================================================
     2) SAVE SUBSCRIPTION → ON-CHAIN
     ====================================================== */

  const handleSaveSubscription = async () => {
    if (!isConnected || !address) {
      alert("Please connect wallet first.");
      return;
    }

    if (!subRecipient || !subAmount) {
      alert("Please fill subscription recipient & amount.");
      return;
    }

    const { tokenAddress, decimals } = getTokenAddressAndDecimals();
    const intervalSeconds = getIntervalSeconds();

    setSubscriptionState({ ...subscriptionState, isLoading: true, error: null });

    try {
      const txHash = await writeContractAsync({
        address: SUB_MANAGER,
        abi: subscriptionAbi,
        functionName: "createSubscription",
        args: [
          tokenAddress,
          subRecipient as Address,
          parseUnits(subAmount, decimals),
          BigInt(intervalSeconds),
        ],
      });

      console.log("Transaction hash:", txHash);

      // Wait for transaction receipt
      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      if (!receipt) {
        throw new Error("No receipt received");
      }

      console.log("Transaction receipt:", receipt);

      // Find and decode the SubscriptionCreated event
      let subscriptionId: string | null = null;

      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === SUB_MANAGER.toLowerCase()) {
          try {
            const decoded = decodeEventLog({
              abi: subscriptionAbi,
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === "SubscriptionCreated") {
              subscriptionId = decoded.args.subscriptionId.toString();
              break;
            }
          } catch (e) {
            // Log doesn't match our ABI, continue searching
            continue;
          }
        }
      }

      if (!subscriptionId) {
        // Fallback: Try to parse from logs (original method)
        const eventLog = receipt.logs.find(
          (log) => log.address.toLowerCase() === SUB_MANAGER.toLowerCase()
        );

        if (eventLog && eventLog.topics[1]) {
          subscriptionId = BigInt(eventLog.topics[1]).toString();
        }
      }

      if (subscriptionId) {
        setSavedSubId(subscriptionId);
        setSubscriptionState({
          isLoading: false,
          error: null,
          txHash,
        });
        alert(`Subscription created successfully! ID: ${subscriptionId}`);
      } else {
        throw new Error("Could not find subscription ID in transaction logs");
      }
    } catch (err: any) {
      console.error("SUBSCRIPTION ERROR:", err);
      setSubscriptionState({
        isLoading: false,
        error: err.message || "Subscription creation failed",
        txHash: null,
      });
      alert(`Subscription failed: ${err.message}`);
    }
  };

  /* ======================================================
     3) GENERATE SIGNATURE & SEND TO BACKEND - DÜZELTİLMİŞ!
     ====================================================== */

  const handleGenerateSignature = async () => {
    if (!isConnected || !address) {
      alert("Please connect wallet first.");
      return;
    }

    if (!subRecipient || !subAmount) {
      alert("Fill subscription fields first.");
      return;
    }

    if (!savedSubId) {
      alert("Please save subscription first.");
      return;
    }

    const { tokenAddress, decimals } = getTokenAddressAndDecimals();
    const amountBig = parseUnits(subAmount, decimals);
    const intervalSeconds = getIntervalSeconds();

    try {
      // Get nonce from PaymentRouter
      const nonce = (await publicClient?.readContract({
        address: PAYMENT_ROUTER,
        abi: paymentRouterAbi,
        functionName: "nonces",
        args: [address],
      })) as bigint;

      if (nonce === undefined) {
        throw new Error("Could not get nonce");
      }

      // Deadline (30 days from now)
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30);

      // Domain for EIP-712 signature
      const domain = {
        name: "ArcPaymentRouter",
        version: "1",
        chainId: ARC_TESTNET_CHAIN_ID,
        verifyingContract: PAYMENT_ROUTER,
      } as const;

      // Message to sign
      const message = {
        user: address,
        token: tokenAddress,
        to: subRecipient as Address,
        amount: amountBig,
        nonce,
        deadline,
      } as const;

      // Generate signature
      const signature = await signTypedDataAsync({
        domain,
        types: paymentIntentTypes,
        primaryType: "PaymentIntent",
        message,
      });

      // Prepare payload for backend (CRITICAL FIXES APPLIED)
      const payload = {
        subscriptionId: savedSubId,
        payload: {
          router: PAYMENT_ROUTER,
          subscriptionManager: SUB_MANAGER,
          chainId: ARC_TESTNET_CHAIN_ID,
          token: tokenAddress,

          subscription: {
            recipient: subRecipient,
            amount: amountBig.toString(), // Convert to string
            interval: subInterval,
            intervalSeconds,
          },

          paymentRules: {
            maxPerTx: paymentRules.maxPerTx || "0", // Default to "0" if empty
            dailyLimit: paymentRules.dailyLimit || "0",
            monthlyLimit: paymentRules.monthlyLimit || "0",
          },

          intent: {
            user: address,
            token: tokenAddress,
            to: subRecipient,
            amount: amountBig.toString(), // Convert to string
            nonce: nonce.toString(),      // Convert to string
            deadline: deadline.toString(), // Convert to string
          },

          signature, // Signature as separate field
        }
      };

      // DEBUG: Validate payload before sending
      console.log("🔍 DEBUG PAYLOAD VALIDATION:");
      
      // Check for undefined values
      const validatePayload = (obj: any, path: string = ''): string[] => {
        const errors: string[] = [];
        for (const key in obj) {
          const currentPath = path ? `${path}.${key}` : key;
          const value = obj[key];
          
          if (value === undefined) {
            errors.push(`${currentPath} is undefined`);
          } else if (value === null) {
            errors.push(`${currentPath} is null`);
          } else if (typeof value === 'string' && value === 'undefined') {
            errors.push(`${currentPath} is string 'undefined'`);
          } else if (typeof value === 'object' && value !== null) {
            errors.push(...validatePayload(value, currentPath));
          }
        }
        return errors;
      };

      const validationErrors = validatePayload(payload);
      if (validationErrors.length > 0) {
        console.error("❌ Payload validation errors:", validationErrors);
        throw new Error(`Payload validation failed: ${validationErrors.join(', ')}`);
      }

      console.log("✅ Payload validated successfully");
      console.log("Generated intent payload:", JSON.stringify(payload, null, 2));

      // Send to backend
      const response = await fetch("/api/intents/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error(`Backend error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Backend response:", result);

      alert("✅ Your AI-Agent Payment Intent has been saved successfully!");
    } catch (err: any) {
      console.error("SIGNATURE ERROR:", err);
      alert(`❌ Signature generation failed: ${err.message}`);
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
          width: "1100px",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        {/* LEFT: TRANSFER */}
        <div
          className="glass-card"
          style={{
            width: "480px",
            padding: "40px",
            borderRadius: "20px",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Transfer Tokens</h2>

          <label>Recipient</label>
          <input
            className="input"
            placeholder="0x..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={transferState.isLoading}
          />

          <label style={{ marginTop: "16px" }}>Token</label>
          <select
            className="select"
            value={token}
            onChange={(e) =>
              setToken(e.target.value as "USDC" | "EURC" | "VNS" | "ARC")
            }
            disabled={transferState.isLoading}
          >
            <option value="USDC">USDC</option>
            <option value="EURC">EURC</option>
            <option value="VNS">VNS</option>
            <option value="ARC">ARC</option>
          </select>

          <label style={{ marginTop: "16px" }}>Amount</label>
          <input
            className="input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={transferState.isLoading}
          />

          {transferState.error && (
            <div style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
              Error: {transferState.error}
            </div>
          )}

          {transferState.txHash && (
            <div style={{ color: "green", marginTop: "10px", fontSize: "14px" }}>
              Transaction: {transferState.txHash.substring(0, 20)}...
            </div>
          )}

          <button
            className="btn-primary"
            style={{ marginTop: "20px" }}
            onClick={handleSend}
            disabled={!isConnected || !amount || !to || transferState.isLoading}
          >
            {transferState.isLoading ? "Sending..." : "Send"}
          </button>
        </div>

        {/* RIGHT: SUBSCRIPTION */}
        <div
          className="glass-card"
          style={{
            width: "480px",
            padding: "40px",
            borderRadius: "20px",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Subscription Settings</h2>

          <label>Recipient</label>
          <input
            className="input"
            placeholder="0x..."
            value={subRecipient}
            onChange={(e) => setSubRecipient(e.target.value)}
            disabled={subscriptionState.isLoading}
          />

          <label style={{ marginTop: "16px" }}>Amount</label>
          <input
            className="input"
            placeholder="e.g. 10"
            value={subAmount}
            onChange={(e) => setSubAmount(e.target.value)}
            disabled={subscriptionState.isLoading}
          />

          <label style={{ marginTop: "16px" }}>Interval</label>
          <select
            className="select"
            value={subInterval}
            onChange={(e) =>
              setSubInterval(e.target.value as "daily" | "weekly" | "monthly")
            }
            disabled={subscriptionState.isLoading}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          {/* PAYMENT RULES */}
          <h3 style={{ marginTop: "26px", marginBottom: "8px" }}>
            Payment Rules (Limits)
          </h3>

          <label>Max Per Transaction</label>
          <input
            className="input"
            placeholder="e.g. 100"
            value={paymentRules.maxPerTx}
            onChange={(e) =>
              setPaymentRules({ ...paymentRules, maxPerTx: e.target.value })
            }
            disabled={subscriptionState.isLoading}
          />

          <label style={{ marginTop: "16px" }}>Daily Limit</label>
          <input
            className="input"
            placeholder="e.g. 500"
            value={paymentRules.dailyLimit}
            onChange={(e) =>
              setPaymentRules({ ...paymentRules, dailyLimit: e.target.value })
            }
            disabled={subscriptionState.isLoading}
          />

          <label style={{ marginTop: "16px" }}>Monthly Limit</label>
          <input
            className="input"
            placeholder="e.g. 2000"
            value={paymentRules.monthlyLimit}
            onChange={(e) =>
              setPaymentRules({ ...paymentRules, monthlyLimit: e.target.value })
            }
            disabled={subscriptionState.isLoading}
          />

          {subscriptionState.error && (
            <div style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
              Error: {subscriptionState.error}
            </div>
          )}

          {subscriptionState.txHash && (
            <div style={{ color: "green", marginTop: "10px", fontSize: "14px" }}>
              Transaction: {subscriptionState.txHash.substring(0, 20)}...
            </div>
          )}

          {savedSubId && (
            <div style={{ color: "blue", marginTop: "10px", fontSize: "14px" }}>
              Subscription ID: {savedSubId}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ marginTop: "24px", width: "100%" }}
            onClick={handleSaveSubscription}
            disabled={!isConnected || !subRecipient || !subAmount || subscriptionState.isLoading}
          >
            {subscriptionState.isLoading ? "Creating..." : "Save Subscription"}
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
      </div>
    </div>
  );
}
