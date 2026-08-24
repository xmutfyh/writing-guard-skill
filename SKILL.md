---
name: writing-guard-skill
description: >-
  Academic-writing discipline guard (deterministic, zero-network, zero-dependency Node script):
  audit manuscript prose for AI mechanical phrasing, process residue, and defensive disclaimers,
  and protect research facts during polishing — numbers, citations, claim strength, negation,
  scope must not be silently changed (Scholarship Lock + Epistemic Lock). Also computes author
  style profiles and journal writing profiles, scores section-level Journal Fit, and detects
  context-to-artifact leakage in final deliverables (CAL detection).
  论文写作纪律守卫（本地确定性脚本，零网络零依赖）：审计稿件的 AI 腔、修改过程残留、自黑免责，
  润色时用 Scholarship/Epistemic Lock 守住数字/引用/主张强度/否定/scope，支持作者风格档案与
  期刊写作档案 + Journal Fit，并检测被否决方案和修改过程泄漏到最终交付物（CAL 检测）。
  Use when writing, polishing, refactoring academic papers
  (LaTeX/Markdown, Chinese/English) or preparing a submission to a specific journal.
license: MIT
compatibility: Node.js >= 18 (no third-party dependencies, no network access)
metadata:
  engine-version: 1.7.0
  engine-provenance: compiled from dsh-plugin-writing-guard v1.7.0 (MIT)
---

# 论文写作纪律守卫（writing-guard-skill）

把学术写作/润色任务交给本地确定性引擎执行：**去 AI 腔、清修改残留、清自黑免责，锁死科研事实，交付物清洁**。
引擎 = `engine/rules.mjs`（由 `dsh-plugin-writing-guard` v1.7.0 编译而来，MIT，零网络零 LLM 零依赖）。

## 什么时候用

- 用户要**写、润色、改写**论文段落/章节（LaTeX / Markdown，中英文）；
- 用户要**投稿前自查**、回复信（rebuttal）起草、投稿信（cover letter）起草；
- 用户指定了**目标期刊**，想检查稿件与期刊写作习惯的契合度（Journal Fit）；
- 用户要**检查交付物**（commit message / title / PR / release notes）是否泄漏了被否决方案。

## 工作流程

### 第 1 步：加载写作纪律（动笔前）

```bash
node scripts/audit.mjs rules
```

输出 9 类纪律速查。完整规则集在 `references/writing-discipline.md`（写作时按需读取该文件）。

**优先级阶梯（任何冲突时按此排序）**：
Scientific Invariant > Epistemic Safety > Journal Requirement > Journal Norm > Journal Style。
期刊风格永远不能覆盖科学完整性：原文只支持 "associated with" 时，任何 Journal Profile 都不能推动改成 "caused"。

### 第 2 步：审计文本

```bash
# 文件（自动按扩展名检测文档类型，自动探测同目录 .bib 做引用完整性检查）
node scripts/audit.mjs audit --file paper.tex --verbose

# 指定文档类型（rebuttal/cover letter 中 "revised / as requested" 不报警）
node scripts/audit.mjs audit --file reply.md --profile rebuttal

# 纯文本
node scripts/audit.mjs audit --text "..." --profile manuscript
```

命中性质（findingKind）处置规则：
- `INVARIANT`（🔴 科学不变量被改）——立即处理；
- `VIOLATION`（🔴 明确违规：修改残留/自黑免责）——应当修正；
- `CANDIDATE`（防御性候选）——cue ≠ verdict：可能承担正当 claim 边界，
  处置为 KEEP / TIGHTEN / REFRAME / RELOCATE / CUT / QUERY，不确定就 QUERY，**不要自动删除**；
- `ADVISORY`（纯文体）——可保留并说明理由。

### 第 3 步：润色后回归（Scholarship + Epistemic Lock）

每次**润色/改写之后**，必须带修改前基线复查——这是本技能的核心防线：

```bash
node scripts/audit.mjs audit --file paper_v2.tex --original-file paper_v1.tex --verbose
```

引擎逐实体比对修改前后：数字/百分数/p 值/CI、\cite/\ref/Figure/Table 编号/DOI、
主张强度（因果力 × 证据力双轴）、否定/零结果标记、scope 边界、证据状态词
（reported/observed/measured/simulated…）。语言润色**不得**改变 science——
任何 HIGH/INVARIANT 命中都必须恢复原值或显式向用户说明是有意的科学修改。

### 第 4 步（可选）：作者风格档案

