"use client";

/**
 * components/SendPayment.tsx
 * The main form for sending XLM transactions.
 *
 * Transaction flow:
 * idle → loading (user signs in Freighter) → success / error → idle
 */

import { useState, useCallback } from "react";
import { Send, CheckCircle, XCircle, Loader2, Copy, ExternalLink, AlertCircle, ChevronRight } from "lucide-react";
import { sendPayment, isValidStellarAddress, getTransactionExplorerUrl, shortenAddress } from "@/lib/stellar";

type TxState = "idle" | "loading" | "success" | "error";

interface SendPaymentProps {
  senderPublicKey: string;
  onTransactionComplete: () => void;
}

export default function SendPayment({ senderPublicKey, onTransactionComplete }: SendPaymentProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [destError, setDestError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleDestChange(val: string) {
    setDestination(val);
    if (val && !isValidStellarAddress(val)) setDestError("Invalid Stellar address (must start with G, 56 chars)");
    else setDestError(null);
  }

  function handleAmountChange(val: string) {
    setAmount(val);
    const n = parseFloat(val);
    if (val && (isNaN(n) || n <= 0)) setAmountError("Amount must be greater than 0");
    else setAmountError(null);
  }

  const handleSubmit = useCallback(async () => {
    if (!destination || !amount || destError || amountError) return;
    setTxState("loading");
    setTxHash(null);
    setTxError(null);
    const result = await sendPayment(senderPublicKey, destination, amount, memo);
    if (result.success && result.hash) {
      setTxHash(result.hash);
      setTxState("success");
      setDestination(""); setAmount(""); setMemo("");
      onTransactionComplete();
    } else {
      setTxError(result.error || "Transaction failed");
      setTxState("error");
    }
  }, [senderPublicKey, destination, amount, memo, destError, amountError, onTransactionComplete]);

  function copyHash() {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isFormValid = destination.trim() && amount.trim() && !destError && !amountError && txState !== "loading";

  const s = { padding: "1.25rem 1.5rem" }; // section padding shorthand

  return (
    <div className="glow-card" style={{ overflow:"hidden" }}>
      {/* Header */}
      <div style={{ ...s, paddingBottom:"0.75rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
        <div style={{ width:"2rem", height:"2rem", borderRadius:"0.5rem", background:"rgba(0,152,218,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Send size={14} style={{ color:"var(--blue)" }} />
        </div>
        <div>
          <h2 className="mono" style={{ fontSize:"0.7rem", fontWeight:700, color:"white", textTransform:"uppercase", letterSpacing:"0.1em" }}>Send XLM</h2>
          <p style={{ fontSize:"0.7rem", color:"#475569" }}>Stellar Testnet</p>
        </div>
      </div>

      <div className="divider" />

      {/* ── SUCCESS ── */}
      {txState === "success" && txHash && (
        <div style={{ margin:"1.25rem 1.5rem", padding:"1.25rem", borderRadius:"0.75rem", background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.2)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.75rem" }}>
            <CheckCircle size={17} style={{ color:"#34d399", flexShrink:0 }} />
            <span className="mono" style={{ fontSize:"0.8rem", fontWeight:700, color:"#34d399" }}>Transaction Confirmed!</span>
          </div>
          <p className="mono" style={{ fontSize:"0.65rem", color:"#64748b", marginBottom:"0.375rem", textTransform:"uppercase", letterSpacing:"0.08em" }}>Transaction Hash</p>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", background:"var(--dark)", borderRadius:"0.5rem", padding:"0.625rem 0.75rem" }}>
            <code className="mono" style={{ fontSize:"0.65rem", color:"rgba(52,211,153,0.8)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {txHash}
            </code>
            <button onClick={copyHash} style={{ border:"none", background:"transparent", cursor:"pointer", display:"flex", color:"#64748b", flexShrink:0 }}>
              {copied ? <CheckCircle size={13} style={{ color:"#34d399" }} /> : <Copy size={13} />}
            </button>
            <a href={getTransactionExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" style={{ color:"#64748b", display:"flex", flexShrink:0 }}>
              <ExternalLink size={13} />
            </a>
          </div>
          <a href={getTransactionExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer"
             style={{ display:"flex", alignItems:"center", gap:"0.25rem", marginTop:"0.75rem", fontSize:"0.72rem", color:"rgba(0,212,245,0.7)" }} className="mono">
            <span>View on Stellar Expert</span><ChevronRight size={12} />
          </a>
          <button onClick={() => setTxState("idle")}
                  style={{ marginTop:"1rem", width:"100%", padding:"0.5rem", borderRadius:"0.5rem", border:"1px solid var(--border)", background:"transparent", color:"#94a3b8", fontSize:"0.72rem", cursor:"pointer" }} className="mono">
            Send Another Payment
          </button>
        </div>
      )}

      {/* ── ERROR ── */}
      {txState === "error" && txError && (
        <div style={{ margin:"1.25rem 1.5rem", padding:"1rem", borderRadius:"0.75rem", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:"0.5rem" }}>
            <XCircle size={16} style={{ color:"#f87171", flexShrink:0, marginTop:"1px" }} />
            <div>
              <p className="mono" style={{ fontSize:"0.78rem", fontWeight:700, color:"#f87171", marginBottom:"0.25rem" }}>Transaction Failed</p>
              <p style={{ fontSize:"0.72rem", color:"rgba(248,113,113,0.7)" }}>{txError}</p>
            </div>
          </div>
          <button onClick={() => setTxState("idle")}
                  style={{ marginTop:"0.75rem", width:"100%", padding:"0.4rem", borderRadius:"0.5rem", border:"1px solid rgba(239,68,68,0.2)", background:"transparent", color:"#94a3b8", fontSize:"0.72rem", cursor:"pointer" }} className="mono">
            Try Again
          </button>
        </div>
      )}

      {/* ── FORM ── */}
      {(txState === "idle" || txState === "loading") && (
        <div style={{ padding:"1.25rem 1.5rem", display:"flex", flexDirection:"column", gap:"1.25rem" }}>

          {/* Destination */}
          <div>
            <label className="mono" style={{ display:"block", fontSize:"0.65rem", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.5rem" }}>
              Destination Address
            </label>
            <input
              type="text" value={destination}
              onChange={e => handleDestChange(e.target.value)}
              placeholder="G... (56 characters)"
              disabled={txState === "loading"}
              className={`field-input mono${destError ? " error" : ""}`}
            />
            {destError && (
              <div style={{ display:"flex", alignItems:"center", gap:"0.375rem", marginTop:"0.375rem", fontSize:"0.72rem", color:"#f87171" }}>
                <AlertCircle size={12} /><span>{destError}</span>
              </div>
            )}
            {destination && !destError && (
              <p className="mono" style={{ marginTop:"0.375rem", fontSize:"0.7rem", color:"rgba(0,212,245,0.6)" }}>
                ✓ Valid — {shortenAddress(destination, 8)}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="mono" style={{ display:"block", fontSize:"0.65rem", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.5rem" }}>
              Amount <span style={{ color:"var(--lumen)" }}>(XLM)</span>
            </label>
            <div style={{ position:"relative" }}>
              <input
                type="number" value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="0.00" min="0" step="0.01"
                disabled={txState === "loading"}
                className={`field-input${amountError ? " error" : ""}`}
                style={{ paddingRight:"3.5rem" }}
              />
              <span className="mono" style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", fontSize:"0.72rem", fontWeight:700, color:"var(--lumen)", pointerEvents:"none" }}>XLM</span>
            </div>
            {amountError && (
              <div style={{ display:"flex", alignItems:"center", gap:"0.375rem", marginTop:"0.375rem", fontSize:"0.72rem", color:"#f87171" }}>
                <AlertCircle size={12} /><span>{amountError}</span>
              </div>
            )}
          </div>

          {/* Memo */}
          <div>
            <label className="mono" style={{ display:"block", fontSize:"0.65rem", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.5rem" }}>
              Memo <span style={{ color:"#334155" }}>(Optional)</span>
            </label>
            <input
              type="text" value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="Note for this transaction..."
              maxLength={28}
              disabled={txState === "loading"}
              className="field-input"
            />
            <p className="mono" style={{ marginTop:"0.25rem", fontSize:"0.65rem", color:"#475569", textAlign:"right" }}>{memo.length}/28</p>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!isFormValid} className="btn-primary"
                  style={{ width:"100%", padding:"0.875rem", borderRadius:"0.75rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", fontSize:"0.8rem" }}>
            {txState === "loading"
              ? <><Loader2 size={16} className="animate-spin" /><span>Broadcasting Transaction...</span></>
              : <><Send size={16} /><span>Send {amount ? `${amount} XLM` : "XLM"}</span></>}
          </button>

          <p style={{ textAlign:"center", fontSize:"0.7rem", color:"#334155" }}>Testnet only — no real funds involved</p>
        </div>
      )}
    </div>
  );
}