// Arc Testnet chain config (Viem / Wagmi)
export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  network: "arc-testnet",
  nativeCurrency: {
    name: "USDC (Gas)",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network/"] },
    public: { http: ["https://rpc.testnet.arc.network/"] },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://testnet.arcscan.app/",
    },
  },
  testnet: true,
} as const;
