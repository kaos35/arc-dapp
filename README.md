# ArcPay AI

**ArcPay AI** is an AI-assisted recurring payments infrastructure built on **Arc**, leveraging **USDC** for predictable, programmable, and automated payments.

The project combines smart contract–based subscriptions with an off-chain AI Agent that autonomously executes payments using signed intents.

---

## What Problem Does ArcPay AI Solve?

Recurring payments today are:
- rigid,
- opaque,
- and difficult to automate safely.

ArcPay AI introduces:
- **on-chain subscription logic**
- **AI-driven execution**
- **USDC-based stability**

This enables programmable subscriptions that can be triggered without user interaction, while preserving user control and transparency.

---

## Key Features

- 🔁 **On-chain Subscriptions**  
  Subscriptions are created and managed via smart contracts on Arc.

- 🤖 **AI Agent Automation**  
  An AI Agent processes due subscriptions and executes payments using signed intents.

- 💵 **USDC Native Payments**  
  Payments are settled in USDC for predictable value and real-world usability.

- ⏱️ **Cron-based Execution**  
  Subscription processing is handled via scheduled backend jobs (cron).

- 🔍 **Full Transparency**  
  Subscription state and execution are verifiable on-chain.

---

## Architecture Overview

- **Smart Contracts**
  - Subscription creation & cancellation
  - Payment scheduling logic

- **Backend (API + Cron)**
  - Detects due subscriptions
  - Triggers AI Agent execution

- **Frontend (Next.js)**
  - Subscription creation
  - Active subscription management

---

## Open Source

ArcPay AI is **partially open source** by design.

- Core smart contracts and protocol interfaces are open source for auditability.
- The project is built to encourage community feedback and future contributions.
- Certain automation and agent components are evolving and subject to iteration.

---

## Deployment Status

- **Current Network:** Arc Testnet
- **Mainnet:** Planned after validation and feedback
- **Domain:** https://arcpayai.xyz

---

## Vision

ArcPay AI aims to become a composable payment automation layer for:
- SaaS subscriptions
- Creator payments
- DAO recurring payouts
- AI-native financial workflows

Built with Arc and USDC as first-class primitives.

---

## Links

- Live Demo: https://arcpayai.xyz  
- GitHub: https://github.com/kaos35/arc-dapp

<!-- test: no deploy -->
