# Behind the Scenes – KI-gestützte Entwicklung / AI-assisted development

## Deutsch: Behind the Scenes – KI-gestützte Entwicklung

### Kurzbeschreibung
Dieses Projekt (BestNote) wurde iterativ in kurzer Zeit aufgebaut, getestet und veröffentlicht. Der Entwicklungsprozess nutzte KI-gestützte Assistenz, Automatisierung und standardisierte Templates, um Geschwindigkeit und Konsistenz zu erhöhen.

### Zeitaufwand & Einsparung

| Bereich                              | Üblicher Aufwand (h) | Tatsächliche Zeit (h) | Ersparnis |
|--------------------------------------|-----------------------:|-----------------------:|----------:|
| DSGVO-konformes API-Backend          | 8–12                  | 2                      | ~80 %     |
| Auth (JWT, Middleware, Dev-Flow)     | 6–8                   | 1.5                    | ~75 %     |
| Fork-Integration + Adapter           | 6–10                  | 1.5                    | ~80 %     |
| Testabdeckung (API, CLI, Adapter)    | 8–12                  | 2                      | ~80 %     |
| Frontend-Basis (Store, Views, PATCH) | 12–14                 | 3.5                    | ~75 %     |
| Notification-UX                      | 2–3                   | 0.5                    | ~75 %     |
| Auth-Guard-Sync                      | 2–3                   | 0.5                    | ~75 %     |
| Import persist + Feedback            | 4–6                   | 1                      | ~80 %     |
| Doku (zweisprachig, vollständig)     | 6–10                  | 1.5                    | ~80 %     |

**Gesamt: ~54–68h üblich → ~11.5–12h real → Ersparnis: ~78–83 %**

> BestNote wurde in unter 12 Stunden auf ein produktionsreifes, DSGVO-konformes, testbares und kollaboratives Niveau gebracht — mit vollständiger API, Auth, Frontend-Basis und zweisprachiger Doku.

### Automatisierte Features
- PR-Vorlagen in Deutsch/Englisch
- GitHub Labeler (`.github/labeler.yml`) zur automatischen Kennzeichnung von PRs
- TypeScript-Diagnostik und schnelle Fixes (shims, gemeinsame Typen)
- Release-Guide und Release Automation (Tagging, GH Release)
- Dev-Dependency-Aufräumung und Version-Pinning

### Ziel
Ein einladendes, gut dokumentiertes und kollaboratives Open-Source-Projekt, das Contributors schnell onboardet und wiederkehrende Aufgaben automatisiert.

---

## English: Behind the Scenes – AI-assisted development

### Summary
This project (BestNote) was iteratively built, tested and published using AI-assisted tooling, automation and standardized templates to speed up development and increase consistency.

### Time & Savings
### Time & Savings

| Area                                 | Typical effort (h)  | Actual time (h)       | Savings   |
|--------------------------------------|---------------------:|-----------------------:|----------:|
| GDPR-compliant API backend           | 8–12                | 2                      | ~80%      |
| Auth (JWT, middleware, dev flow)     | 6–8                 | 1.5                    | ~75%      |
| Fork integration + adapters          | 6–10                | 1.5                    | ~80%      |
| Test coverage (API, CLI, adapters)   | 8–12                | 2                      | ~80%      |
| Frontend baseline (store, views, PATCH)| 12–14             | 3.5                    | ~75%      |
| Notification UX                       | 2–3                 | 0.5                    | ~75%      |
| Auth-guard sync                       | 2–3                 | 0.5                    | ~75%      |
| Import persist + feedback             | 4–6                 | 1                      | ~80%      |
| Docs (bilingual, complete)           | 6–10                | 1.5                    | ~80%      |

**Total: ~54–68h typical → ~11.5–12h actual → Savings: ~78–83%**

> BestNote was brought to a production-ready, GDPR-compliant, testable and collaborative level in under 12 hours — with a complete API, auth, frontend baseline and bilingual docs.

> Note: These are conservative estimates meant to illustrate relative benefits of the workflow and may vary depending on the project and team.

### Automated features
- Bilingual PR templates (German / English)
- GitHub Labeler (`.github/labeler.yml`) to suggest labels for PRs
- TypeScript diagnostics and quick fixes (shims, shared enums)
- Release guide and release automation (tagging, GH Releases)
- Dev-dependency cleanup and version pinning

### Goal
To provide a welcoming, well-documented, and collaborative open-source project that automates repetitive tasks and shortens onboarding for contributors.
