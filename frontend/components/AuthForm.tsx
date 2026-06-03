"use client";

import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { login, register, storeSession } from "@/lib/api";

type Props = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = isRegister
        ? await register(fullName, email, password)
        : await login(email, password);
      storeSession(auth);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Finance Analyzer</p>
        <h1>{isRegister ? "Create account" : "Welcome back"}</h1>
        <p className="muted">
          {isRegister
            ? "Start with a private workspace for your imported bank transactions."
            : "Sign in to review your finance dashboard."}
        </p>

        <form onSubmit={onSubmit}>
          {isRegister ? (
            <label>
              Full name
              <span style={{ position: "relative" }}>
                <UserRound size={18} style={{ left: 12, position: "absolute", top: 13 }} />
                <input
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  style={{ paddingLeft: 40 }}
                />
              </span>
            </label>
          ) : null}

          <label>
            Email
            <span style={{ position: "relative" }}>
              <Mail size={18} style={{ left: 12, position: "absolute", top: 13 }} />
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </span>
          </label>

          <label>
            Password
            <span style={{ position: "relative" }}>
              <LockKeyhole size={18} style={{ left: 12, position: "absolute", top: 13 }} />
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </span>
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Please wait" : isRegister ? "Register" : "Login"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="muted" style={{ marginTop: 18 }}>
          {isRegister ? "Already have an account?" : "No account yet?"}{" "}
          <Link href={isRegister ? "/login" : "/register"} style={{ color: "var(--accent)" }}>
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </section>
    </main>
  );
}

