import "dotenv/config";
import fs from "fs";
import path from "path";
import { createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// ---------------------------
// CONFIG
// ---------------------------
const DB_PATH = path.join(process.cwd(), "subscriptions.json");

const SERVICE_PRIVATE_KEY = process.env.SUBSCRIPTION_PRIVATE_KEY;
const RPC_URL = "https://rpc.testnet.arc.network/";

// Minimal ERC20 ABI
const erc20Abi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "success", type: "bool" }]
  }
];

// Token addresses (ARC testnet)
const TOKENS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  VNS: "0x8b0220cBbd658b5f2bAD2CDC24199278dA95f4DF",
  ARC: "0x58D3e325b6a8c31a4F3f5fB90762e067c8baF046"
};

// ARC chain config
const arcChain = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 }
};

// ---------------------------
// ENV CHECK
// ---------------------------
if (!SERVICE_PRIVATE_KEY) {
  console.error("❌ SUBSCRIPTION_PRIVATE_KEY not set in .env");
}

// ---------------------------
// CLIENT
// ---------------------------
const account = SERVICE_PRIVATE_KEY
  ? privateKeyToAccount(SERVICE_PRIVATE_KEY)
  : undefined;

const client = SERVICE_PRIVATE_KEY
  ? createWalletClient({
      account,
      chain: arcChain,
      transport: http(RPC_URL)
    })
  : undefined;

// ---------------------------
// DB HELPERS
// ---------------------------
function loadDb() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("DB read error:", err);
    return [];
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("DB write error:", err);
  }
}

// ---------------------------
// STRING → NUMBER FIX (CRITICAL)
// ---------------------------
function normalize(sub) {
  sub.nextPayment = Number(sub.nextPayment);
  if (isNaN(sub.nextPayment)) {
    console.log("❌ nextPayment is NaN → subscription skipped");
    sub.active = false;
  }
}

// ---------------------------
// PROCESS SUBSCRIPTIONS
// ---------------------------
async function processSubscriptions() {
  try {
    if (!client || !account) return;

    const db = loadDb();
    if (!Array.isArray(db) || db.length === 0) return;

    const now = Date.now();
    let changed = false;

    for (const sub of db) {
      if (!sub.active) continue;
      if (!sub.to || !sub.token || !sub.amount) continue;

      // IMPORTANT: normalize timestamp
      normalize(sub);

      // Not time yet
      if (now < sub.nextPayment) continue;

      const symbol = sub.token;
      const tokenAddress = TOKENS[symbol];

      if (!tokenAddress) {
        console.log("Unknown token:", symbol);
        continue;
      }

      const decimals =
        symbol === "USDC" || symbol === "EURC" ? 6 : 18;

      const amount = parseUnits(sub.amount, decimals);

      console.log(
        `▶ Running subscription: ${sub.user} → ${sub.to} | ${symbol}`
      );

      try {
        const hash = await client.writeContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "transfer",
          args: [sub.to, amount]
        });

        console.log("✅ TX:", hash);

        // NEXT PAYMENT UPDATE
        if (sub.interval === "daily")
          sub.nextPayment += 24 * 60 * 60 * 1000;
        else if (sub.interval === "weekly")
          sub.nextPayment += 7 * 24 * 60 * 60 * 1000;
        else if (sub.interval === "monthly")
          sub.nextPayment += 30 * 24 * 60 * 60 * 1000;
        else sub.nextPayment += 24 * 60 * 60 * 1000; // default

        changed = true;

      } catch (err) {
        console.error("❌ Transfer error:", err);
      }
    }

    if (changed) saveDb(db);
  } catch (err) {
    console.error("Worker loop error:", err);
  }
}

// ---------------------------
// TIMER
// ---------------------------
console.log("🚀 Subscription Worker Running...");
setInterval(processSubscriptions, 10_000);
