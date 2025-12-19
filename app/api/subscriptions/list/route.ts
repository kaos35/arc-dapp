// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";

// Arc Testnet Chain Config
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  network: "arc-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "USDC",
    symbol: "USDC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
    },
    public: {
      http: ["https://rpc.testnet.arc.network"],
    },
  },
};

const SUB_MANAGER = "0x89AF98F9AD04e44e6Eb5749ee73dE3d5036080E1";

const client = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

// Token adresleri - görüntüleme için
const TOKEN_NAMES: Record<string, string> = {
  "0x3600000000000000000000000000000000000000": "USDC",
  "0x89b50855aa3be2f677cd6303cec089b5f319d72a": "EURC",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get("user");

    if (!user) {
      return NextResponse.json(
        { error: "Missing user address" },
        { status: 400 }
      );
    }

    console.log("Fetching subscriptions for user:", user);

    // Mevcut block numarasını al
    const currentBlock = await client.getBlockNumber();
    
    // Son 10,000 bloğu tara (Arc RPC limiti)
    const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;

    console.log(`Scanning from block ${fromBlock} to ${currentBlock}`);

    // Blockchain'den SubscriptionCreated event'lerini oku
    const logs = await client.getLogs({
      address: SUB_MANAGER,
      event: parseAbiItem(
        "event SubscriptionCreated(uint256 indexed subscriptionId, address indexed user, address indexed to, uint256 amount, uint256 intervalSeconds)"
      ),
      args: {
        user: user.toLowerCase() as `0x${string}`,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    console.log(`Found ${logs.length} subscription events`);

    // Her subscription için contract'tan güncel bilgileri oku
    const subscriptions = await Promise.all(
      logs.map(async (log) => {
        const subId = log.args.subscriptionId!;

        // Contract'tan subscription state'ini oku
        const sub = (await client.readContract({
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
          ] as const,
          functionName: "subscriptions",
          args: [subId],
        })) as [
          `0x${string}`,
          `0x${string}`,
          `0x${string}`,
          bigint,
          bigint,
          bigint,
          boolean
        ];

        const tokenAddr = sub[1].toLowerCase();
        const tokenName = TOKEN_NAMES[tokenAddr] || tokenAddr;

        // Interval'i human-readable format'a çevir
        const intervalSeconds = Number(sub[4]);
        let intervalLabel = `${intervalSeconds}s`;
        if (intervalSeconds === 86400) intervalLabel = "daily";
        else if (intervalSeconds === 604800) intervalLabel = "weekly";
        else if (intervalSeconds === 2592000) intervalLabel = "monthly";

        return {
          subscriptionId: subId.toString(),
          payer: sub[0],
          recipient: sub[2],
          token: tokenName,
          amount: (Number(sub[3]) / 1e6).toFixed(2), // USDC/EURC 6 decimals
          interval: intervalLabel,
          active: sub[6],
          nextPayment: new Date(Number(sub[5]) * 1000).toISOString(),
        };
      })
    );

    console.log(`Returning ${subscriptions.length} subscriptions`);

    return NextResponse.json({
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error: any) {
    console.error("Subscriptions list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
