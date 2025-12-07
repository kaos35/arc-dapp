"use client";

import React from "react";

export default function ExplainerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "480px",
          padding: "32px",
          borderRadius: "18px",
          background: "rgba(15,20,40,0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 20px rgba(0,0,0,0.4)",
          color: "#fff",
        }}
      >
        <h2
          style={{
            marginBottom: "12px",
            fontSize: "22px",
            fontWeight: 600,
          }}
        >
          Stablecoin Gas Fees on Arc
        </h2>

        <p style={{ opacity: 0.9, lineHeight: "1.5" }}>
          Arc Network is building a <strong>stablecoin-native gas model</strong> where users will pay
          transaction fees using <strong>USDC</strong> or <strong>EURC</strong>.
          <br />
          <br />
          This feature is already implemented in your UI as a Future Feature. Once Arc’s Paymaster
          API is live, your dApp will support stablecoin-based gas payments natively.
        </p>

        <p style={{ marginTop: "16px", opacity: 0.9 }}>
          Currently this feature is <strong>disabled</strong> on testnet, but your dApp is fully
          ready for activation.
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: "22px",
            padding: "10px 18px",
            width: "100%",
            background: "#4da6ff",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            color: "#000",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
