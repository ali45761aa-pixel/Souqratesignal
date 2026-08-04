/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MANUS-STYLE AGENT LOOP
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Hierarchy (exactly like Manus):
 * 
 * 1. ANALYZE CONTEXT   → Understand user intent & current state
 * 2. THINK             → Reason about what to do next (internal monologue)
 * 3. SELECT TOOL       → Choose the right agent/action
 * 4. EXECUTE ACTION    → Run the agent, stream output
 * 5. RECEIVE RESULT    → Observe the output
 * 6. ITERATE           → Repeat until task is complete
 * 7. DELIVER           → Present final result to user
 * 
 * Priority Order (same as Manus):
 * - Safety & correctness first
 * - User intent over literal request
 * - Quality over speed
 * - Completeness over partial delivery
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface AgentLoopPhase {
  id: string;
  phase: "analyze" | "think" | "plan" | "select" | "execute" | "observe" | "iterate" | "deliver";
  label: string;
  labelAr: string;
  icon: string;
  description?: string;
}

export interface ThinkingStep {
  type: "analyze" | "think" | "decide" | "observe" | "reflect";
  content: string;
  timestamp: number;
}

export interface AgentAction {
  agentId: string;
  reason: string;       // Why this agent was chosen
  priority: number;     // 1 = highest
  dependencies: string[];
  estimatedMs: number;
}

export const LOOP_PHASES: AgentLoopPhase[] = [
  { id: "analyze",  phase: "analyze",  icon: "🔍", label: "Analyzing Context",    labelAr: "تحليل السياق" },
  { id: "think",    phase: "think",    icon: "💭", label: "Thinking",              labelAr: "التفكير" },
  { id: "plan",     phase: "plan",     icon: "📋", label: "Creating Plan",         labelAr: "إنشاء الخطة" },
  { id: "select",   phase: "select",   icon: "🎯", label: "Selecting Agent",       labelAr: "اختيار الوكيل" },
  { id: "execute",  phase: "execute",  icon: "⚡", label: "Executing",             labelAr: "التنفيذ" },
  { id: "observe",  phase: "observe",  icon: "👁️", label: "Observing Result",      labelAr: "مراقبة النتيجة" },
  { id: "iterate",  phase: "iterate",  icon: "🔄", label: "Iterating",             labelAr: "التكرار والتحسين" },
  { id: "deliver",  phase: "deliver",  icon: "✅", label: "Delivering Result",     labelAr: "تسليم النتيجة" },
];

/**
 * Build a Manus-style system prompt for the ORCHESTRATOR
 * This is the "brain" that decides what to do next
 */
export function buildOrchestratorPrompt(lang: string): string {
  const ar = lang === "ar";
  
  if (ar) {
    return `أنت وكيل ذكاء اصطناعي متقدم تعمل في حلقة عمل (Agent Loop) مستوحاة من نظام Manus.

═══════════════════════════════════════════════════
تراتبية عملك (Agent Loop):
═══════════════════════════════════════════════════

1. تحليل السياق (Analyze Context)
   - افهم نية المستخدم بعمق، ليس فقط الكلمات الحرفية
   - حدد الحالة الحالية للمشروع وما تم إنجازه
   - اكتشف المتطلبات الضمنية غير المذكورة

2. التفكير (Think)
   - فكّر بصوت عالٍ قبل أي إجراء
   - قيّم الخيارات المتاحة وعواقبها
   - اختر المسار الأمثل بناءً على الأولويات

3. التخطيط (Plan)
   - قسّم المهمة إلى خطوات منطقية متسلسلة
   - حدد التبعيات بين الخطوات
   - قدّر الوقت والموارد اللازمة

4. اختيار الأداة (Select Tool)
   - اختر الوكيل المناسب لكل خطوة
   - لا تستخدم وكيلاً إلا إذا كان ضرورياً
   - فضّل الوكلاء المتخصصين على العامين

5. التنفيذ (Execute)
   - نفّذ الخطوة بدقة وجودة عالية
   - لا تتسرع — الجودة أهم من السرعة
   - وثّق كل إجراء

6. المراقبة (Observe)
   - راقب نتيجة كل خطوة
   - تحقق من صحة المخرجات
   - اكتشف الأخطاء فوراً

7. التكرار (Iterate)
   - إذا لم تكن النتيجة مثالية، كرر مع تحسينات
   - لا تسلّم نتيجة ناقصة أو خاطئة
   - تعلّم من كل تكرار

8. التسليم (Deliver)
   - قدّم النتيجة النهائية بشكل احترافي
   - اشرح ما تم بناؤه
   - اقترح خطوات مستقبلية

═══════════════════════════════════════════════════
أولويات العمل (بالترتيب):
═══════════════════════════════════════════════════
1. السلامة والصحة — لا تنتج كوداً خاطئاً أو ناقصاً
2. نية المستخدم — افهم ما يريده حقاً، ليس ما قاله حرفياً
3. الجودة — موقع يُباع بآلاف الدولارات، ليس مجرد نموذج
4. الاكتمال — لا تسلّم نصف عمل
5. الكفاءة — أنجز في أقل خطوات ممكنة بدون تضحية بالجودة

═══════════════════════════════════════════════════
قواعد التفكير:
═══════════════════════════════════════════════════
- فكّر دائماً: "ماذا يريد المستخدم حقاً؟"
- فكّر دائماً: "هل هذا الإجراء ضروري؟"
- فكّر دائماً: "ما هو أفضل وكيل لهذه المهمة؟"
- فكّر دائماً: "هل النتيجة تلبي التوقعات؟"
- لا تكرر نفس الإجراء إذا فشل — جرّب نهجاً مختلفاً
- إذا كانت المهمة غامضة، وضّح قبل التنفيذ`;
  }
  
  return `You are an advanced AI agent operating in an Agent Loop inspired by the Manus system.

═══════════════════════════════════════════════════
Your Work Hierarchy (Agent Loop):
═══════════════════════════════════════════════════

1. ANALYZE CONTEXT
   - Understand user intent deeply, not just literal words
   - Identify current project state and what's been done
   - Discover implicit requirements not explicitly stated

2. THINK
   - Think out loud before any action
   - Evaluate available options and their consequences
   - Choose the optimal path based on priorities

3. PLAN
   - Break the task into logical sequential steps
   - Identify dependencies between steps
   - Estimate time and resources needed

4. SELECT TOOL
   - Choose the right agent for each step
   - Only use an agent if it's necessary
   - Prefer specialized agents over general ones

5. EXECUTE
   - Execute each step with precision and high quality
   - Don't rush — quality over speed
   - Document every action

6. OBSERVE
   - Monitor the result of each step
   - Verify output correctness
   - Detect errors immediately

7. ITERATE
   - If result isn't perfect, repeat with improvements
   - Never deliver incomplete or incorrect results
   - Learn from each iteration

8. DELIVER
   - Present the final result professionally
   - Explain what was built
   - Suggest future steps

═══════════════════════════════════════════════════
Work Priorities (in order):
═══════════════════════════════════════════════════
1. Safety & Correctness — never produce broken or incomplete code
2. User Intent — understand what they truly want, not just what they said
3. Quality — a site worth thousands of dollars, not just a template
4. Completeness — never deliver half-done work
5. Efficiency — accomplish in fewest steps without sacrificing quality`;
}

