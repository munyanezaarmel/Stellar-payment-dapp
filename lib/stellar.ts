/**
 * lib/stellar.ts
 *
 * 🌟 STELLAR SDK UTILITIES
 * This file contains ALL the Stellar blockchain logic.
 * Think of it as the "bridge" between your UI and the Stellar network.
 *
 * KEY CONCEPTS FOR BEGINNERS:
 * - Stellar Testnet: A fake blockchain for testing. Free XLM, no real money.
 * - XLM (Lumens): The native currency of Stellar network.
 * - Public Key: Like your bank account number — share it to receive funds.
 * - Freighter: A browser wallet extension (like MetaMask but for Stellar).
 * - Horizon: Stellar's API server that lets us query the blockchain.
 * - Friendbot: A testnet faucet that gives you free test XLM.
 */

import * as StellarSdk from "@stellar/stellar-sdk";

// ─── NETWORK CONFIGURATION ────────────────────────────────────────────────────
// We use TESTNET so you can experiment with fake XLM
// When you're ready for production, change this to:
//   StellarSdk.Networks.PUBLIC and "https://horizon.stellar.org"

export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";

// This creates a connection to the Stellar Horizon API
// Horizon is like an HTTP gateway to the Stellar blockchain
export const server = new StellarSdk.Horizon.Server(HORIZON_URL);

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface WalletInfo {
  publicKey: string;   // The wallet address (G...)
  balance: string;     // XLM balance as a string like "100.0000000"
  isConnected: boolean;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;       // Transaction ID on the blockchain (unique identifier)
  error?: string;      // Error message if something went wrong
}

// ─── FREIGHTER WALLET FUNCTIONS ───────────────────────────────────────────────

/**
 * Checks if the Freighter extension is installed.
 * v2: isConnected() returns { isConnected: boolean }
 */
