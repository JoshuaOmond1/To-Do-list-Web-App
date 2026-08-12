import { getChatGPTUser, chatGPTSignInPath } from "./chatgpt-auth";
import { TaskApp } from "./task-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();

  if (!user) {
    return (
      <main className="landing-shell">
        <nav className="landing-nav" aria-label="Main navigation">
          <a className="brand" href="/" aria-label="Daymark home">
            <span className="brand-mark" aria-hidden="true">D</span>
            <span>Daymark</span>
          </a>
          <a className="button button-small button-ghost" href={chatGPTSignInPath("/")}>Sign in</a>
        </nav>

        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A calmer way to get things done</p>
            <h1>Make today<br /><em>feel doable.</em></h1>
            <p className="hero-text">
              Capture what matters, choose your priorities, and move through your day with less noise.
            </p>
            <a className="button button-primary" href={chatGPTSignInPath("/")}>Start your list <span aria-hidden="true">→</span></a>
            <p className="fine-print">Free to use · Your tasks stay private</p>
          </div>

          <div className="hero-card" aria-label="Task list preview">
            <div className="preview-header">
              <div><span className="preview-kicker">TODAY</span><strong>Wednesday, Aug 12</strong></div>
              <span className="sun" aria-hidden="true">✦</span>
            </div>
            <div className="preview-progress"><span /></div>
            <div className="preview-task done"><span className="fake-check">✓</span><span>Plan the week</span></div>
            <div className="preview-task"><span className="fake-check" /><span>Send project update</span><b>High</b></div>
            <div className="preview-task"><span className="fake-check" /><span>Book dentist appointment</span></div>
            <div className="preview-add">＋ Add a task</div>
          </div>
        </section>
        <div className="shape shape-one" /><div className="shape shape-two" />
      </main>
    );
  }

  return <TaskApp user={{ name: user.displayName, email: user.email }} />;
}
