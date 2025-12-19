import type { Abi } from "viem";

export const subscriptionAbi: Abi = [
  /* =========================
     CREATE SUBSCRIPTION
  ========================= */
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

  /* =========================
     CANCEL SUBSCRIPTION
  ========================= */
  {
    name: "cancelSubscription",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },

  /* =========================
     PROCESS SUBSCRIPTION
  ========================= */
  {
    name: "processSubscription",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [],
  },

  /* =========================
     SUBSCRIPTIONS GETTER
     (‼️ EKSİK OLAN BUYDU ‼️)
  ========================= */
  {
    name: "subscriptions",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interval", type: "uint256" },
      { name: "nextPaymentTime", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },

  /* =========================
     EVENTS
  ========================= */
  {
    type: "event",
    name: "SubscriptionCreated",
    inputs: [
      { name: "subscriptionId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "intervalSeconds", type: "uint256", indexed: false },
    ],
  },
];