```bash
node scripts/audit.mjs style-profile --dir ~/papers/authored/ --out style.json
node scripts/audit.mjs audit --file paper_v2.tex --style-profile style.json --verbose
```

检测句长分布是否偏离作者历史风格（median 漂移 + std/CV 整齐度对比）。

### 第 5 步（可选）：期刊写作档案 + Journal Fit

```bash
node scripts/audit.mjs journal-profile --dir ~/papers/nature-comm-rep/ \
  --journal "Nature Communications" --article-type research-article --out journal.json
node scripts/audit.mjs audit --file paper_v2.tex --journal-profile journal.json --verbose
```

输出 section-level Journal Fit（每章节契合度百分比 + 主要差异 + 目标分布）。
期刊风格调整**只能**改句法/语态/引用/修辞密度，不能改科学内容。

### 第 6 步（可选）：交付物 CAL 检测

```bash
node scripts/audit.mjs audit --text "Replace Toast with inline validation" \
  --baseline "export default function Form() { ... }" \
  --rejected-terms Toast
```

检测交付物（commit message / title / heading）是否泄漏了被否决方案、修改过程残留
或来源信息。传入 `--baseline` 做基线真实性检查，`--rejected-terms` / `--rejected-claims`
提供被否决上下文。

### 第 7 步：提交前自查

润色/改写完成后按序执行：
1. `audit --original-file <改前版本>` —— INVARIANT/HIGH 清零；
2. `audit --file <终稿> --verbose` —— VIOLATION 清零、CANDIDATE 逐条人工判定；
3. （有期刊档案时）Journal Fit 复查；
4. （交付物发布前）CAL 检查 —— 确认被否决方案未泄漏到 commit message / PR / release notes；
5. 向用户汇报：改了哪些、为什么、锁住了哪些实体。

## CLI 参考

| 子命令 | 关键参数 | 输出 |
|---|---|---|
| `rules` | — | 写作纪律速查（Markdown） |
| `audit` | `--file` / `--text`；`--profile manuscript\|rebuttal\|cover_letter\|review\|notes`；`--original` / `--original-file`；`--style-profile <json>`；`--journal-profile <json>`；`--baseline <text>`；`--rejected-terms <term>`（可重复）；`--rejected-claims <claim>`（可重复）；`--project-term <词>`（可重复）；`--bib <path>`；`--min-severity low\|medium\|high`；`--json`；`--verbose`；`--fail-on-high` | 人类可读报告或 `--json` 原始 JSON |
| `style-profile` | `--file` / `--dir`；`--out <path>` | 风格档案 JSON（句长/段长节奏指纹） |
| `journal-profile` | `--file` / `--dir`；`--journal`；`--article-type`；`--discipline`；`--out <path>` | 期刊档案 JSON（章节句法/引用/epistemic/rhetorical moves 分布） |

- 文档类型自动检测：`.md/.tex/.txt` 正文 → manuscript；`*response*`/`*rebuttal*` → rebuttal 等（`--profile` 显式覆盖）。
- `--json` 输出原始 report（`hits` 数组含 severity / findingKind / confidence / 位置 / 依据；顶层键：`ok` / `profile` / `summary` / `stats` / `hits`）。
- 退出码：默认 0；`--fail-on-high` 时存在 HIGH 问题返回 1（可用于 CI）。

## 边界与限制

- 全部规则是**概率信号**：命中即人工复核；专业术语（robust regression、耦合机理）与正当 limitations 不因报警而删改。
- CANDIDATE 类（"we do not claim…"边界声明、低相似度漂移）可能承担正当 epistemic boundary——不要自动删除。
- 零网络：不访问任何外部服务；脚本仅读取本地文件。
- 确定性规则（正则 + 归一化）无法覆盖所有语义改写（semantic paraphrase），DELIVERY 层的检测范围是可用正则表达的泄漏模式，仍需人工 review。
- 引擎 v1.7.0：与 DSH 插件 `dsh-plugin-writing-guard` 同一规则集；DSH 环境优先用插件工具（`writing_audit` / `writing_delivery_audit` 等）。

## 文件布局

```
writing-guard-skill/
├── SKILL.md                      # 本文件（工作流 + CLI）
├── scripts/audit.mjs             # CLI 入口（Node >= 18，零依赖）
├── engine/rules.mjs              # 编译好的规则引擎（v1.7.0，MIT）
├── references/writing-discipline.md  # 完整静态规则集（写作时按需读）
└── tests/                        # 样例与自检脚本
```
