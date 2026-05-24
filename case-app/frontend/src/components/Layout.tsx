import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const NAV_ITEMS: [string, string][] = [
  ['/', 'Case Front'],
  ['/corpus', 'The Corpus'],
  ['/scoring', 'Suspect Scoring'],
  ['/hypothesis', "Andrew's Hypothesis"],
  ['/evidence', 'Evidence Explorer'],
  ['/dbt-wizard', 'dbt-wizard'],
];

const DEMOS = [
  { key: 'cobain',     name: 'Cobain Case',         industry: 'Cold case, unstructured data',         url: 'https://fivetran-jasonchletsos.github.io/Cobain-Case-ODI-Demo/',  accent: '#b8a87a' },
  { key: 'banking',    name: 'Pediment Bank',        industry: 'Banking and capital markets',          url: 'https://fivetran-jasonchletsos.github.io/Banking-ODI-Demo/',       accent: '#0c2a4a' },
  { key: 'healthcare', name: 'Epic Clarity',         industry: 'Healthcare, clinical analytics',       url: 'https://fivetran-jasonchletsos.github.io/Healthcare-EPIC-Snowflake-Demo/', accent: '#0d9488' },
  { key: 'finserv',    name: 'Meridian Capital',     industry: 'Buy-side research desk',               url: 'https://fivetran-jasonchletsos.github.io/FinServ-ODI-Demo/',      accent: '#1d4ed8' },
  { key: 'insurance',  name: 'Atlas Risk',           industry: 'Insurance, policies and claims',       url: 'https://fivetran-jasonchletsos.github.io/Insurance-ODI-Demo/',   accent: '#0369a1' },
  { key: 'media',      name: 'Lighthouse Media',     industry: 'Media, audience intelligence',         url: 'https://fivetran-jasonchletsos.github.io/Media-ODI-Demo/',        accent: '#7c3aed' },
  { key: 'retail',     name: 'Storefront Analytics', industry: 'Retail and e-commerce',                url: 'https://fivetran-jasonchletsos.github.io/RetailEcom-ODI-Demo/',   accent: '#ea580c' },
];
const CURRENT_DEMO = 'cobain';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-full flex flex-col bg-[var(--paper)]">
      <div className="institutional-rail" />

      <header
        className="sticky top-0 z-30 border-b text-white"
        style={{
          background: 'rgba(44, 51, 64, 0.97)',
          backdropFilter: 'blur(4px)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0 min-w-0 group">
              <div
                className="h-10 w-10 rounded-sm flex items-center justify-center shrink-0"
                style={{ background: 'var(--amber)' }}
              >
                <CaseMark className="h-6 w-6" style={{ color: 'var(--slate-deep)' }} />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-serif font-semibold text-lg sm:text-xl tracking-tight truncate">
                  The Cobain Case
                </div>
                <div
                  className="mt-0.5 font-mono font-medium uppercase tracking-[0.22em]"
                  style={{ fontSize: '10px', color: 'rgba(184,168,122,0.8)' }}
                >
                  Fivetran ODI · Unstructured Data Model
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 text-sm">
              {NAV_ITEMS.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative px-2 py-2 font-semibold tracking-wide transition-colors text-[11.5px] uppercase font-mono whitespace-nowrap ${
                      isActive ? 'text-[var(--amber)]' : 'text-white/75 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <span
                          className="absolute left-2.5 right-2.5 -bottom-[1px] h-[2px]"
                          style={{ background: 'var(--amber)' }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <DemoSwitcher />
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-sm text-white/80 hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileOpen
                    ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden pb-4 border-t border-white/10 pt-3">
              <nav className="grid grid-cols-2 gap-1 text-sm">
                {NAV_ITEMS.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-sm text-center font-medium border font-mono text-[11px] uppercase ${
                        isActive
                          ? 'text-[var(--slate-deep)] border-[var(--amber)]'
                          : 'border-white/15 text-white/80 hover:bg-white/10'
                      }`
                    }
                    style={({ isActive }) => isActive ? { background: 'var(--amber)' } : {}}
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 page-enter">
        <Outlet />
      </main>

      <footer
        className="border-t text-white/80 mt-16"
        style={{ background: 'var(--slate-deep)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-7 w-7 rounded-sm flex items-center justify-center"
                style={{ background: 'var(--amber)' }}
              >
                <CaseMark className="h-4 w-4" style={{ color: 'var(--slate-deep)' }} />
              </div>
              <div className="font-serif font-semibold text-white">The Cobain Case</div>
            </div>
            <p className="leading-relaxed text-white/60">
              A probability-scoring model applied to a 30-year-old unresolved question.
              Built for Andrew Chletsos. All claims are attributed to published public sources only.
              The official ruling is suicide (Seattle PD, 1994).
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Data pipeline</div>
            <p className="leading-relaxed text-white/70">
              Books, FOIA records, documentary transcripts, podcasts, news archives, and investigator notes
              ingested by Fivetran (Connector SDK) into Apache Iceberg on S3. Cortex extracts entities,
              claims, and attributions. dbt builds the governed gold layer.
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Important notice</div>
            <p className="leading-relaxed text-white/70">
              Model output is illustrative only. Probabilities represent corpus-derived scoring, not
              forensic determination. No fabricated evidence, invented quotes, or made-up documents.
              Sources cited are publicly available.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 text-[11px] text-white/50 flex flex-col sm:flex-row gap-1 sm:items-center sm:justify-between">
            <div>Cobain Case ODI Demo — Fivetran Open Data Infrastructure. For demonstration purposes.</div>
            <div>Official ruling: suicide. Seattle PD Case #94-108620 (1994).</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DemoSwitcher() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = document.getElementById('demo-switcher-wrap');
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div id="demo-switcher-wrap" className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border transition-colors"
        style={{
          background: 'rgba(184,168,122,0.2)',
          color: 'var(--amber)',
          borderColor: 'rgba(184,168,122,0.4)',
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--amber)', animation: 'signal-pulse 1.8s ease-in-out infinite' }}
        />
        Demos
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[280px] rounded-sm border shadow-xl z-40 overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--hairline)' }}
        >
          <div
            className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] border-b"
            style={{ color: 'var(--ink-muted)', borderColor: 'var(--hairline)' }}
          >
            Switch demo
          </div>
          <div className="py-1">
            {DEMOS.map((d) => {
              const current = d.key === CURRENT_DEMO;
              const inner = (
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--ink-strong)' }}>{d.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{d.industry}</div>
                  </div>
                  {current && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                      Current
                    </span>
                  )}
                </div>
              );
              return current ? (
                <div key={d.key} className="opacity-60 cursor-default">{inner}</div>
              ) : (
                <a key={d.key} href={d.url} className="block hover:bg-slate-50 transition-colors" onClick={() => setOpen(false)}>
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CaseMark({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="3" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="21" />
      <line x1="3" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="21" y2="12" />
    </svg>
  );
}

import React from 'react';
