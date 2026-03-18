"use client";

/**
 * app/page.tsx — Main page, owns all global state.
 *
 * State flows DOWN to children via props.
 * Events flow UP from children via callback functions.
 */

import { useState, useEffect, useCallback } from "react";
import { Star, Github, BookOpen } from "lucide-react";
import WalletConnect from "@/app/components/WalletConnect";
import BalanceCard from "@/app/components/BalanceCard";
import SendPayment from "@/app/components/SendPayment";
import { fetchBalance } from "@/lib/stellar";

export default function HomePage() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.0000000");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch balance whenever wallet connects
  useEffect(() => {
    if (publicKey) loadBalance(publicKey);
  }, [publicKey]);

  async function loadBalance(key: string) {
    setIsLoadingBalance(true);
    const bal = await fetchBalance(key);
    setBalance(bal);
    setIsLoadingBalance(false);
  }

  const handleConnect = useCallback((key: string) => setPublicKey(key), []);
  const handleDisconnect = useCallback(() => { setPublicKey(null); setBalance("0.0000000"); }, []);
  const handleBalanceUpdate = useCallback((b: string) => setBalance(b), []);
  const handleTransactionComplete = useCallback(() => { if (publicKey) loadBalance(publicKey); }, [publicKey]);

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>

      {/* ── NAVBAR ── */}
      <header style={{ borderBottom:"1px solid var(--border)", backdropFilter:"blur(12px)", background:"rgba(5,10,15,0.7)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"1rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
            <Star size={20} fill="var(--lumen)" style={{ color:"var(--lumen)" }} />
            <span className="mono" style={{ color:"white", fontWeight:700, fontSize:"1.05rem", letterSpacing:"-0.01em" }}>
              STELLAR<span style={{ color:"var(--blue)" }}>PAY</span>
            </span>
            <span className="mono" style={{ padding:"0.2rem 0.5rem", borderRadius:"9999px", background:"rgba(240,180,41,0.1)", border:"1px solid rgba(240,180,41,0.25)", color:"var(--lumen)", fontSize:"0.6rem", letterSpacing:"0.08em" }}>
              TESTNET
            </span>
          </div>
          <WalletConnect publicKey={publicKey} onConnect={handleConnect} onDisconnect={handleDisconnect} isLoading={isLoadingBalance} />
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ flex:1, maxWidth:"960px", margin:"0 auto", width:"100%", padding:"3rem 1.5rem" }}>

        {/* Not connected */}
        {!publicKey && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
            {/* Icon */}
            <div style={{ marginBottom:"2rem", position:"relative", display:"inline-block" }}>
              <div style={{ width:"5.5rem", height:"5.5rem", borderRadius:"1.25rem", background:"var(--surface)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 40px rgba(0,152,218,0.15)" }}>
                <Star size={38} fill="var(--blue)" style={{ color:"var(--blue)" }} />
              </div>
            </div>

            <h1 className="mono" style={{ fontSize:"clamp(2rem, 5vw, 3.25rem)", fontWeight:700, color:"white", marginBottom:"1rem", lineHeight:1.1 }}>
              Send XLM<br /><span style={{ color:"var(--blue)" }}>Instantly</span>
            </h1>

            <p style={{ color:"#94a3b8", maxWidth:"420px", marginBottom:"2rem", lineHeight:1.7, fontSize:"0.95rem" }}>
              A simple payment dApp on the Stellar testnet. Connect your Freighter wallet to send XLM, check your balance, and explore the blockchain.
            </p>

            {/* Feature pills */}
            <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"0.625rem", marginBottom:"2.5rem" }}>
              {["⚡ Instant Transactions", "🔐 Non-Custodial", "🌐 Stellar Testnet", "🆓 Free XLM via Faucet"].map(f => (
                <span key={f} className="mono" style={{ padding:"0.375rem 0.75rem", borderRadius:"9999px", background:"var(--surface)", border:"1px solid var(--border)", fontSize:"0.72rem", color:"#94a3b8" }}>{f}</span>
              ))}
            </div>

            {/* Install prompt */}
            <div style={{ padding:"1.25rem", borderRadius:"0.875rem", background:"var(--surface)", border:"1px solid var(--border)", maxWidth:"360px", width:"100%" }}>
              <p style={{ fontSize:"0.85rem", color:"#94a3b8", marginBottom:"0.875rem" }}>
                <span style={{ color:"white", fontWeight:600 }}>Don&apos;t have Freighter?</span>{" "}
                It&apos;s the official Stellar wallet browser extension.
              </p>
              <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer"
                 style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", width:"100%", padding:"0.625rem", borderRadius:"0.5rem", background:"rgba(0,152,218,0.1)", border:"1px solid rgba(0,152,218,0.2)", color:"var(--blue)", fontSize:"0.8rem", textDecoration:"none" }} className="mono">
                <BookOpen size={14} /><span>Install Freighter Wallet</span>
              </a>
            </div>
          </div>
        )}

        {/* Connected */}
        {publicKey && (
          <div style={{ display:"flex", flexDirection:"column", gap:"2rem" }}>
            {/* Title */}
            <div>
              <h1 className="mono" style={{ fontSize:"1.4rem", fontWeight:700, color:"white", marginBottom:"0.25rem" }}>Your Wallet</h1>
              <p className="mono" style={{ fontSize:"0.65rem", color:"#475569", wordBreak:"break-all", letterSpacing:"0.03em" }}>{publicKey}</p>
            </div>

            {/* Two column layout */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"1.5rem", alignItems:"start" }}>
              {/* Left: Balance + info */}
              <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
                {isLoadingBalance ? <BalanceSkeleton /> : (
                  <BalanceCard publicKey={publicKey} balance={balance} onBalanceUpdate={handleBalanceUpdate} />
                )}
                {/* Info card */}
                <div className="glow-card" style={{ padding:"1.25rem 1.5rem" }}>
                  <p className="mono" style={{ fontSize:"0.65rem", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.875rem" }}>Network Info</p>
                  {[["Network","Stellar Testnet"],["Asset","XLM (Lumens)"],["Base Fee","100 stroops"],["Tx Speed","~5 seconds"]].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.5rem" }}>
                      <span className="mono" style={{ fontSize:"0.72rem", color:"#475569" }}>{k}</span>
                      <span className="mono" style={{ fontSize:"0.72rem", color:"#94a3b8" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Send payment */}
              <SendPayment senderPublicKey={publicKey} onTransactionComplete={handleTransactionComplete} />
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid rgba(26,48,80,0.4)", padding:"1.5rem" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <p className="mono" style={{ fontSize:"0.65rem", color:"#334155" }}>Built on Stellar Testnet • Level 1 White Belt</p>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
             style={{ display:"flex", alignItems:"center", gap:"0.375rem", fontSize:"0.65rem", color:"#475569", textDecoration:"none" }} className="mono">
            <Github size={13} /><span>GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="glow-card" style={{ padding:"1.5rem" }}>
      <div className="shimmer" style={{ height:"1rem", width:"6rem", borderRadius:"0.375rem", marginBottom:"1rem" }} />
      <div className="shimmer" style={{ height:"3rem", width:"12rem", borderRadius:"0.375rem", marginBottom:"0.5rem" }} />
      <div className="shimmer" style={{ height:"0.75rem", width:"8rem", borderRadius:"0.375rem", marginBottom:"1.5rem" }} />
      <div style={{ height:"1px", background:"var(--border)", margin:"0 0 1rem" }} />
      <div className="shimmer" style={{ height:"2.25rem", width:"100%", borderRadius:"0.5rem" }} />
    </div>
  );
}