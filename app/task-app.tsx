"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
};

type Filter = "all" | "active" | "completed";

export function TaskApp({ user }: { user: { name: string; email: string } }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load your tasks.");
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  }), [tasks, filter]);

  const completed = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const firstName = user.name.includes("@") ? "there" : user.name.split(" ")[0];

  async function addTask(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority, dueDate: dueDate || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not add that task.");
      setTasks((current) => [data.task, ...current]);
      setTitle(""); setDueDate(""); setPriority("medium");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that task.");
    } finally { setSaving(false); }
  }

  async function updateTask(id: number, changes: Partial<Pick<Task, "title" | "completed" | "priority" | "dueDate">>) {
    const previous = tasks;
    setTasks((current) => current.map((task) => task.id === id ? { ...task, ...changes } : task));
    setError("");
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update that task.");
      setTasks((current) => current.map((task) => task.id === id ? data.task : task));
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : "Could not update that task.");
    }
  }

  async function removeTask(id: number) {
    const previous = tasks;
    setTasks((current) => current.filter((task) => task.id !== id));
    setError("");
    try {
      const response = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete that task.");
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : "Could not delete that task.");
    }
  }

  function beginEdit(task: Task) { setEditingId(task.id); setEditTitle(task.title); }
  function saveEdit(task: Task) {
    const nextTitle = editTitle.trim();
    setEditingId(null);
    if (nextTitle && nextTitle !== task.title) void updateTask(task.id, { title: nextTitle });
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Daymark home"><span className="brand-mark" aria-hidden="true">D</span><span>Daymark</span></a>
        <div className="account">
          <div><strong>{firstName}</strong><span>{user.email}</span></div>
          <a href="/signout-with-chatgpt?return_to=%2F" className="button button-small button-ghost">Sign out</a>
        </div>
      </header>

      <section className="workspace">
        <div className="welcome-row">
          <div><p className="eyebrow">MY DAY</p><h1>Good day, {firstName}.</h1><p>What would make today feel successful?</p></div>
          <div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}%</span></div>
        </div>

        <form className="task-form" onSubmit={addTask}>
          <label className="sr-only" htmlFor="new-task">New task</label>
          <input id="new-task" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" maxLength={160} required />
          <label><span>Priority</span><select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
          <label><span>Due date</span><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
          <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Adding…" : "Add task"}</button>
        </form>

        <div className="list-toolbar">
          <div className="filters" role="group" aria-label="Filter tasks">
            {(["all", "active", "completed"] as Filter[]).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
          </div>
          <span>{completed} of {tasks.length} complete</span>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        {loading ? <div className="empty-state"><span className="loader" /><p>Gathering your day…</p></div> : visibleTasks.length === 0 ? (
          <div className="empty-state"><span className="empty-sun">✦</span><h2>{tasks.length ? "Nothing in this view" : "A clear day ahead"}</h2><p>{tasks.length ? "Try another filter." : "Add your first task above and make a gentle start."}</p></div>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
                <button className="check-button" onClick={() => void updateTask(task.id, { completed: !task.completed })} aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`}>{task.completed ? "✓" : ""}</button>
                <div className="task-content">
                  {editingId === task.id ? <input className="edit-input" autoFocus value={editTitle} maxLength={160} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => saveEdit(task)} onKeyDown={(e) => { if (e.key === "Enter") saveEdit(task); if (e.key === "Escape") setEditingId(null); }} /> : <button className="task-title" onClick={() => beginEdit(task)}>{task.title}</button>}
                  <div className="task-meta"><span className={`priority ${task.priority}`}>{task.priority}</span>{task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}</div>
                </div>
                <button className="icon-button" onClick={() => beginEdit(task)} aria-label={`Edit ${task.title}`}>Edit</button>
                <button className="icon-button delete" onClick={() => void removeTask(task.id)} aria-label={`Delete ${task.title}`}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer>Small steps still move the day forward.</footer>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
