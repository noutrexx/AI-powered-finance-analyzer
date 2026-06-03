"use client";

import { CheckCircle2, FileUp, FolderOpen, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { uploadCsv } from "@/lib/api";
import type { UploadResult } from "@/types/finance";

export function UploadClient() {
  const { user, ready } = useAuthGuard();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setResult(null);
    setError("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Select a CSV file first");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setResult(await uploadCsv(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <div className="loading">Loading session</div>;
  }

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Import</p>
          <h1>CSV Upload</h1>
          <p className="muted">Import bank activity with date, description, amount, currency, and type.</p>
        </div>
      </div>

      <form className="upload-zone" onSubmit={onSubmit}>
        <FileUp size={44} color="var(--accent)" />
        <h2>{file ? file.name : "Select transactions CSV"}</h2>
        <label className="file-picker">
          <input
            accept=".csv,text/csv"
            className="sr-only"
            type="file"
            onChange={onFileChange}
          />
          <span className="button secondary">
            <FolderOpen size={18} />
            Choose CSV file
          </span>
          <span className="muted">{file ? file.name : "No file selected"}</span>
        </label>
        <button className="button" type="submit" disabled={loading}>
          <Upload size={18} />
          {loading ? "Importing" : "Upload CSV"}
        </button>
      </form>

      <div style={{ marginTop: 18 }}>
        {error ? <div className="error-box">{error}</div> : null}
        {result ? (
          <div className="success-box">
            <CheckCircle2 size={18} style={{ verticalAlign: "middle" }} /> Imported{" "}
            {result.imported_count} transactions. Skipped {result.skipped_count}.
            {result.errors.length ? (
              <ul>
                {result.errors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
