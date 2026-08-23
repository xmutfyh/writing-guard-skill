#!/usr/bin/env node
/**
 * writing-guard-skill CLI — 本地写作纪律审计（零网络 · 零 LLM · 零依赖）。
 *
 * 引擎 = engine/rules.mjs（由 dsh-plugin-writing-guard v1.6.2 的 src/rules.ts
 * 编译而来，MIT）。
 *
 * 子命令：
 *   audit            审计文本或文件（STYLE + Scholarship/Epistemic Lock + Journal Fit）
 *   rules            输出写作纪律速查（写作前加载）
 *   style-profile    从作者历史论文统计风格档案 JSON
 *   journal-profile  从目标期刊代表论文蒸馏 Journal Profile JSON
 *
 * 用法示例：
 *   node scripts/audit.mjs rules
 *   node scripts/audit.mjs audit --file paper.tex --verbose
 *   node scripts/audit.mjs audit --file paper.tex --original-file paper_before.tex
 *   node scripts/audit.mjs audit --file paper.tex --style-profile style.json --journal-profile journal.json
 *   node scripts/audit.mjs style-profile --dir ~/papers/authored/
 *   node scripts/audit.mjs journal-profile --dir ~/papers/nature-comms-rep/ --journal "Nature Communications"
 *
 * Node >= 18（无第三方依赖）。
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ENGINE = new URL('../engine/rules.mjs', import.meta.url)
const engine = await import(ENGINE)
const {
  auditText,
  formatReport,
  filterReport,
  rulesBrief,
  detectDocumentProfile,
  computeStyleProfile,
  computeJournalProfileFromDocuments,
  PLUGIN_VERSION,
} = engine

// ---------- 参数解析 ----------

const args = process.argv.slice(2)

function flagValue(flag, alias = null) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag || (alias && args[i] === alias)) {
      return args[i + 1]
    }
  }
  return undefined
}

function flagPresent(flag) {
  return args.includes(flag)
}

function flagList(flag) {
  const out = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && typeof args[i + 1] === 'string') out.push(args[i + 1])
  }
  return out
}

const SUBCOMMANDS = new Set(['audit', 'rules', 'style-profile', 'journal-profile'])
const subcommand = args[0] && SUBCOMMANDS.has(args[0]) ? args[0] : 'audit'

if (args[0] && !SUBCOMMANDS.has(args[0]) && !args[0].startsWith('-')) {
  console.error(`未知子命令: ${args[0]}（支持: ${[...SUBCOMMANDS].join(', ')}）`)
  process.exit(2)
}

// ---------- 文件遍历（兼容无 path 字段的旧 Node Dirent） ----------

async function collectTextFiles(root) {
  const stat = await fs.stat(root)
  const files = []
  const ok = new Set(['.md', '.markdown', '.tex', '.txt'])
  const walk = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      const isDir = e.isDirectory ? e.isDirectory() : (await fs.stat(full)).isDirectory()
      if (isDir) {
        await walk(full)
      } else {
        const ext = path.extname(e.name).toLowerCase()
        if (ok.has(ext)) files.push(full)
      }
    }
  }
  if (stat.isDirectory()) {
    await walk(root)
  } else if (ok.has(path.extname(root).toLowerCase())) {
    files.push(root)
  } else if (stat.isFile() && root.toLowerCase().endsWith('.bib')) {
    // 允许 .bib 单独作为引用完整性数据源（见 audit --bib）
    files.push(root)
  }
  return files
}

// ---------- 子命令 ----------

if (subcommand === 'rules') {
  process.stdout.write(rulesBrief() + '\n')
  process.exit(0)
}

if (subcommand === 'style-profile') {
  const target = flagValue('--file') ?? flagValue('--dir') ?? flagValue('--learn-dir')
  if (!target) {
    console.error('style-profile 需要 --file <path> 或 --dir <path>')
    process.exit(2)
  }
  const files = await collectTextFiles(target)
  const chunks = []
  for (const f of files) {
    try {
      chunks.push(await fs.readFile(f, 'utf8'))
    } catch {
      // 跳过不可读
    }
  }
  if (chunks.length === 0) {
    console.error(`未找到可读的 .md/.tex/.txt 文件: ${target}`)
    process.exit(2)
  }
  const profile = computeStyleProfile(chunks.join('\n\n'))
  const out = flagValue('--out')
  const json = JSON.stringify(profile, null, 2)
  if (out) {
    await fs.writeFile(out, json + '\n')
    console.error(`风格档案已写入 ${out}（统计来源：${chunks.length} 个文件）`)
  } else {
    process.stdout.write(json + '\n')
  }
  process.exit(0)
}

if (subcommand === 'journal-profile') {
  const target = flagValue('--file') ?? flagValue('--dir') ?? flagValue('--learn-dir')
  if (!target) {
    console.error('journal-profile 需要 --file <path> 或 --dir <path>')
    process.exit(2)
  }
  const files = await collectTextFiles(target)
  const documents = []
  for (const f of files) {
    try {
      documents.push({ text: await fs.readFile(f, 'utf8'), sourceId: path.basename(f) })
    } catch {
      // 跳过不可读
    }
  }
  if (documents.length === 0) {
    console.error(`未找到可读的 .md/.tex/.txt 文件: ${target}`)
    process.exit(2)
  }
  const journal = flagValue('--journal')
  const articleType = flagValue('--article-type')
  const discipline = flagValue('--discipline')
  const profile = computeJournalProfileFromDocuments(documents, {
    journal: journal ? journal : undefined,
    articleType: articleType ? articleType : undefined,
    discipline: discipline ? discipline : undefined,
    sampleSize: documents.length,
  })
  const out = flagValue('--out')
  const json = JSON.stringify(profile, null, 2)
  if (out) {
    await fs.writeFile(out, json + '\n')
    console.error(`期刊档案已写入 ${out}（样本：${documents.length} 篇）`)
  } else {
    process.stdout.write(json + '\n')
  }
  process.exit(0)
}

// ---------- audit ----------

{
  const filePath = flagValue('--file')
  const rawText = flagValue('--text')
  let text = rawText
  let profile

  const VALID_PROFILES = ['manuscript', 'rebuttal', 'cover_letter', 'review', 'notes']
  if (text && filePath) {
    console.error('注意：同时给了 --text 和 --file，仅审计 --text 内容')
  }
  if (!text && filePath) {
    text = await fs.readFile(filePath, 'utf8')
    // 显式 --profile 优先；否则按扩展名自动检测
    const p = flagValue('--profile')
    profile = p && VALID_PROFILES.includes(p) ? p : detectDocumentProfile(filePath)
  } else if (text) {
    const p = flagValue('--profile')
    if (p && VALID_PROFILES.includes(p)) profile = p
  } else {
    console.error('audit 需要 --text "..." 或 --file <path>')
    process.exit(2)
  }

  if (!text || !text.trim()) {
    console.error('审计内容不能为空')
    process.exit(2)
  }

  // v1.3：同目录 .bib（local-citation-integrity）
  let bibText
  const bibFile = flagValue('--bib')
  if (bibFile) {
    bibText = await fs.readFile(bibFile, 'utf8')
  } else if (filePath) {
    try {
      const dir = path.dirname(filePath)
      const entries = await fs.readdir(dir)
      const bibs = entries.filter((f) => f.toLowerCase().endsWith('.bib'))
      if (bibs.length > 0) bibText = await fs.readFile(path.join(dir, bibs[0]), 'utf8')
    } catch {
      // 无 .bib：跳过
    }
  }

  // original（Scholarship + Epistemic Lock）
  let original
  const originalFile = flagValue('--original-file')
  const originalArg = flagValue('--original')
  if (originalFile) {
    original = await fs.readFile(originalFile, 'utf8')
  } else if (originalArg !== undefined) {
    original = originalArg
  }

  // profiles
  let styleProfile
  const stylePath = flagValue('--style-profile')
  if (stylePath) {
    try {
      styleProfile = JSON.parse(await fs.readFile(stylePath, 'utf8'))
    } catch (e) {
      console.error(`style-profile JSON 解析失败: ${e.message}`)
      process.exit(2)
    }
  }
  let journalProfile
  const journalPath = flagValue('--journal-profile')
  if (journalPath) {
    try {
      journalProfile = JSON.parse(await fs.readFile(journalPath, 'utf8'))
    } catch (e) {
      console.error(`journal-profile JSON 解析失败: ${e.message}`)
      process.exit(2)
    }
  }

  const projectTerms = flagList('--project-term')

  const report = auditText(text, {
    profile,
    projectResidueTerms: projectTerms,
    original: original ? original : undefined,
    styleProfile: styleProfile || undefined,
    bibText: bibText || undefined,
    journalProfile: journalProfile || undefined,
  })

  const minSeverity = flagValue('--min-severity')
  const finalReport =
    minSeverity && ['low', 'medium', 'high'].includes(minSeverity) ? filterReport(report, minSeverity) : report

  if (flagPresent('--json')) {
    process.stdout.write(JSON.stringify(finalReport, null, 2) + '\n')
  } else {
    const verbose = flagPresent('--verbose')
    process.stdout.write(formatReport(finalReport, { verbose }) + '\n')
  }

  // 退出码：存在 high 级问题时非零（便于 CI / agent 判定）
  const hasHigh = finalReport.hits?.some((f) => f.severity === 'high') || false
  process.exit(hasHigh && flagPresent('--fail-on-high') ? 1 : 0)
}
