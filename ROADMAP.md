# Roadmap

Compliance Wiki — from a public change tracker to an org-level compliance monitoring platform.

## Phase 0 — Stabilize the wiki
**Goal:** make the reference site the go-to source for compliance changes.

- [ ] Add control search to the UI (wire up `lib/search.ts`)
- [ ] Framework detail page: versions + effective dates
- [ ] Export API: `/api/controls?framework=soc-2` for programmatic access

**Success signal:** teams use it as the primary reference instead of scattered portals/PDFs.

## Phase 1 — Compliance self-check (MVP)
**Goal:** manual self-assessment per framework — no integrations yet.

- [ ] "Assess" mode per framework: each control gets a status (Not started / In progress / Implemented / N/A) + evidence note/link
- [ ] New DB tables: `assessments`, `evidence`
- [ ] Gap report: "You meet 12/18 PCI controls; here are the missing ones"
- [ ] CSV import/export of assessments

**Success signal:** a user can answer "am I compliant?" in ~10 minutes.

## Phase 2 — Evidence source integrations
**Goal:** auto-update assessment status from real org evidence. Pick ONE integration to start.

- [ ] **ServiceNow/Jira** — pull compliance/risk ticket status
- [ ] **Cloud config** — AWS Config / Azure Policy / GCP SCC for live posture checks
- [ ] **Policy/scan docs** — upload PDFs, AI maps evidence to controls
- [ ] Map evidence -> controls -> auto-update assessment status

**Success signal:** a control flips to "Implemented" when real evidence arrives.

## Phase 3 — Monitoring & alerts
**Goal:** catch your org's controls drifting out of compliance.

- [ ] Scheduled checks against your org's evidence sources
- [ ] Digest emails: "3 controls at risk, 1 new requirement affects you"
- [ ] Alert on newly published requirements that affect your tracked frameworks

**Success signal:** the team gets an alert before an audit finds the gap.

## Phase 4 — Productization
**Goal:** turn it into a product.

- [ ] Team workspaces
- [ ] Audit-ready export (PDF / SOC 2-style report)
- [ ] Flagship story: one integration + one framework (e.g. AWS + SOC 2)
- [ ] Monetization: free for individuals, paid for teams

## Open decisions
- [ ] Self-hosted vs. SaaS for org data (affects Phase 2+3)
- [ ] Which framework is the flagship? (SOC 2 is the most in-demand)
- [ ] Which single integration to demo first?
