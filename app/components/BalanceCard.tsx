"use client";

/**
 * components/BalanceCard.tsx
 * Shows XLM balance and lets user fund via Friendbot (testnet faucet).
 */

import { useState } from "react";
import { RefreshCw, Zap, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { formatBalance, getAccountExplorerUrl, fundWithFriendbot, fetchBalance } from "@/lib/stellar";

interface BalanceCardProps {
  publicKey: string;
  balance: string;
  onBalanceUpdate: (newBalance: string) => void;
}

export default function BalanceCard({ publicKey, balance, onBalanceUpdate }: BalanceCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [fundMessage, setFundMessage] = useState<string | null>(null);
  const [fundSuccess, setFundSuccess] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    const newBalance = await fetchBalance(publicKey);
    onBalanceUpdate(newBalance);
    setIsRefreshing(false);
  }

  async function handleFriendbot() {
    setIsFunding(true);
    setFundMessage(null);
    const success = await fundWithFriendbot(publicKey);
    setFundSuccess(success);
    if (success) {
      setFundMessage("10,000 XLM added to your account!");
      const newBalance = await fetchBalance(publicKey);
      onBalanceUpdate(newBalance);
    } else {
      setFundMessage("Funding failed — account may already be funded.");
    }
    setIsFunding(false);
    setTimeout(() => setFundMessage(null), 5000);
  }

  const formatted = formatBalance(balance);
  const [whole, decimal] = formatted.split(".");

  return (
    <div className="glow-card" style={{ overflow:"hidden" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.25rem 1.5rem 0.75rem" }}>
        <div>
          <p className="mono" style={{ fontSize:"0.65rem", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em" }}>XLM Balance</p>
          <p style={{ fontSize:"0.7rem", color:"#475569" }}>Stellar Testnet</p>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button onClick={handleRefresh} disabled={isRefreshing} title="Refresh"
                  style={{ padding:"0.4rem", borderRadius:"0.4rem", border:"none", background:"transparent", color:"#64748b", cursor:"pointer", display:"flex" }}>
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} style={{ color: isRefreshing ? "var(--blue)" : undefined }} />
          </button>
          <a href={getAccountExplorerUrl(publicKey)} target="_blank" rel="noopener noreferrer"
             style={{ padding:"0.4rem", borderRadius:"0.4rem", color:"#64748b", display:"flex", alignItems:"center" }} title="View on explorer">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Balance */}
      <div style={{ padding:"0.5rem 1.5rem 1.25rem" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:"0.25rem" }}>
          <span className="mono" style={{ fontSize:"3rem", fontWeight:700, color:"var(--lumen)", lineHeight:1 }}>{whole}</span>
          <span className="mono" style={{ fontSize:"1.5rem", color:"rgba(240,180,41,0.45)", lineHeight:1 }}>.{decimal}</span>
          <span className="mono" style={{ fontSize:"1.1rem", fontWeight:700, color:"rgba(240,180,41,0.6)", marginLeft:"0.25rem" }}>XLM</span>
        </div>
        <p style={{ fontSize:"0.72rem", color:"#475569", marginTop:"0.25rem" }} className="mono">
          ≈ ${(parseFloat(formatted) * 0.11).toFixed(2)} USD <span style={{ color:"#334155" }}>(est.)</span>
        </p>
      </div>

      <div className="divider" />

      {/* Friendbot */}
      <div style={{ padding:"1rem 1.5rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem" }}>
          <div>
            <p style={{ fontSize:"0.75rem", color:"#64748b" }} className="mono">Need testnet XLM?</p>
            <p style={{ fontSize:"0.7rem", color:"#475569" }}>Use the Friendbot faucet</p>
          </div>
          <button onClick={handleFriendbot} disabled={isFunding} className="btn-primary"
                  style={{ display:"flex", alignItems:"center", gap:"0.375rem", padding:"0.5rem 1rem", borderRadius:"0.5rem",
                           background:"linear-gradient(135deg, rgba(240,180,41,0.2), rgba(240,180,41,0.1))",
                           border:"1px solid rgba(240,180,41,0.3)", color:"var(--lumen)", flexShrink:0 }}>
            {isFunding
              ? <><Loader2 size={13} className="animate-spin" /><span>Funding...</span></>
              : <><Zap size={13} /><span>Get 10k XLM</span></>}
          </button>
        </div>
        {fundMessage && (
          <div style={{ marginTop:"0.75rem", display:"flex", alignItems:"center", gap:"0.5rem",
                        padding:"0.625rem 0.75rem", borderRadius:"0.5rem", fontSize:"0.75rem",
                        background: fundSuccess ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                        border: `1px solid ${fundSuccess ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                        color: fundSuccess ? "#34d399" : "#f87171" }}>
            {fundSuccess && <CheckCircle size={13} />}
            <span>{fundMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}