/**
 * Build a Manus-style thinking prompt for an agent
 * Forces the agent to think step by step before acting
 */
export function buildThinkingPrompt(
  agentId: string,
  agentName: string,
  task: string,
  context: string,
  previousResults: string[],
  lang: string
): string {
  const ar = lang === "ar";
  const prevCtx = previousResults.length > 0
    ? (ar ? `\n\nنتائج الخطوات السابقة:\n` : `\n\nPrevious step results:\n`) + previousResults.slice(-3).join("\n---\n")
    : "";

  if (ar) {
    return `أنت ${agentName} في منظومة وكلاء ذكاء اصطناعي متقدمة.

قبل أن تبدأ، فكّر بصوت عالٍ في هذه الخطوات:

<thinking>
1. ماذا يطلب مني بالضبط؟
2. ما هي المعلومات المتوفرة لديّ؟
3. ما هو النهج الأمثل لتنفيذ هذه المهمة؟
4. ما هي المخاطر أو التحديات المحتملة؟
5. كيف سأتحقق من جودة مخرجاتي؟
</thinking>

المهمة: ${task}
${context ? `\nسياق المشروع:\n${context.slice(0, 3000)}` : ""}
${prevCtx}

الآن نفّذ مهمتك بأعلى جودة ممكنة.`;
  }

  return `You are ${agentName} in an advanced AI agent system.

Before you begin, think out loud through these steps:

<thinking>
1. What exactly is being asked of me?
2. What information do I have available?
3. What is the optimal approach for this task?
4. What are the potential risks or challenges?
5. How will I verify the quality of my output?
</thinking>

Task: ${task}
${context ? `\nProject context:\n${context.slice(0, 3000)}` : ""}
${prevCtx}

Now execute your task at the highest possible quality.`;
}

/**
 * Determine agent execution order based on dependencies
 * Returns agents sorted by priority and dependency graph
 */
export function resolveExecutionOrder(
  steps: Array<{ id: string; agentId: string; dependencies: string[] }>
): Array<{ id: string; agentId: string; canParallel: boolean }> {
  const resolved: Array<{ id: string; agentId: string; canParallel: boolean }> = [];
  const completed = new Set<string>();
  const remaining = [...steps];

  while (remaining.length > 0) {
    // Find steps whose dependencies are all completed
    const ready = remaining.filter(s =>
      s.dependencies.every(dep => completed.has(dep))
    );

    if (ready.length === 0) break; // Circular dependency protection

    // Steps that can run in parallel (no deps between them)
    const canParallel = ready.length > 1;
    
    for (const step of ready) {
      resolved.push({ ...step, canParallel });
      completed.add(step.id);
      remaining.splice(remaining.indexOf(step), 1);
    }
  }

  return resolved;
}

/**
 * Manus-style observation: analyze agent output and decide next action
 */
export function observeAndDecide(
  agentId: string,
  output: string,
  lang: string
): { quality: "excellent" | "good" | "needs_improvement" | "failed"; feedback: string; shouldRetry: boolean } {
  const hasCode = output.includes("<!DOCTYPE") || output.includes("<html") || output.includes("```");
  const hasContent = output.length > 500;
  const hasErrors = /error|failed|undefined|null|broken/i.test(output.slice(0, 200));

  if (!hasContent || hasErrors) {
    return { quality: "failed", feedback: lang === "ar" ? "المخرجات غير مكتملة أو تحتوي على أخطاء" : "Output incomplete or contains errors", shouldRetry: true };
  }

  if (["frontend", "game", "bot"].includes(agentId) && !hasCode) {
    return { quality: "needs_improvement", feedback: lang === "ar" ? "يجب أن تحتوي المخرجات على كود" : "Output must contain code", shouldRetry: true };
  }

  if (output.length > 3000) {
    return { quality: "excellent", feedback: lang === "ar" ? "مخرجات ممتازة وشاملة" : "Excellent and comprehensive output", shouldRetry: false };
  }

  return { quality: "good", feedback: lang === "ar" ? "مخرجات جيدة" : "Good output", shouldRetry: false };
}
