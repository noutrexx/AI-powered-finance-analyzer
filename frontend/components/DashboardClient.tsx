"use client";

import { Activity, Banknote, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { Recommendations } from "@/components/Recommendations";
import { formatCurrency, TransactionsTable } from "@/components/TransactionsTable";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchDashboard } from "@/lib/api";
import type { DashboardMetrics } from "@/types/finance";

const COLORS = ["#0f766e", "#2563eb", "#b45309", "#15803d", "#7c3aed", "#dc2626", "#64748b"];

export function DashboardClient() {
  const { user, ready } = useAuthGuard();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) {
      return;
    }
    fetchDashboard()
      .then(setMetrics)
      .catch((err) => setError(err instanceof Error ? err.message : "Dashboard could not load"));
  }, [ready]);

  if (!ready) {
    return <div className="loading">Loading session</div>;
  }

  const trendData =
    metrics?.monthly_trend.map((item) => ({
      ...item,
      income: Number(item.income),
      expense: Number(item.expense),
      net: Number(item.net),
    })) ?? [];
  const categoryData =
    metrics?.category_breakdown.map((item) => ({
      ...item,
      total: Number(item.total),
    })) ?? [];

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Personal finance dashboard</h1>
          <p className="muted">Track income, expenses, spending mix, and budget health.</p>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      {metrics ? (
        <div className="grid">
          <section className="grid stats-grid">
            <MetricCard
              title="Income"
              value={formatCurrency(metrics.total_income)}
              note="Total imported income"
              icon={TrendingUp}
            />
            <MetricCard
              title="Expenses"
              value={formatCurrency(metrics.total_expense)}
              note="Total imported expenses"
              icon={TrendingDown}
            />
            <MetricCard
              title="Net balance"
              value={formatCurrency(metrics.net_balance)}
              note={`${metrics.savings_rate}% savings rate`}
              icon={Wallet}
            />
            <MetricCard
              title="Health score"
              value={`${metrics.health_score.score}/100`}
              note={metrics.health_score.label}
              icon={Activity}
            />
          </section>

          <section className="grid two-column">
            <div className="panel">
              <h2>Monthly trend</h2>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid stroke="#dde4db" strokeDasharray="4 4" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#15803d"
                      strokeWidth={3}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#dc2626"
                      strokeWidth={3}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel">
              <h2>Spending by category</h2>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="category"
                      innerRadius={70}
                      outerRadius={112}
                      paddingAngle={3}
                      isAnimationActive={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid two-column">
            <div className="panel">
              <h2>Top expenses</h2>
              <TransactionsTable items={metrics.top_expenses} />
            </div>

            <div className="panel">
              <h2>Smart recommendations</h2>
              <Recommendations items={metrics.recommendations} />
            </div>
          </section>

          <section className="grid stats-grid">
            <MetricCard
              title="Average daily spending"
              value={formatCurrency(metrics.average_daily_spending)}
              note="Based on expense date range"
              icon={Banknote}
            />
            <MetricCard
              title="Category count"
              value={String(metrics.category_breakdown.length)}
              note="Detected spending groups"
              icon={PiggyBank}
            />
          </section>
        </div>
      ) : (
        <div className="loading">Loading dashboard</div>
      )}
    </AppShell>
  );
}
