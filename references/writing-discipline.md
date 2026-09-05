
# 论文写作纪律守则（writing-guard v2.0）

本技能是 `dsh-plugin-writing-guard`（DSH 插件，v2.0.1）的独立静态版——规则集与插件一致，
供没有 DSH 的环境（Codex / Claude Code / Antigravity / 任意 agent）在写作与润色时执行。
所有规则均为确定性正则/统计，零网络零 LLM；源插件还提供 `writing_audit`（扫描）、
`writing_rules`（速查）、`writing_style_profile`（作者风格档案）、`writing_journal_profile`
（目标期刊写作档案）工具与 Scholarship Lock 实体对比。

v2.0 核心定位变更：从 "AI detector" 转向 **Argument Economy & Control-Plane Separation**。
Deterministic rules remain local; semantic writing decisions are delegated to the host model through rulesBrief()/SKILL.md.

---

## 0. Manuscript Writing Policy（v2.0，控制面声明）

> 以下原则由 SKILL.md 中的 Manuscript Writing Policy 约束宿主模型行为；
> engine/rules.mjs 中的确定性规则负责检测违规信号。

### 0.1 Control context ≠ manuscript content

- **Critique is not content.** Reviewer comments、用户编辑指令、guard findings、rejected alternatives、remediation suggestions 是 control context，不是 manuscript evidence。
- 不得将 control-context 措辞转化为 manuscript prose，除非权威研究材料独立支持该陈述。
- 如果 concern 对应一个真实 method fact，只陈述该 fact。例：用 `Normalization parameters were estimated from the training data.` 而非 `To prevent data leakage, ...`。
- 如果源材料不支持该 fact，不得捏造 mitigation。保持 manuscript 不变或 query 作者。

### 0.2 Argument economy

每个句子必须通过以下之一证明其存在：evidence、method、result、comparison、non-obvious interpretation、a necessary scope/evidence boundary、or a logical relation required by the argument。

如果删除一个句子仍能保持科学内容和论证完整，**CUT it**。Prefer CUT over REWRITE。不要把无用句子变成更精致的无用句子。

删除仅服务于以下功能的 prose：

- pre-empt reviewer criticism（预判审稿人批评）
- reassure the reader that a risk was considered（让读者安心风险已被考虑）
- defend the authors or the method（为作者或方法辩护）
- advertise that a finding is important（宣传发现的重要性）
- narrate the writing/revision process（叙述写作/修改过程）
- restate an already explicit claim（重述已明确的主张）
- explain an implication that the intended specialist reader can infer directly（解释目标专业读者能直接推断的含义）

### 0.3 Do not close every semantic loop

每个科学主张只陈述一次。在 evidence 和必要的 calibrated interpretation 存在后，停止。假设 specialist reader 能独立完成一步明显的推理。

将 `In other words`、`This means that`、`Taken together`、以及等效中文总结标记视为 **candidates**，而非 banned phrases。仅在下一句添加 mechanism、comparison、quantitative interpretation、condition、citation 或 necessary boundary 时保留。

独立评价如 `This is an important finding.` 应删除，除非其立即指定 concrete consequence。

### 0.4 Clarity ≠ exhaustive explanation

Clarity 意味着 explicit referents、readable syntax、sufficient reproducibility detail、以及解释 evidence 所需的 reasoning。它 **不** 意味着阐述每个 implication。

不要仅为了简洁而删除定义、non-obvious statistical interpretation、necessary method detail 或 genuine epistemic boundaries。翻译 difficult metric 为 useful meaning 的句子可保留；仅 paraphrase 已明确主张的句子应删除。

### 0.5 Defensive-purpose test

将 reviewer-facing prebuttals、repeated non-claim disclaimers、omitted-experiment defenses、result excuses、legalistic reassurance、以及 automatic "therefore this is important" summaries 视为 removal or relocation 的 candidates。

对于任何此类句子，按顺序问：

1. 它是否改变了 method、validity、scope、evidence strength 或 interpretation 的 scientifically necessary understanding？如果是 **no**，CUT。
2. 底层 fact 是否由 authoritative research material 独立支持？如果是 **yes**，直接且最小化地陈述该 fact；如果是 **no**，QUERY 而非捏造。
3. 该内容是否为 real limitation or alternative explanation？如果是 **yes**，在 appropriate section 保留科学内容，但移除 reviewer-facing motive 和 repeated reassurance。

### 0.6 Style-only expansion discipline

