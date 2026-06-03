import { listRecentLinks } from '@/db/queries';
import { ShortenForm } from './ShortenForm';

export const dynamic = 'force-dynamic';

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export default async function Home() {
  const recent = await listRecentLinks();
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  return (
    <main className="shell">
      <header className="masthead reveal d1">
        <span className="kicker">Cutterbar</span>
        <span className="edition">Link Routing Desk · No. 001</span>
      </header>

      <section className="hero reveal d2">
        <h1>
          Long links,
          <br />
          <em>cut short.</em>
        </h1>
        <p>
          Paste any address and Cutterbar mints a short, durable code that
          forwards on click — and quietly keeps the tally.
        </p>
      </section>

      <div className="reveal d3">
        <ShortenForm />
      </div>

      <section className="ledger reveal d4">
        <h2>
          <span>Recent dispatches</span>
          <span>{recent.length} on file</span>
        </h2>

        {recent.length === 0 ? (
          <p className="empty">
            Nothing routed yet. The first short link you make lands here.
          </p>
        ) : (
          <ol>
            {recent.map((link, i) => (
              <li key={link.id}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <span className="body">
                  <a className="code" href={`${base}/${link.shortCode}`}>
                    {link.shortCode}
                  </a>
                  <span className="target" title={link.originalUrl}>
                    → {hostOf(link.originalUrl)}
                  </span>
                </span>
                <span className="clicks">
                  <b>{link.clickCount}</b>
                  <span>clicks</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className="colophon">
        <span>Self-hosted · Next.js + Postgres</span>
        <span>Base62 · 7-char codes</span>
      </footer>
    </main>
  );
}
