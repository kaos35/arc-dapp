"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function SubscriptionList({ visible }: { visible: boolean }) {
  const { address } = useAccount();
  const [subs, setSubs] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (!visible) return null;
  if (!address)
    return (
      <div className="glass-card p-6 text-white w-[360px]">
        <p className="text-gray-300">Connect your wallet to view subscriptions.</p>
      </div>
    );

  // Load subscriptions
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/subscriptions/list");
        const data = await res.json();
        setSubs(data.subscriptions || []);
      } catch (e) {
        console.error("Error loading subscriptions:", e);
      }
    };
    load();
  }, [address]);

  if (subs.length === 0)
    return (
      <div className="glass-card p-6 text-white w-[360px]">
        <p className="text-gray-400">No active subscriptions.</p>
      </div>
    );

  return (
    <div className="glass-card p-6 w-[360px] text-white space-y-4">
      <h2 className="text-xl font-semibold mb-2">Your Subscriptions</h2>

      {subs.map((s: any, i) => {
        const tokenIcon =
          s.token === "USDC" ? "💵" :
          s.token === "EURC" ? "💶" :
          s.token === "VNS" ? "🟣" : "🔵";

        return (
          <div
            key={i}
            className="border border-gray-700 rounded-xl p-4 space-y-1"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{tokenIcon}</span>
              <span className="font-bold">{s.token}</span>

              <span
                className={`ml-auto text-xs px-2 py-1 rounded ${
                  s.active ? "bg-green-700" : "bg-red-700"
                }`}
              >
                {s.active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            <div className="text-sm space-y-1">
              <div>
                Amount:{" "}
                <span className="text-blue-300">
                  {s.amount} {s.token}
                </span>
              </div>

              <div>Interval: {s.interval}</div>

              <div>
                Next Payment:{" "}
                <span className="text-blue-400">
                  {new Date(s.nextPayment).toLocaleString("en-US")}
                </span>
              </div>

              <div className="text-xs text-gray-400 break-all">
                Sender: {s.user}
              </div>

              <div className="text-xs text-gray-400 break-all">
                Receiver: {s.to}
              </div>
            </div>

            <button
              onClick={async () => {
                await fetch("/api/subscriptions/cancel", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: i }),
                });
                location.reload();
              }}
              className="mt-3 text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        );
      })}
    </div>
  );
}
