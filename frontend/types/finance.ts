export type User = {
  id: number;
  email: string;
  full_name: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: number;
  date: string;
  description: string;
  amount: string;
  currency: string;
  type: TransactionType;
  category: string;
};

export type CategorySummary = {
  category: string;
  total: string;
  percentage: number;
};

export type MonthlyTrend = {
  month: string;
  income: string;
  expense: string;
  net: string;
};

export type HealthScore = {
  score: number;
  label: string;
  savings_rate: number;
};

export type Recommendation = {
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
};

export type DashboardMetrics = {
  total_income: string;
  total_expense: string;
  net_balance: string;
  category_breakdown: CategorySummary[];
  monthly_trend: MonthlyTrend[];
  top_expenses: Transaction[];
  average_daily_spending: string;
  savings_rate: number;
  health_score: HealthScore;
  recommendations: Recommendation[];
};

export type UploadResult = {
  imported_count: number;
  skipped_count: number;
  errors: string[];
};

