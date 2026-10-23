# WorthWyl Writer

**Long-form Novel & Memoir Publishing Pipeline**  
**Status:** Active development · Proprietary · Production-capable surface  
**Owner:** Wyl Mathes · WorthWyl Media

A comprehensive media pipeline for long-form novel and autobiography creation:

| Capability | Description |
|------------|-------------|
| Novel Studio | Long-form manuscript generation & continuity |
| Reflection Engine | Episodic continuity & coherence tracking |
| Proofreader / Sequel Forge | Manuscript review and sequel scaffolding |
| Cover Studio | Book cover generation workflow |
| KDP Publishing Hub | Amazon KDP packaging & publishing support |
| Autobiography / Bio Studio | Structured life-writing pipeline |

**Stack:** React · TypeScript · Vite · Express · Firebase · Gemini

---

## Ownership & License

© 2026 Wyl Mathes · WorthWyl Media. **All rights reserved.**

This repository and all of its contents are **proprietary**.  
No open-source license (MIT, Apache, GPL, or any other) is granted.  
Unauthorized copying, modification, distribution, reverse-engineering, or commercial use is prohibited.

See [`LICENSE`](./LICENSE) for the full proprietary notice.

---

## Repository Role (Acquisition / Enterprise View)

| Attribute | Value |
|-----------|-------|
| Asset class | Product surface + creative tooling IP |
| Canonical status | Primary product repository for the Writer pipeline |
| Related surfaces | `cranium-cognitive-core` (supporting research, archived), `Android-Convertible-Cranium-OS` (mobile research) |
| Revenue status | Pre-revenue |
| Production readiness | Runnable local / AI-Studio / Cloud Run style deployment; not multi-tenant SaaS hardened |

---

## Structure

```
src/                  React + TypeScript frontend
  components/         NovelStudio, CoverStudio, KDP hub, ReflectionEngine, etc.
  core/               Continuity, LLM client, memory abstractions
  models/             Domain models
server.ts             Express + Gemini server-side integration
WorthWylOSV3/         Android companion research surface (Kotlin)
assets/               Static assets
firebase-*.json       Client Firebase configuration (see Security)
.env.example          Required environment variables (no secrets)
LICENSE               Proprietary All Rights Reserved
```

---

## Environment & Secrets

```bash
cp .env.example .env
# Fill GEMINI_API_KEY and APP_URL — never commit real values
```

- `.env*` is gitignored (except `.env.example`).
- Firebase client config is present for the applet runtime. Treat API keys as restricted by Firebase security rules / domain allow-lists; rotate if this repository becomes public beyond intended scope.

---

## Scripts

```bash
npm install
npm run dev      # development server
npm run build    # production build
npm run lint     # TypeScript check
npm run preview  # preview production build
```

---

## Acquisition / Diligence Notes

- **IP:** Sole rights holder is Wyl Mathes / WorthWyl Media (confirm via git history + this notice).
- **Dependencies:** Standard npm packages (React, Vite, Firebase, Gemini SDK, etc.). License obligations are those of the dependencies only; the application code remains proprietary.
- **Third-party services:** Google Gemini, Firebase (project IDs visible in config files).
- **Secrets hygiene:** No private keys or production credentials intentionally committed. Run secret scanning before any transfer.
- **Support window:** Recommend a defined post-transfer knowledge-transfer period if acquired.

For a full acquisition framing of the broader Convertible Cranium architecture, see the related (archived) `cranium-cognitive-core` repository materials (`ACQUISITION_ONE_PAGER.md`, `HANDOVER.md`, `PROVENANCE.md`).

---

*WorthWyl Media — turning ideas into real-world projects.*
