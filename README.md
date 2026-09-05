# Writing Guard

[![CI](https://github.com/xmutfyh/dsh-plugin-writing-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/xmutfyh/dsh-plugin-writing-guard/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/dsh-plugin-writing-guard)](https://www.npmjs.com/package/dsh-plugin-writing-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Argument Economy & Control-Plane Separation for AI-assisted Scientific Writing

**Less AI. More Evidence. Better Journal Fit. Safer Documents.**

Writing Guard is a local, deterministic guardrail for AI-assisted scientific writing.
It repositions from "AI detector" toward **Argument Economy & Prose Discipline**:

> Every sentence must earn its place. Critique is not content.
> Prefer CUT over REWRITE. Do not close every semantic loop.

It protects your manuscript across five layers:

| Guard | Protects against | Risk |
|-------|------------------|------|
| **STYLE** | AI writing fingerprints + argument bloat | 机械排比、过度连接词、模板腔、defensive prose |
| **EVIDENCE** | Scientific drift | 数值、单位、引用、结论被改 |
| **JOURNAL** | Journal mismatch | scope/style/convention 不匹配 |
| **DELIVERY** | Context leakage | prompt、notes、workflow metadata 泄漏 |
| **DOCUMENT** | Document corruption | Word 格式、公式、表格、OOXML 被破坏 |

**Local · Deterministic · Zero Network · Zero LLM · 394 Tests**

```
npm install dsh-plugin-writing-guard
```

> Writing Guard does not write your paper for you.
> It makes AI-assisted writing safer to ship.

---

## What's New in v2.0 — Argument Economy

**Critique is not content. Every sentence must earn its place.**

v2.0 repositions Writing Guard from "AI trace detector" to a **prose discipline engine** grounded in editorial principles:

- **Nature Methods**: "every word should do useful work; readers bring intelligence and do not need incessant repetition."
- **ICMJE**: discuss real limitations while avoiding detailed repetition and unsupported conclusions.
- **Tack et al. (2024)**: "How to shorten manuscripts" — every sentence must earn its place.

### New: Manuscript Writing Policy

The `rulesBrief()` function and `SKILL.md` now deliver a structured Manuscript Policy:

| Policy | Core rule |
|--------|-----------|
| **Control context ≠ content** | Reviewer comments, guard findings, and remediation suggestions are not manuscript evidence |
| **Argument economy** | Every sentence must earn its place; prefer CUT over REWRITE |
| **Do not close every semantic loop** | State claims once; stop after evidence and calibrated interpretation |
| **Clarity ≠ exhaustive explanation** | Explicit referents ≠ spelling out every implication |
| **Defensive-purpose test** | Prebuttals, disclaimers, and "therefore this is important" are candidates for removal |
| **Style-only expansion discipline** | Polishing defaults to same length or shorter |
| **Minimal edit protocol** | CUT → PRUNE → RECAST → SPLIT; do not split unless genuinely multiple claims |
| **Scientific invariants** | Never silently alter numbers, units, statistics, citations, negation, or scope |

### New: EditAction remediation semantics

Every finding now carries an `EditAction`:

| Action | Meaning |
|--------|---------|
| **KEEP** | Defensive purpose is justified; preserve as-is |
| **CUT** | Remove the sentence; no replacement needed |
| **TIGHTEN** | Shorten by removing hedging/defense while keeping the claim |
| **REFRAME_TO_FACT** | Convert defensive framing into a direct factual statement |
| **RELOCATE** | Move to Discussion/Limitations where it belongs |
| **QUERY** | Insufficient information to decide; ask the author |

### New: Deterministic candidate cues

Three new rule groups detect semantic patterns that are **candidates**, not banned phrases:

- **Defensive-purpose framing** (en/zh): reviewer prebuttals, disclaimers, reassurance
- **Semantic-closure markers** (en/zh): "In other words", "Taken together", "综上所述"
- **Content-free evaluation** (en/zh): "This is important", "These results are significant"

### Retained from v1.x

- **Scholarship Lock**: numbers, citations, Figure/Table references preserved
- **Epistemic Lock**: causal strength, null findings, scope boundaries preserved
- **Journal Engine**: corpus-aware Journal Fit
- **Delivery Guard**: CAL (Context-to-Artifact Leakage) detection
- **Word Guard**: DOCX safe editing, OOXML validation, fingerprinting, equation audit

---

## Quick Start

```sh
# Install
dsh plugin add dsh-plugin-writing-guard

# Restart
dsh web
```

### Natural Language Usage

Once installed, you can use natural language:

| Say this | Writing Guard does this |
|----------|------------------------|
| "帮我检查论文写作质量" | `writing_word_audit` |
| "把表格改成三线表" | `writing_word_format_tables` |
| "扫描DOCX结构" | `writing_word_scan` |
| "修改第三章的XXX" | `writing_word_edit` |
| "编辑后验证范围" | `writing_word_scope_check` |
| "检查有没有AI味" | `writing_audit` |

---

## Five Guards — Detailed

### STYLE — Argument Economy & AI Writing Detection

v2.0 repositions from "AI detector" toward **argument economy**. Deterministic rules remain local; semantic writing decisions are delegated to the host model through `rulesBrief()` and `SKILL.md`.

Deterministic checks include:

- Revision residue: `revised`, `as requested`, `本轮`, `审稿人要求`
- Defensive-purpose framing: reviewer prebuttals, disclaimers, reassurance
- Semantic-closure markers: `In other words`, `Taken together`, `综上所述`
- Content-free evaluation: `This is important`, `These results are significant`
- Mechanical rhetoric: `不是X而是Y`, `rather than` abuse, triple parallelism
- LLM high-frequency words: `delve` / `tapestry` / `testament` (density-based)
- Chinese patterns and average sentence length anomalies

### EVIDENCE — Scholarship + Epistemic Lock

Protects scientific facts during AI editing:

- Numbers, percentages, p-values, confidence intervals, units
- Citations, Figure/Table numbers, DOI
- Causal strength: `associated with` cannot become `caused`
- Null findings: `no significant difference` cannot disappear
- Scope boundaries and evidence status

### JOURNAL — Target Journal Fit

Calibrates manuscript against target journal conventions:

- Syntax structure (sentence length, paragraph length)
- Voice and person (passive voice, first-person usage)
- Citations (bibliographic, figure/table references)
- Scientific claims (claim density, causal/evidential strength)
- Rhetorical moves (coverage, canonical order)

### DELIVERY — Context Leakage Detection

Stops workflow context from leaking into final artifacts:

- Rejected alternatives
- Revision process residue
- Provenance leakage
- Defensive hedge leakage

### DOCUMENT — Word Document Integrity

Safely edit Word manuscripts without breaking structure:

```
writing_word_scan → writing_word_edit → writing_word_scope_check
```

**13 tools** for complete document integrity:

| Tool | Purpose |
|------|---------|
| `writing_word_scan` | Structural scan |
| `writing_word_edit` | Safe scoped editing |
| `writing_word_audit` | Writing audit for .docx |
| `writing_word_scope_check` | Scope integrity verification |
| `writing_word_format_tables` | Three-line table formatting |
| `writing_word_audit_equations` | OMML equation audit |
| `writing_word_package_validate` | OOXML package validation |
| `writing_word_fingerprint` | Baseline formatting fingerprint |
| `writing_audit` | Text writing audit |
| `writing_rules` | Writing guidelines |
| `writing_style_profile` | Author style profile |
| `writing_journal_profile` | Journal profile |
| `writing_delivery_audit` | Delivery integrity audit |

---

## Installation

```sh
# From npm (recommended)
dsh plugin add dsh-plugin-writing-guard

# From GitHub
dsh plugin add github:xmutfyh/dsh-plugin-writing-guard

# From local source
dsh plugin add ./path/to/dsh-plugin-writing-guard
```

**Prerequisites:**
- Node.js ≥ 18
- Python 3.10+ with `python-docx` (`pip install python-docx`)

---

## Architecture

```
Writing Guard
├── STYLE (Argument Economy + writing_audit)
│   ├── Manuscript Writing Policy (SKILL.md)
│   ├── Deterministic candidate cues
│   ├── Revision residue detection
│   ├── AI style patterns
│   └── Density-based thresholds
├── EVIDENCE (Scholarship/Epistemic Lock)
│   ├── Number/unit preservation
│   ├── Citation integrity
│   └── Claim strength conservation
├── JOURNAL (Journal Profile)
│   ├── Corpus-aware analysis
│   ├── Section-level comparison
│   └── Rhetorical move matching
├── DELIVERY (CAL Detection)
│   ├── Rejected alternative leakage
│   ├── Process residue
│   └── Baseline reality check
└── DOCUMENT (Word Guard)
    ├── Structural scanning
    ├── Safe editing
    ├── Package validation
    ├── Fingerprinting
    └── Equation audit
```

**Design principle:** Baseline manuscript > journal/template > plugin defaults.

Deterministic rules handle STYLE/EVIDENCE/DELIVERY. Semantic writing decisions (argument economy, defensive-purpose test, clarity calibration) are delegated to the host model through `rulesBrief()` and `SKILL.md`.

The LLM/agent decides *what* should change. Deterministic Word code decides *how* to make that change without silently altering unrelated formatting.

---

## Tests

```sh
npm test
```

394 deterministic tests covering:
- STYLE, Argument Economy, Defensive-Purpose Detection
- Scholarship Lock, Epistemic Lock
- Claim alignment, local citation integrity
- Journal Profile, Journal Fit
- DELIVERY (CAL detection)
- Word Guard: OOXML validation, fingerprinting, equation audit

---

## Security & Privacy

- All rules run **locally**: zero network, zero LLM
- Plugin only reads files being edited
- No content collection or upload
- See [SECURITY.md](SECURITY.md)

---

## Why Writing Guard?

| | Writing Guard | Humanizer | AI Detector |
|---|---|---|---|
| Pre-writing rules | ✅ | ❌ | ❌ |
| During-writing checks | ✅ | Usually ❌ | ❌ |
| Auto-monitor manuscript | ✅ | ❌ | ❌ |
| Full rewrite | ❌ | ✅ | ❌ |
| Explainable issues | ✅ | Partial | Partial |
| Local rules (zero LLM) | ✅ | Usually no | Depends |

> Humanizer rewrites after writing. Writing Guard prevents during writing.

---

## Brand

```
                  WRITING GUARD
                       │
       Argument Economy & Control-Plane Separation
                       │
 ┌─────────┬──────────┬─────────┬──────────┬──────────┐
 STYLE   EVIDENCE   JOURNAL   DELIVERY   DOCUMENT
    │
 Every sentence must earn its place.
 Critique is not content.
 Prefer CUT over REWRITE.
```

**Slogan:** Less AI. More Evidence. Better Journal Fit. Clean Delivery.

---

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT
