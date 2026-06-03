"use client";

import { Lightbulb, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Recommendations } from "@/components/Recommendations";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchInsights } from "@/lib/api";
import type { Recommendation } from "@/types/finance";

export function InsightsClient() {
  const { user, ready } = useAuthGuard();
  const [items, setItems] = useState<Recommendation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadInsights() {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchInsights());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Insights could not load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready) {
      void loadInsights();
    }
  }, [ready]);

  if (!ready) {
    return <div className="loading">Loading session</div>;
  }

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Guidance</p>
          <h1>Insights</h1>
          <p className="muted">Rule-based recommendations generated from your spending profile.</p>
        </div>
        <button className="button secondary" type="button" onClick={loadInsights}>
          <RefreshCw size={18} />
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <section className="panel">
        <h2>
          <Lightbulb size={20} style={{ verticalAlign: "middle" }} /> Smart recommendations
        </h2>
        <Recommendations items={items} />
      </section>
    </AppShell>
  );
}

