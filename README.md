# 🌟 Stellar Pay — Simple XLM Payment dApp

> **Level 1 White Belt** — Stellar Frontend Developer Challenge

A simple, clean payment dApp built on the **Stellar Testnet** that lets users connect their Freighter wallet, check their XLM balance, and send XLM transactions — all with a beautiful space-themed UI.

---

## 📸 Screenshots

> *(Add screenshots here after running the app)*

| Home
|---|---|
| *<img width="1836" height="919" alt="image" src="https://github.com/user-attachments/assets/bfc41577-6467-481a-9b05-682cf511772d" />
* 

| Send Payment Form | Transaction Success |
|---|---|
| *<img width="1128" height="698" alt="image" src="https://github.com/user-attachments/assets/922ac7e5-1271-4cd4-a8a3-3b77e57311b7" />
* | *<img width="1128" height="698" alt="image" src="https://github.com/user-attachments/assets/2e0feff4-f1ec-45e2-8ea8-f8b16e47a138" />
* |

---

## ✨ Features

- 🔗 **Wallet Connection** — Connect/disconnect Freighter wallet with one click
- 💰 **Balance Display** — Real-time XLM balance fetched from Horizon API
- 💸 **Send XLM** — Send XLM to any Stellar address with memo support
- ✅ **Transaction Feedback** — Success/failure state with transaction hash
- 🔗 **Block Explorer** — Links to Stellar Expert for every transaction
- 🚰 **Friendbot Faucet** — Get free testnet XLM with one click
- 📱 **Responsive** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [@stellar/stellar-sdk](https://github.com/stellar/js-stellar-sdk) | Stellar blockchain interaction |
| [@stellar/freighter-api](https://github.com/stellar/freighter) | Wallet connection |
| [Lucide React](https://lucide.dev/) | Icons |

---

## 🚀 Setup & Running Locally

### Prerequisites

1. **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
2. **Freighter Wallet** browser extension — [Install](https://www.freighter.app/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/stellar-payment-dapp
cd stellar-payment-dapp

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

### Configuration

This app runs entirely on the **Stellar Testnet** — no configuration or API keys required.

### Using the App

1. **Install Freighter** — Get it at [freighter.app](https://www.freighter.app/)
2. **Set Freighter to Testnet** — Open Freighter → Settings → Network → Select "Test Net"
3. **Connect your wallet** — Click "Connect Wallet" button
4. **Get test XLM** — Click "Get 10k XLM" in the balance card to fund via Friendbot
5. **Send XLM** — Enter a destination address, amount, and optional memo

---

## 📂 Project Structure

```
stellar-payment-dapp/
├── app/
│   ├── layout.tsx        # Root layout with fonts and background effects
│   ├── page.tsx          # Main page — orchestrates all components
│   └── globals.css       # Global styles, animations, custom fonts
├── components/
│   ├── WalletConnect.tsx # Connect/disconnect wallet button
│   ├── BalanceCard.tsx   # XLM balance display + Friendbot
│   └── SendPayment.tsx   # Send XLM form + transaction feedback
├── lib/
│   └── stellar.ts        # All Stellar SDK logic (well-commented)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔑 Key Concepts

### Stellar Testnet
The testnet is a sandbox blockchain for testing. XLM here has no real value.
- Horizon API: `https://horizon-testnet.stellar.org`
- Block Explorer: `https://stellar.expert/explorer/testnet`

### Freighter Wallet
A browser extension that manages your Stellar keys. It signs transactions without exposing your private key to the dApp.

### Transaction Flow
1. Build transaction with Stellar SDK
2. Convert to XDR (binary encoding)
3. Send to Freighter for user signature
4. Submit signed transaction to Horizon
5. Receive transaction hash as confirmation

---

## 📋 Submission Checklist

- [x] Wallet connect / disconnect
- [x] Balance fetched and displayed
- [x] Send XLM transaction on testnet
- [x] Transaction hash shown on success
- [x] Error state handling
- [x] Public GitHub repository
- [x] README with setup instructions

---

## 🙏 Resources

- [Stellar Documentation](https://developers.stellar.org/docs)
- [Freighter Documentation](https://docs.freighter.app/)
- [Stellar SDK (JavaScript)](https://github.com/stellar/js-stellar-sdk)
- [Stellar Expert (Testnet Explorer)](https://stellar.expert/explorer/testnet)
- [Stellar Laboratory](https://laboratory.stellar.org/)
