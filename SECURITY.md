# Security Policy

## Supported Versions

This is an active development / pre-SaaS product surface. Security updates are applied on the `main` branch.

## Reporting a Vulnerability

Please report suspected security issues privately to **worthwyl2022@gmail.com**.  
Do not open public issues for vulnerabilities that could expose users or credentials.

Include:

- Description of the issue
- Steps to reproduce
- Affected component (frontend, server, Firebase config, etc.)
- Potential impact

You should receive an acknowledgment within a reasonable time.

## Security Practices (Current)

| Area | Status |
|------|--------|
| Secrets in repo | `.env` files gitignored; only `.env.example` committed |
| API keys | Gemini key expected via environment; Firebase client config present (restricted by platform rules) |
| Dependency scanning | Recommended before production deploy / acquisition |
| Secret scanning | Recommended against working tree and history before any transfer |
| Authentication | Relies on Firebase / hosting platform configuration |

## Pre-Acquisition / Pre-Production Checklist

- [ ] Run secret scanning (history + working tree)
- [ ] Rotate any keys that may have been exposed
- [ ] Review Firebase security rules and domain restrictions
- [ ] Confirm no customer / PII data is stored in the repository
- [ ] Document all external service accounts and ownership

## Disclaimer

This repository is proprietary research / product IP. It is not offered as a multi-tenant production SaaS with formal SLAs. Enterprise integrators and acquirers should perform their own security and compliance review.
