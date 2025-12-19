"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function NavBar({
  onFaucetClick = () => {},
}) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/arc-logo.png" alt="Arc Logo" className="arc-logo" />
        <div className="nav-title-block">
          <span className="nav-title">Arc Network</span>
          <span className="nav-sub">USDC / EURC</span>
        </div>
      </div>

      <div className="nav-right">
        <a href="https://faucet.circle.com/" target="_blank" className="nav-item small">
          Faucet
        </a>

        <Link href="https://testnet.arcscan.app/" className="nav-item small">
          Explorer
        </Link>

        <Link href="https://discord.gg/buildonarc" className="nav-item small">
          Discord
        </Link>

        <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
      </div>
    </nav>
  );
}