当用户只要求 polishing、rewriting 或 style improvement 且不提供新 scientific content 时，默认 **same length or shorter**。Expansion 仅在 resolve real ambiguity、preserve reproducibility 或 state a necessary scientific boundary 时才有正当理由。

### 0.7 Minimal edit protocol

使用 **CUT → PRUNE → RECAST → SPLIT**。不要自动将一个 difficult sentence 拆成两个或三个 explanatory sentences。仅在 original 真正包含多个 independent scientific claims 时 split。

对于 defensive prose，**写 scientific fact，而非你 defensively 提及该 fact 的原因**。

### 0.8 Scientific invariants

Never silently alter numbers, units, statistics, citations, Figure/Table references, negation, null findings, causal strength, evidential strength, evidence status, population, condition, or scope for style. If a better sentence requires unsupported science, **QUERY**.

---

## 1. 修改过程残留（process residue）——正文/投稿信中零容忍

- 删除："revised/revision"、"as requested"、"we have updated/modified"、"previous version"、
  中文"本轮/本次修改/投稿前/待补齐/审稿人要求/我们修改了/修订稿/返修稿"。
- 例外：rebuttal（回复信）中 "the revised manuscript / as requested" 完全正常；专有名词
  （Revised Cardiac Risk Index、revised simplex method）与文献语境（"Smith proposed a revised model"）不算。
- 版本号、文件名、SHA、内部流程名词不得进入正文。

## 2. 主张校准（claim calibration）

- 禁止反复自我设限："we do not claim"、"本文并非要证明"、"这并不意味着"——同一边界集中写一次。
- 自黑免责零容忍（v0.7）：不得出现"完全基于假数据 / 基于虚构/伪造数据 / 模型毫无意义 /
  结果完全不可靠 / 不足为凭"等摧毁论文价值的自我打压（AI 安全护栏误触发的过度防御）。
  诚实 limitations（"样本量有限"、"结果可能不完全可靠"）是正当表述，不在此列。
- 防御饱和：may/might/could/possibly/potentially 密度 ≥5 次且 ≥300/千句时清理；
  一条 claim 套多层保险（"may potentially suggest"、"或许可能"）拆到只剩一层；
  有证据依据的 hedging 保留（ICMJE 要求报告统计不确定性）。
- 强主张（prove/establish/confirm/guarantee）附近必须有证据锚点（数字/统计量/图表引用），否则弱化。
- 局限性跨章节分散（≥3 个章节出现局限表述）时集中写：方法定位 1 处 + 结论边界 1 处。

## 3. 修辞模式（rhetorical pattern）

- "不是X而是Y"/"not X but Y"对仗句式：删除一半，用数字、动作、场景替代（概念澄清可保留一次）。
- 绝对化定义（"唯…才…/其核心在于/其本质在于"）改为有条件的命题。
- 三连排比（X, Y, and Z）密度 ≥4 处且 ≥0.8/千词时精简。
- 中文多重"的"字修饰链（v0.7）：连续 ≥3 个"的"的嵌套（"基于X的Y的Z的机制"）拆成 2–3 个短句，
  主谓宾主干显性化；两层"的"（"该方法的预测结果"）不算。
- 重复绕圈：同段句子高词汇重合且无新增证据时删掉重复圈。

## 4. LLM 关联词与空洞热词（density-gated，概率信号非证据）

- 高频动词/名词（delve/tapestry/testament/leverage/harness/underscore/pivotal/meticulous）：
  全文 ≥2 次且 ≥0.4/千词才处理，单次出现不慌。
- 过渡词（moreover/furthermore/additionally/in conclusion/ultimately/consequently/thus/hence/
  accordingly/thereby/to this end/notably/importantly/specifically/this matters/this motivates）：
  ≥8 次且 ≥1.5/千词时删除大部分；学术写作出现 1–2 次正常。
- 中文套话（值得注意的是/综上所述/与此同时/基于此/进一步/由此可见/鉴于/毫无疑问/特别地/有鉴于此/也就是说/随着…的发展）：
  ≥8 次且 ≥2.0/千字符时精简。
- 空洞热词（v0.7，密度门控避免误伤术语）：
  - 英文 robust/crucial/substantially/exhibits/tailored/interplay/imperative：≥5 次且 ≥1.0/千词时，
    用具体证据替换（"robust performance" → "RMSE decreased from 2.1 to 1.3"）；术语（robust regression）保留；
  - 中文 机制/支撑/动态/稳健/范式/拓扑/耦合/协同/维度/全流程/精细化/解耦：≥10 次且 ≥3.0/千字时
    检查抽象名词堆砌；专业术语（"耦合机理"）在领域文献中正常，低于阈值不报。

