"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="nav-left">

        {/* LOGO */}
        <img
          src="/arc-logo.png"
          alt="Arc Logo"
          className="arc-logo"
        />

        {/* TITLE */}
        <div className="nav-title-block">
          <span className="nav-title">Arc Network</span>
          <span className="nav-sub">USDC / EURC</span>
        </div>
      </div>

      {/* RIGHT MENU */}
      <div className="nav-right">
        <Link href="https://faucet.circle.com/" className="nav-item small">Faucet</Link>
        <Link href="https://testnet.arcscan.app/" className="nav-item small">Explorer</Link>
        <Link href="https://discord.gg/buildonarc" className="nav-item small">Discord</Link>

        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </nav>
  );
}
