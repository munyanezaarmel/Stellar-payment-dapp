"use client";

/**
 * components/WalletConnect.tsx
 * Handles connecting and disconnecting the Freighter wallet.
 *
 * WHY "use client"? Wallet interactions need the browser (extensions, window).
 * Next.js runs code on the server by default — "use client" opts into browser mode.
 */

import { useState } from "react";
import { Wallet, LogOut, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { connectWallet, isFreighterInstalled, shortenAddress, getAccountExplorerUrl } from "@/lib/stellar";

interface WalletConnectProps {
  publicKey: string | null;
  onConnect: (key: string) => void;
  onDisconnect: () => void;
  isLoading: boolean;
}

export default function WalletConnect({ publicKey, onConnect, onDisconnect, isLoading }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setIsConnecting(true);
    setError(null);
    const installed = await isFreighterInstalled();
    if (!installed) {
      setError("Freighter not found. Please install it first.");
      setIsConnecting(false);
      return;
    }
    const result = await connectWallet();
    if (result.error) setError(result.error);
    else if (result.publicKey) onConnect(result.publicKey);
    setIsConnecting(false);
  }

  // ── Connected state ──────────────────────────────────────────────────────
  if (publicKey) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
        {/* Address pill */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.375rem 0.75rem", borderRadius:"9999px", background:"var(--surface)", border:"1px solid var(--border)" }}>
          {/* Live green dot */}
          <div style={{ position:"relative", width:"8px", height:"8px", flexShrink:0 }}>
            <span className="ping" style={{ position:"absolute", inset:0, borderRadius:"9999px", background:"#34d399", opacity:0.7 }} />
            <span style={{ position:"relative", display:"block", width:"8px", height:"8px", borderRadius:"9999px", background:"#10b981" }} />
          </div>
          <span className="mono" style={{ fontSize:"0.7rem", color:"#cbd5e1", letterSpacing:"0.04em" }}>
            {shortenAddress(publicKey)}
          </span>
          <a href={getAccountExplorerUrl(publicKey)} target="_blank" rel="noopener noreferrer"
             style={{ color:"var(--blue)", display:"flex" }} title="View on Stellar Explorer">
            <ExternalLink size={11} />
          </a>
        </div>
        {/* Disconnect */}
        <button onClick={onDisconnect} className="btn-ghost"
                style={{ display:"flex", alignItems:"center", gap:"0.375rem", padding:"0.375rem 0.75rem", borderRadius:"0.5rem" }}>
          <LogOut size={13} />
          <span>Disconnect</span>
        </button>
      </div>
    );
  }

  // ── Disconnected state ───────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"0.5rem" }}>
      <button onClick={handleConnect} disabled={isConnecting || isLoading} className="btn-primary"
              style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.625rem 1.25rem", borderRadius:"0.5rem" }}>
        {isConnecting
          ? <><Loader2 size={15} className="animate-spin" /><span>Connecting...</span></>
          : <><Wallet size={15} /><span>Connect Wallet</span></>}
      </button>
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:"0.375rem", fontSize:"0.75rem", color:"#fbbf24" }}>
          <AlertTriangle size={13} />
          <span>{error}</span>
          {error.includes("install") && (
            <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer"
               style={{ textDecoration:"underline" }}>Get Freighter →</a>
          )}
        </div>
      )}
    </div>
  );
}