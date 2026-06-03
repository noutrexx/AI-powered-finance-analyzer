import type {
  AuthResponse,
  DashboardMetrics,
  Recommendation,
  Transaction,
  UploadResult,
  User,
} from "@/types/finance";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "finance_analyzer_token";
const USER_KEY = "finance_analyzer_user";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(typeof body.detail === "string" ? body.detail : "Request failed");
  }

  return response.json() as Promise<T>;
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function storeSession(auth: AuthResponse): void {
  window.localStorage.setItem(TOKEN_KEY, auth.access_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  fullName: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ full_name: fullName, email, password }),
  });
}

export function fetchDashboard(): Promise<DashboardMetrics> {
  return request<DashboardMetrics>("/api/analytics/dashboard");
}

export function fetchInsights(): Promise<Recommendation[]> {
  return request<Recommendation[]>("/api/analytics/insights");
}

export function fetchTransactions(): Promise<Transaction[]> {
  return request<Transaction[]>("/api/transactions?limit=200");
}

export function uploadCsv(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return request<UploadResult>("/api/transactions/upload", {
    method: "POST",
    body: formData,
  });
}
