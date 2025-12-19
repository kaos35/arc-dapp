// @ts-nocheck
import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseAbiItem } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "../../../components/chain";
import { subscriptionAbi } from "../../../components/abi/subscriptionAbi";

const SUB_MANAGER = "0x89AF98F9AD04e44e6Eb5749ee73dE3d5036080E1";

const privateKey = process.env.AI_AGENT_PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: arcTestnet,
  transport: http(),
  account,
});

export async function GET() {
  try {
    console.log("🕒 CRON START", new Date().toISOString());

    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;

    const logs = await publicClient.getLogs({
      address: SUB_MANAGER,
      event: parseAbiItem(
        "event SubscriptionCreated(uint256 indexed subscriptionId, address indexed user, address indexed to, uint256 amount, uint256 intervalSeconds)"
      ),
      fromBlock,
      toBlock: currentBlock,
    });

    console.log("📦 Found subscriptions:", logs.length);

    let processed = 0;

    for (const log of logs) {
      const subId = log.args.subscriptionId;
      if (subId === undefined) continue;

      try {
        // Contract'tan subscription bilgisini oku
        const sub = await publicClient.readContract({
          address: SUB_MANAGER,
          abi: [
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
          ],
          functionName: "subscriptions",
          args: [subId],
        });

        // Sadece aktif ve zamanı gelmiş subscription'ları işle
        if (!sub[6]) {
          console.log(`⏭️  Subscription ${subId} is inactive, skipping`);
          continue;
        }

        const nextPaymentTime = Number(sub[5]);
        const now = Math.floor(Date.now() / 1000);

        if (now < nextPaymentTime) {
          console.log(`⏰ Subscription ${subId} not due yet, skipping`);
          continue;
        }

        console.log(`🔄 Processing subscription ${subId}`);
        
        // TODO: Intent store'dan signature'ı al ve processSubscription'ı çağır
        
        processed++;
      } catch (err) {
        console.error(`❌ Error processing subscription ${subId}:`, err);
      }
    }

    console.log("✅ CRON DONE");
    return NextResponse.json({
      ok: true,
      processed,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("❌ CRON ERROR:", e);
    return NextResponse.json({
      ok: false,
      error: e.message ?? "unknown error",
    });
  }
}
