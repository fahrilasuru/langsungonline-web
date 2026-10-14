"use client";

import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

type LoginDialogProps = {
  onSuccess: () => void;
};

export default function LoginDialog({
  onSuccess,
}: LoginDialogProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

async function handleSubmit(
  e: FormEvent<HTMLFormElement>,
): Promise<void> {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: input }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.message ?? "Login gagal.");
      return;
    }

    onSuccess();
  } catch {
    setError("Tidak dapat terhubung ke server.");
  } finally {
    setLoading(false);
  }
}

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement>,
  ): void {
    setInput(e.target.value);
    setError("");
  }

  return (
    <div className="login-backdrop">
      <form
        className="login-box"
        onSubmit={handleSubmit}
      >
        <label htmlFor="login-password">
          Password
        </label>

        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="Masukkan password"
          value={input}
          onChange={handleInputChange}
          autoComplete="current-password"
          autoFocus
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-error" : undefined}
        />

        {error && (
          <p
            id="login-error"
            className="login-error"
            role="alert"
          >
            {error}
          </p>
        )}

<button type="submit" disabled={loading}>
  {loading ? "Memeriksa..." : "Masuk"}
</button>
      </form>
    </div>
  );
}