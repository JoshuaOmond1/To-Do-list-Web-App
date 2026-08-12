"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase";

type Mode = "signin" | "signup" | "reset";

export function AuthPanel({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const supabase = getSupabaseBrowserClient();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name.trim() }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) setMessage("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setMessage("Password reset instructions have been sent to your email.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  function changeMode(next: Mode) { setMode(next); setError(""); setMessage(""); }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" onClick={onClose} aria-label="Close">×</button>
        <span className="brand-mark auth-brand" aria-hidden="true">D</span>
        <p className="eyebrow">YOUR PRIVATE DAYMARK</p>
        <h2 id="auth-title">{mode === "signin" ? "Welcome back." : mode === "signup" ? "Create your account." : "Reset your password."}</h2>
        <p>{mode === "reset" ? "Enter your email and we’ll send recovery instructions." : "Your account keeps your tasks available and private on every device."}</p>
        <form onSubmit={submit}>
          {mode === "signup" && <label>Name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} required /></label>}
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          {mode !== "reset" && <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required /></label>}
          {error && <p className="error" role="alert">{error}</p>}
          {message && <p className="success" role="status">{message}</p>}
          <button className="button button-primary" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset email"}</button>
        </form>
        <div className="auth-links">
          {mode === "signin" ? <><button onClick={() => changeMode("signup")}>Create an account</button><button onClick={() => changeMode("reset")}>Forgot password?</button></> : <button onClick={() => changeMode("signin")}>Back to sign in</button>}
        </div>
      </section>
    </div>
  );
}

export function PasswordUpdatePanel({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const { error } = await getSupabaseBrowserClient().auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message); else onClose();
  }

  return (
    <div className="auth-backdrop">
      <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="password-title">
        <span className="brand-mark auth-brand" aria-hidden="true">D</span>
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h2 id="password-title">Choose a new password.</h2>
        <p>Use at least eight characters and avoid reusing an old password.</p>
        <form onSubmit={submit}>
          <label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
        </form>
      </section>
    </div>
  );
}