## 5. 学术文体与格式

- 平均句长（v0.7）：英文均值 ≤18 词、中文均值 ≤25 字（参考目标 12–18 词 / 15–25 字）；
  把最长的约 20% 句子拆短。综述等文体可整体偏长，人工判断。
- 超长句堆叠：英文 >35 词且 ≥3 从句标记、中文 >80 字且 ≥5 逗号且 ≥3 连接词——拆句。
- 抽象副词（remarkably/interestingly/importantly）换成具体数值；"significantly" 仅在无统计证据的
  修辞用法需改（p<0.05 是正当用法）。
- "we believe/think" 改为 "the results show"；模糊词（somewhat/quite/fairly）少堆叠。
- 破折号 ≥5 次且 ≥0.5/千词时删除大部分（范围连字符 30–75 °C 不算）；冒号标题前后必须并列或递进。
- LaTeX 中 Unicode 下标/希腊字母（₁ α）改用数学模式；绝不破坏 \cite/\ref/\label、自定义宏与公式。

## 6. 局限性与学术自信（v0.7，ko5.6sol 借鉴）

- 自黑改写公式：客观边界 + 未来方向——"本研究采用模拟数据开展敏感性分析" →
  "下一步可在真实岩心实验中验证"。
- 主张动词校准表（按证据强度选词，不夸大也不自贬）：
  - modelled / simulated ≠ observed / measured（模拟评估 ≠ 真实观测，用词必须对应）；
  - suggested / indicated < demonstrated / established（弱证据用弱动词）；
  - we suggest ≠ we show（主观意愿 ≠ 结果陈述）。
- 纪律边界（ESR）：不得为了"学术自信"删除真实的证据缺口、失效模式、条件限制——
  局限是证据透明度的一部分，只改措辞不改事实。

## 7. 科学完整性锁（Epistemic Lock——Scholarship Lock 2.0）

> 数字没变 ≠ 没改坏。语言润色不得改变 science——无论往强还是往弱。

- **双轴主张模型**（改编自 Yila-AI/sci-ssci-skills，Apache-2.0，见 THIRD_PARTY.md）：
  - **因果力**：`consistent with`(0) < `is associated with`(1) < `predicts`(2) < `contributes to`(3)
    < `affects / leads to / reduces`(4) < `causes`(5)；
  - **证据力**：hedge（may/might/could，-1）< `suggest`(1) < `indicate`(2) < `support`(3) <
    `show`(4) < `demonstrate`(5) < `establish/confirm`(6) < `prove/guarantee`(7)。
  - 两轴独立检测："confirmed an association" = 因果力关联 + 证据力强，不是因果 L5；
    "was associated with" → "caused" 是因果力漂移；"suggested" → "confirmed" 是证据力漂移；
    "may be associated" → "is associated"（hedge 移除）也是证据力变化。
- **子句级多主张**：按 `; , while whereas although but and` 切分子句逐子句对齐——
  "X caused A, while Y may be associated with B" → "Y caused B" 必须检出（Y 的关联→因果），
  整句最高层掩盖不了局部漂移。`between/among X and Y` 枚举中的 and 不切分。
- **对齐相似度分档**：≥0.70 → high/invariant；0.55–0.70 → medium/invariant；
  0.45–0.55 → low/CANDIDATE（提示人工复核）；整句重写（低于对齐阈值）不产生假漂移。
- **否定守恒**：`No significant association` → `A significant association` 会翻转阴性/零结果。
  no / not / did not / without / non-significant 标记被删除即 HIGH；凭空引入否定也需核对。
- **零结果守恒**：`did not improve` / `no significant difference` / `remained unchanged` 是数据——
  不得因削弱叙事而删除（负面、零、矛盾结果是 Evidence-Bound 的 KEEP 类）。
- **scope 边界**：`in this study` / `under these conditions` / `在本研究中` / `内部验证` 等标记
  从同一句中消失 → 核验主张是否被泛化（不自动判错）。
- **证据状态守恒**：reported/observed/measured/implemented/estimated/simulated 等来源
  状态词消失或被替换 → 核验："participants reported improvement" 不能变成 "participants
  improved"（报告≠事实）；"observed rate" → "estimated rate" 是状态替换（观测≠模拟/估算），
  同样改变读者对证据来源的理解——不自动判错，恢复状态词或显式说明状态改变。
