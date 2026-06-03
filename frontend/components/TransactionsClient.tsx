"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { TransactionsTable } from "@/components/TransactionsTable";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchTransactions } from "@/lib/api";
import type { Transaction } from "@/types/finance";

export function TransactionsClient() {
  const { user, ready } = useAuthGuard();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTransactions() {
    setLoading(true);
    setError("");
    try {
      setTransactions(await fetchTransactions());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transactions could not load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready) {
      void loadTransactions();
    }
  }, [ready]);

  if (!ready) {
    return <div className="loading">Loading session</div>;
  }

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Ledger</p>
          <h1>Transactions</h1>
          <p className="muted">Review imported records and automatic categories.</p>
        </div>
        <button className="button secondary" type="button" onClick={loadTransactions}>
          <RefreshCw size={18} />
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}
      <section className="panel">
        {transactions.length ? (
          <TransactionsTable items={transactions} />
        ) : (
          <div className="loading">No transactions yet</div>
        )}
      </section>
    </AppShell>
  );
}

