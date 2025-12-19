// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import type { Address } from "viem";

import { subscriptionAbi } from "../abi/subscriptionAbi";

const SUB_MANAGER: Address =
  "0x89AF98F9AD04e44e6Eb5749ee73dE3d5036080E1";

type Subscription = {
  subscriptionId: string;
  payer: string;
  recipient: string;
  token: string;
  amount: string;
  interval: string;
  active: boolean;
};

export default function MySubscriptionsCard() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------
     FETCH SUBSCRIPTIONS
  -------------------------------------------------- */
  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchSubs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/subscriptions/list?user=${address}`
        );

        if (!res.ok) throw new Error("Failed to fetch subscriptions");

        const data = await res.json();
        setSubs(data.subscriptions ?? []);
      } catch (e: any) {
        setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, [address, isConnected]);

  /* --------------------------------------------------
     UI HELPERS
  -------------------------------------------------- */
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* --------------------------------------------------
     ON-CHAIN CANCEL
  -------------------------------------------------- */
  const handleCancelSelected = async () => {
    if (!isConnected || selected.length === 0) return;

    try {
      setLoading(true);

      for (const id of selected) {
        await writeContractAsync({
          address: SUB_MANAGER,
          abi: subscriptionAbi,
          functionName: "cancelSubscription",
          args: [BigInt(id)],
        });
      }

      // optimistic UI update
      setSubs((prev) =>
        prev.map((s) =>
          selected.includes(s.subscriptionId)
            ? { ...s, active: false }
            : s
        )
      );

      setSelected([]);
    } catch (e: any) {
      alert("Cancel failed: " + (e.message ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  const visibleSubs = subs.filter((s) => s.active);

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div
      className="glass-card"
      style={{
        width: "480px",
        padding: "32px",
        borderRadius: "20px",
        maxHeight: "600px",
        overflowY: "auto",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>My Subscriptions</h2>

      {!isConnected && <div>Connect wallet to view subscriptions.</div>}
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && subs.length === 0 && (
        <div>No subscriptions found.</div>
      )}

      {visibleSubs.map((s) => (
        <div
          key={s.subscriptionId}
          style={{
            padding: "14px",
            marginBottom: "12px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.06)",
            opacity: s.active ? 1 : 0.6,
            border: s.active
              ? "1px solid rgba(0,224,255,0.25)"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* TOP ROW */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {s.token} Subscription
            </div>

            <span
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: s.active
                  ? "rgba(0,224,255,0.2)"
                  : "rgba(255,100,100,0.2)",
                color: s.active ? "#00E0FF" : "#ff6b6b",
                fontWeight: 600,
              }}
            >
              {s.active ? "ACTIVE" : "CANCELLED"}
            </span>
          </div>

          {/* ADDRESS */}
          <div style={{ fontSize: "13px", opacity: 0.75 }}>
            to {s.recipient.slice(0, 6)}...{s.recipient.slice(-4)}
          </div>

          {/* META */}
          <div
            style={{
              marginTop: "8px",
              fontSize: "14px",
              fontWeight: 500,
              opacity: 0.9,
            }}
          >
            {s.amount} {s.token} • {s.interval}
          </div>

          {/* SELECT */}
          <div style={{ marginTop: "10px" }}>
            <input
              type="checkbox"
              disabled={loading || !s.active}
              checked={selected.includes(s.subscriptionId)}
              onChange={() => toggleSelect(s.subscriptionId)}
            />{" "}
            <span style={{ fontSize: "13px", opacity: 0.7 }}>
              Select
            </span>
          </div>
        </div>
      ))}

      {/* CANCEL BUTTON */}
      <button
        className="btn-primary"
        style={{ marginTop: "20px", width: "100%" }}
        disabled={selected.length === 0 || loading}
        onClick={handleCancelSelected}
      >
        Cancel Selected
      </button>
    </div>
  );
}
