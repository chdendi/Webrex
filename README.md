# Webrex

> **You can't out‑prompt what you can't see.**
>
> A curriculum on mastering the DevTools as your primary sensory organ, and AI as your secondary brain.

Webrex teaches the front-end fundamentals you need to debug, profile, and reason about real web pages — and then teaches you how to bring an AI pair into that loop without losing context (or leaking secrets).

Each lesson follows a four-step shape:

1. **Concept** — the smallest mental model that makes the thing make sense.
2. **Practice** — go do it on a real site (often `react.dev`) or against the local Lab.
3. **Verify** — paste the numbers/snapshots back and the platform checks them.
4. **Ask AI** — a guided prompt with the right context already prepared.

---

## Repository layout

This is a [pnpm](https://pnpm.io) workspace.

```
.
├── apps/
│   ├── web/        # @webrex/web — Astro + React + Tailwind. The lesson site.
│   └── lab/        # @webrex/lab — Cloudflare Worker (Hono). Endpoints lessons
│                   #   poke at: CORS, cache, SSE/WS, CSP, cookies, HAR, …
└── packages/
    └── redact/     # @webrex/redact — detect & scrub sensitive fields before
                    #   they ever reach an AI prompt.
```

| Package        | Stack                              | Dev port |
| -------------- | ---------------------------------- | -------- |
| `@webrex/web`  | Astro 5, React 19, Tailwind 4      | 4321     |
| `@webrex/lab`  | Cloudflare Workers, Hono 4         | 8787     |
| `@webrex/redact` | Plain TypeScript library         | —        |

---

## Getting started

**Requirements:** Node ≥ 20 (`.nvmrc` pins 22), pnpm 10. If you use [proto](https://moonrepo.dev/proto), `.prototools` will set this up for you.

```bash
pnpm install            # install all workspaces
pnpm dev                # run web + lab together (parallel)

# or individually
pnpm dev:web            # Astro on http://localhost:4321
pnpm dev:lab            # Worker  on http://localhost:8787
```

Other scripts:

```bash
pnpm build              # build every workspace package
pnpm typecheck          # tsc/astro check across the workspace
pnpm lint               # lint across the workspace
```

For deployed lesson pages, set `PUBLIC_WEBREX_LAB_ORIGIN` on `@webrex/web` to
the public origin of the deployed `@webrex/lab` Worker. Lesson content stores
demo paths like `/demos/l1-2`; the web app resolves them through that origin so
public users never load demos from their own `localhost`.

---

## What lives where

### `apps/web`
The lesson UI. Lesson definitions live in `src/data/lessons.json`; reusable lesson primitives are in `src/components/steps/` (`ConceptStep`, `PracticeStep`, `VerifyStep`, `AskAiStep`). Routing is the standard Astro `src/pages/lessons/[id].astro` pattern.

### `apps/lab`
A single Cloudflare Worker (`src/index.ts`) exposing intentionally crafted endpoints used by the lessons — e.g. `/api/cors/blocked`, `/api/cache/long.json`, `/api/sse`, `/lessons/l10-csp`. Each endpoint is built to demonstrate one specific browser/network behaviour.

### `packages/redact`
A small dependency-free library that scans free-form text (think: a chunk of HAR you want to paste into ChatGPT) for known-sensitive shapes — emails, tokens, JWTs, internal hostnames — and returns a redacted copy plus a structured summary of what it removed. Used by `apps/web` before any AI hand-off.

---

## Conventions worth knowing

- **`*.local.md` is local-only.** Anything matching that glob (e.g. `webrex-plan.local.md`, `phase-2-handoff.local.md`) is intentionally git-ignored. These are working documents for AI/human collaboration that we keep on disk but never push.
- **AI tooling state is git-ignored.** `.claude/`, `.codex/`, `.cursor/` are excluded — they hold per-machine session state, not project artefacts.
- **No secrets in the repo.** Any string in `apps/lab` that *looks* like a JWT or API key is a teaching artefact (specifically the public `jwt.io` example token). Real secrets belong in `.dev.vars` (also git-ignored) or your Cloudflare project bindings.

---

## License

[MIT](./LICENSE) © 2026 chdendi