export async function isFreighterInstalled(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const { isConnected } = await import("@stellar/freighter-api");
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

/**
 * Connects the wallet using the correct v2 Freighter API flow.
 *
 * The flow:
 * 1. isConnected()   — is Freighter installed?
 * 2. setAllowed()    — whitelist this app (shows popup on first visit,
 *                      resolves immediately on subsequent visits)
 * 3. requestAccess() — get the public key (returns accessObj.address in v2)
 */
export async function connectWallet(): Promise<{
  publicKey: string | null;
  error: string | null;
}> {
  try {
    const { isConnected, setAllowed, requestAccess } = await import("@stellar/freighter-api");

    // Step 1 — Is Freighter installed?
    const connResult = await isConnected();
    if (!connResult.isConnected) {
      return {
        publicKey: null,
        error: "Freighter not found. Install it at freighter.app",
      };
    }

    // Step 2 — Allow this app (prompts on first visit, instant on return visits)
    const allowResult = await setAllowed();
    if (!allowResult.isAllowed) {
      return {
        publicKey: null,
        error: "Please allow this app in Freighter and try again.",
      };
    }

    // Step 3 — Request access: returns { address, error }
    // NOTE: v2 uses "address" not "publicKey"
    const accessResult = await requestAccess();
    if (accessResult.error) {
      return { publicKey: null, error: String(accessResult.error) };
    }

    // accessResult.address is the public key (G...)
    return { publicKey: accessResult.address, error: null };

  } catch (err) {
    return {
      publicKey: null,
      error: err instanceof Error ? err.message : "Failed to connect wallet",
    };
  }
}

/**
 * Gets the network details from Freighter.
 */
export async function getWalletNetwork(): Promise<string> {
  try {
    const { getNetworkDetails } = await import("@stellar/freighter-api");
    const result = await getNetworkDetails();
    return result.networkPassphrase || "";
  } catch {
    return "";
  }
}

// ─── BALANCE FUNCTIONS ────────────────────────────────────────────────────────

/**
 * Fetches the XLM balance for a given public key.
 *
 * HOW IT WORKS:
 * 1. We call the Horizon API: GET /accounts/{publicKey}
 * 2. Horizon returns account details including all balances
 * 3. We filter for "native" asset which is XLM
 *
 * @param publicKey - The Stellar address (G...)
 * @returns Balance as string like "100.0000000" or "0" if account doesn't exist
 */
export async function fetchBalance(publicKey: string): Promise<string> {
  try {
    // loadAccount fetches all account details from Horizon
    const account = await server.loadAccount(publicKey);

    // An account can hold many assets (XLM, USDC, etc.)
    // "native" is the type for XLM specifically
    const xlmBalance = account.balances.find(
      (b) => b.asset_type === "native"
    );

    // Return the balance, or "0.0000000" if not found
    return xlmBalance?.balance ?? "0.0000000";
  } catch (err) {
    // If the account doesn't exist on the network yet, balance is 0
    // (Accounts need to be "activated" with a minimum of 1 XLM)
    console.error("Error fetching balance:", err);
    return "0.0000000";
  }
}

// ─── TRANSACTION FUNCTIONS ────────────────────────────────────────────────────

/**
 * Sends XLM from the connected wallet to a destination address.
 *
 * HOW A STELLAR TRANSACTION WORKS (step by step):
 * 1. Load the sender's account info (we need the "sequence number")
 * 2. Build a transaction with: source, destination, amount, memo
 * 3. Convert to XDR format (Stellar's binary encoding)
 * 4. Send to Freighter for the user to SIGN with their private key
 * 5. Submit the signed transaction to Horizon (the Stellar API)
 * 6. Get back a transaction hash as confirmation
 *
 * @param senderPublicKey - The sender's Stellar address
 * @param destinationPublicKey - The recipient's Stellar address
 * @param amount - Amount of XLM to send (e.g., "10")
 * @param memo - Optional note/message for the transaction
 */
export async function sendPayment(
  senderPublicKey: string,
  destinationPublicKey: string,
  amount: string,
  memo: string = ""
): Promise<TransactionResult> {
  try {
    // ── STEP 1: Validate the destination address ──────────────────────────
    // Stellar addresses must start with G and be 56 characters
    if (!isValidStellarAddress(destinationPublicKey)) {
      return { success: false, error: "Invalid destination address" };
    }

    // ── STEP 2: Validate the amount ───────────────────────────────────────
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return { success: false, error: "Amount must be a positive number" };
    }

    // ── STEP 3: Check if destination account exists ───────────────────────
    // On Stellar, you can only send to accounts that exist (have been funded)
    // unless you use "createAccount" instead of "payment" operation
    let destinationExists = true;
    try {
      await server.loadAccount(destinationPublicKey);
    } catch {
      destinationExists = false;
    }

    // ── STEP 4: Load the sender's account to get sequence number ─────────
    // The sequence number ensures transactions are processed in order
    // It's like a transaction counter — increments with each transaction
    const senderAccount = await server.loadAccount(senderPublicKey);

    // ── STEP 5: Build the transaction ─────────────────────────────────────
    const transactionBuilder = new StellarSdk.TransactionBuilder(senderAccount, {
      fee: StellarSdk.BASE_FEE,  // Minimum fee in "stroops" (1 XLM = 10,000,000 stroops)
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Add the payment operation
    if (destinationExists) {
      // Regular payment to existing account
      transactionBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: StellarSdk.Asset.native(), // XLM is the "native" asset
          amount: amount,
        })
      );
    } else {
      // Create account operation — funds a brand new account
      // Minimum balance to activate an account is 1 XLM
      transactionBuilder.addOperation(
        StellarSdk.Operation.createAccount({
          destination: destinationPublicKey,
          startingBalance: amount,
        })
      );
    }

    // Add a memo (optional note) if provided
    if (memo.trim()) {
      transactionBuilder.addMemo(StellarSdk.Memo.text(memo.trim()));
    }

    // Set transaction timeout (30 seconds is standard)
    transactionBuilder.setTimeout(30);

    // Build the transaction object
    const transaction = transactionBuilder.build();

    // ── STEP 6: Convert to XDR and send to Freighter for signing ─────────
    // XDR (External Data Representation) is Stellar's binary encoding format
    // We convert it to a base64 string so Freighter can read it
    const transactionXDR = transaction.toXDR();

    const freighterApi = await import("@stellar/freighter-api");

    // This opens the Freighter popup asking the user to sign
    // v2: signTransaction takes (xdr, opts) and returns { signedTxXdr, error }
    const signResult = await freighterApi.signTransaction(transactionXDR, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    if (signResult.error) {
      return { success: false, error: signResult.error };
    }

    // ── STEP 7: Submit the signed transaction to Horizon ──────────────────
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
      signResult.signedTxXdr,
      NETWORK_PASSPHRASE
    );

    // Submit to the Stellar network!
    const response = await server.submitTransaction(signedTransaction);

    // response.hash is the unique transaction ID on the blockchain
    return {
      success: true,
      hash: response.hash,
    };
  } catch (err) {
    console.error("Transaction error:", err);

    // Handle specific Horizon errors
    if (err && typeof err === "object" && "response" in err) {
      const horizonErr = err as { response?: { data?: { extras?: { result_codes?: { transaction?: string } } } } };
      const resultCode = horizonErr.response?.data?.extras?.result_codes?.transaction;
      if (resultCode) {
        return { success: false, error: `Transaction failed: ${resultCode}` };
      }
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : "Transaction failed",
    };
  }
}

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

/**
 * Validates a Stellar public key format.
 * Stellar addresses start with "G" and are 56 characters long.
 */
export function isValidStellarAddress(address: string): boolean {
  try {
    StellarSdk.Keypair.fromPublicKey(address); // Throws if invalid
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a balance for display.
 * "100.0000000" → "100.00"
 */
export function formatBalance(balance: string): string {
  return parseFloat(balance).toFixed(2);
}

/**
 * Shortens a Stellar address for display.
 * "GABC...XYZ123" → "GABC...Z123"
 */
export function shortenAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Funds a testnet account using Friendbot.
 * Friendbot is a free faucet that gives you 10,000 XLM on testnet.
 * IMPORTANT: This only works on TESTNET, not mainnet!
 */
export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Returns a link to view a transaction on Stellar Expert (block explorer).
 * A block explorer is a website that shows all blockchain transactions.
 */
export function getTransactionExplorerUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

/**
 * Returns a link to view an account on Stellar Expert.
 */
export function getAccountExplorerUrl(publicKey: string): string {
  return `https://stellar.expert/explorer/testnet/account/${publicKey}`;
}