# writing-guard-skill

**去 AI 腔 · 守住证据 · 写向目标期刊**
Less AI. More Evidence. Better Journal Fit.

`dsh-plugin-writing-guard`（v1.6.2）规则集的 **Agent Skill 可执行版**：一份 `SKILL.md` +
一个零依赖 Node 脚本 + 编译好的规则引擎，供 **Claude Code**、**Codex** 及任意支持
Agent Skills 标准的 agent 直接使用。零网络、零 LLM、零第三方依赖、纯本地正则/统计。

## 与 DSH 插件的关系

| | DSH 插件（`dsh-plugin-writing-guard`） | 本 Skill |
|---|---|---|
| 运行环境 | DeepSeek Harness（Web GUI） | Claude Code / Codex / 任意 agent + Node ≥18 |
| 调用方式 | `writing_audit` 等模型工具 | `node scripts/audit.mjs ...` |
| 自动监听 | 文件写入后自动审计 | 显式调用（agent 按 SKILL.md 工作流执行） |
| 规则引擎 | 同一引擎（v1.6.2，MIT） | 同一引擎（`engine/rules.mjs`，编译自 `src/rules.ts`） |

DSH 环境请用插件；其他环境用本 Skill。两者规则完全一致。

## 安装

```bash
# Claude Code（用户级）
git clone git@github.com:xmutfyh/writing-guard-skill.git ~/.claude/skills/writing-guard-skill

# Codex（用户级，或 ~/.agents/skills/ 以兼容其他 agent）
git clone git@github.com:xmutfyh/writing-guard-skill.git ~/.codex/skills/writing-guard-skill

# 项目级（团队共享，Codex/Claude Code 均可发现）
git clone git@github.com:xmutfyh/writing-guard-skill.git <repo>/.agents/skills/writing-guard-skill
```

无需构建：`engine/rules.mjs` 是编译好的 ESM，直接运行。

## Quick Start

```bash
# 1. 写作前：加载纪律速查
node scripts/audit.mjs rules

# 2. 审计稿件（自动检测文档类型 + 同目录 .bib 引用完整性）
node scripts/audit.mjs audit --file paper.tex --verbose

# 3. 润色后回归（Scholarship + Epistemic Lock：数字/引用/主张/scope 不得被悄悄改动）
node scripts/audit.mjs audit --file paper_v2.tex --original-file paper_v1.tex --verbose

# 4. 可选：作者风格档案（句长分布漂移检测）
node scripts/audit.mjs style-profile --dir ~/papers/authored/ --out style.json

# 5. 可选：期刊写作档案 + Journal Fit（section-level 契合度）
node scripts/audit.mjs journal-profile --dir ~/papers/nature-comm-rep/ \
  --journal "Nature Communications" --article-type research-article --out journal.json
node scripts/audit.mjs audit --file paper_v2.tex --journal-profile journal.json --verbose
```

`--json` 输出原始 report（severity / findingKind / confidence / 位置 / 依据）；
`--fail-on-high` 让 HIGH 问题触发非零退出码（CI 友好）。

## 能力（对应插件 4 个工具）

| CLI 子命令 | 插件工具 | 说明 |
|---|---|---|
| `audit` | `writing_audit` | 8 类规则审计 + Scholarship/Epistemic Lock + Journal Fit |
| `rules` | `writing_rules` | 写作纪律速查 |
| `style-profile` | `writing_style_profile` | 作者历史风格节奏指纹 JSON |
| `journal-profile` | `writing_journal_profile` | 目标期刊写作档案 JSON |

**优先级阶梯**：Scientific Invariant > Epistemic Safety > Journal Requirement >
Journal Norm > Journal Style——期刊风格永远不能覆盖科学完整性。

## 安全

- **零网络**：脚本不发起任何网络请求（引擎已验证无 `fetch`/`require`/`child_process`）。
- **零依赖**：仅用 Node ≥18 内置模块（`node:fs/promises`、`node:path`）。
- **只读**：CLI 只读输入文件，绝不改写稿件；`--out` 仅写用户指定的 JSON 输出。
- 规则命中是**概率信号**，需人工复核；专业术语与正当 limitations 不因报警删改。

## 引擎出处

`engine/rules.mjs` 编译自 [`dsh-plugin-writing-guard`](https://github.com/xmutfyh/dsh-plugin-writing-guard)
v1.6.2（MIT）的 `src/rules.ts`（TypeScript → ESM，Node ≥18）。规则集、阈值、优先级与
插件完全一致；插件仓库的 CHANGELOG 记录全部规则演进（v0.6 → v1.6.2）。

## License

MIT — 见 [LICENSE](LICENSE)。规则集与引擎版权归原插件所有（MIT 授权再分发）。
