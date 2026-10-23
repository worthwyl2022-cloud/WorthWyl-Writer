# WorthWyl Writer

**Long-form Novel & Memoir Publishing Pipeline**

A comprehensive media pipeline for long-form novel and autobiography creation, featuring:

- Episodic continuity reflection
- Manuscript proofreading & sequel forging
- Book cover studio
- Amazon KDP publishing hub
- Autobiography / bio studio tools

Built with React, TypeScript, Vite, Firebase, and Gemini.

---

## Status

Active development · Private IP of WorthWyl Media

## Ownership

© 2026 Wyl Mathes · WorthWyl Media. All rights reserved.

This repository and its contents are proprietary. No open-source license is granted. Unauthorized copying, modification, distribution, or commercial use is prohibited.

## Structure (high-level)

```
src/                  React + TypeScript frontend (Novel Studio, Cover Studio, etc.)
server.ts             Express + Gemini server-side integration
WorthWylOSV3/         Android companion / OS research surface (Kotlin)
assets/               Static assets
```

## Environment

Copy `.env.example` → `.env` and supply required keys (never commit real secrets).

```
GEMINI_API_KEY=...
APP_URL=...
```

## Scripts

```bash
npm install
npm run dev      # start development server
npm run build    # production build
npm run lint     # type-check
```

---

*WorthWyl Media — turning ideas into real-world projects.*
