"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthPanel, PasswordUpdatePanel } from "./auth-panel";
import { getSupabaseBrowserClient } from "../lib/supabase";
import { TaskApp } from "./task-app";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      setUser(session?.user ?? null);
      setReady(true);
      if (session?.user) setShowAuth(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return <main className="app-shell"><div className="empty-state full-page"><span className="loader" /><p>Opening Daymark…</p></div></main>;
  }

  if (user) {
    const name = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : user.email ?? "there";
    return <><TaskApp user={{ id: user.id, name, email: user.email ?? "" }} />{recovering && <PasswordUpdatePanel onClose={() => setRecovering(false)} />}</>;
  }

  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="Daymark home"><span className="brand-mark" aria-hidden="true">D</span><span>Daymark</span></a>
        <button className="button button-small button-ghost" onClick={() => setShowAuth(true)}>Sign in</button>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A calmer way to get things done</p>
          <h1>Make today<br /><em>feel doable.</em></h1>
          <p className="hero-text">Capture what matters, choose your priorities, and move through your day with less noise.</p>
          <button className="button button-primary" onClick={() => setShowAuth(true)}>Start your list <span aria-hidden="true">→</span></button>
          <p className="fine-print">Free to use · Your tasks stay private</p>
        </div>
        <div className="hero-card" aria-label="Task list preview">
          <div className="preview-header"><div><span className="preview-kicker">TODAY</span><strong>Your daily focus</strong></div><span className="sun" aria-hidden="true">✦</span></div>
          <div className="preview-progress"><span /></div>
          <div className="preview-task done"><span className="fake-check">✓</span><span>Plan the week</span></div>
          <div className="preview-task"><span className="fake-check" /><span>Send project update</span><b>High</b></div>
          <div className="preview-task"><span className="fake-check" /><span>Book dentist appointment</span></div>
          <div className="preview-add">＋ Add a task</div>
        </div>
      </section>
      <div className="shape shape-one" /><div className="shape shape-two" />
      {showAuth && <AuthPanel onClose={() => setShowAuth(false)} />}
    </main>
  );
}
