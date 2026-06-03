'use client';

import { useState } from 'react';

export function ShortenForm() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<{ shortUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setCopied(false);
    setLoading(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error?.message ?? 'Something went wrong');
      } else {
        setResult({ shortUrl: body.shortUrl });
        setUrl('');
      }
    } catch {
      setError('Network error — could not reach the server');
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the link is still selectable */
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="row">
        <input
          type="url"
          required
          placeholder="https://example.com/very/long/link…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="URL to shorten"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Cutting…' : 'Shorten'}
        </button>
      </div>

      {error && (
        <p className="feedback error" role="alert">
          <span className="tag">Error</span>
          {error}
        </p>
      )}

      {result && (
        <p className="feedback success">
          <span className="tag">Routed</span>
          <a href={result.shortUrl}>{result.shortUrl}</a>
          <button type="button" className="copy" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </p>
      )}
    </form>
  );
}