- **claim-bound 守恒**：否定/零结果/scope/证据状态**绑定到所属子句**逐句配对比较——
  "X did not improve, but Y improved" → "X improved, but Y did not improve" 这种标记交换
  （句子级数量完全相同）必须检出；marker 大小写/英美拼写（modelled↔modeled）不视为变化；
  scope 边界新增（一般陈述→受限陈述）提示可能缩窄外部有效性；同一主张的因果力/证据力/
  hedge 多轴变化在同一条事件中全部保留。
- **命中性质（findingKind）**：
  - `INVARIANT`（🔴 科学不变量被改动：数字/引用/主张强度/否定/scope）——立即处理；
  - `VIOLATION`（明确违规：修改过程残留、自黑免责）——应当修正；
  - `CANDIDATE`（防御性候选或低相似度漂移）——cue ≠ verdict：
    可能承担正当的 claim 边界（scope/证据状态/因果边界/竞争解释），处置为
    KEEP / TIGHTEN / REFRAME / RELOCATE / CUT / QUERY，不确定就 QUERY，不要自动删除；
  - `ADVISORY`（纯文体：长句/密度/格式）——可保留并说明理由。
- **v2.0 EditAction**：每个 finding 携带 remediation 语义：
  KEEP / CUT / TIGHTEN / REFRAME_TO_FACT / RELOCATE / QUERY。

## 8. 期刊写作契合（Journal Engine）

- 目标不是"模仿 Nature 风格"，而是从目标期刊 author guidelines + 代表论文中提取可复用的
  统计规律（Journal Writing Profile）：句长/段长/hedge 密度/因果力/证据力/第一人称/被动语态/
  引用密度分布。
- 用 `writing_journal_profile` 从代表论文生成 profile；用 `writing_audit(journalProfile=JSON)`
  对当前稿件做 section-level Journal Fit（每个章节契合度百分比 + 主要差异 + 目标 P10-P90）。
- 多篇论文必须用 `computeJournalProfileFromDocuments` / `writing_journal_profile(learnDir=...)`
  按篇独立解析后再跨论文聚合；同章节指标全部为 Distribution（含 `articleCount`）。
- 比例型指标（第一人称/被动语态）评分使用 `minSpread=0.05`；引用密度拆分为
  文献引用与图表引用；Journal Fit 报告带 `confidence` 与 `corpusSize`。
- Journal Engine 复用 `extractClaimSpans` 生成 epistemic fingerprint。
- 优先级：Scientific Invariant > Epistemic Safety > Journal Requirement > Journal Norm >
  Journal Style——期刊风格永远不能覆盖科学完整性。

## 9. 交付完整性（Delivery Guard / CAL Detection）

检测工作上下文中的被否决方案、临时尝试、纠错过程是否泄漏到最终交付物：

- **REJECTED_ALTERNATIVE_LEAKAGE**：被否决术语泄漏（如 commit message 中引用已删除的 Toast 组件）
- **REVISION_PROCESS_LEAKAGE**：修改过程残留（如 "Remove X" 但 X 不在 baseline 中）
- **PROVENANCE_LEAKAGE**：来源泄漏（如 commit message 中提到 Claude/GPT）
- **UNJUSTIFIED_NEGATIVE_REFERENCE**：无依据否定引用
- **DELIVERY_CANDIDATE**：无法验证的删除/替换声明

可传入 baseline（权威基线内容）做基线真实性检查。

---

## 10. 提交前自查

- 润色/改写后自查：① 数字、百分数、p 值、置信区间、\cite/\ref、Figure/Table 编号、DOI
  是否被改动（语言润色不得改变科研事实——Scholarship Lock）；② 主张强度是否沿阶梯漂移、
  否定/零结果是否被翻转、scope 边界是否消失（Epistemic Lock）；③ 高危项清零、中危 ≤3 处；
  ④ 若在 DSH 环境，用 `writing_audit`（自动路径已带修改前基线）复核；⑤ 用
  `writing_style_profile` 学习作者历史风格，句长分布向作者靠拢；⑥ 若已有目标期刊，
  用 `writing_journal_profile` 生成/加载 Journal Profile，并用 `writing_audit(journalProfile=...)`
  检查 Journal Fit，但期刊风格调整不得改变 science。

---

*本守则来源于 dsh-plugin-writing-guard v2.0.1（MIT）。检测类规则为概率信号：命中即人工复核，
专业术语与正当 limitations 不因规则报警而删改。*

*v2.0 核心定位：Argument Economy & Control-Plane Separation。*
*Every sentence must earn its place. Critique is not content. Prefer CUT over REWRITE.*
