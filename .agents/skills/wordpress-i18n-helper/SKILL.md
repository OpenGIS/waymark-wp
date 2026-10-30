---
name: wordpress-i18n-helper
description: Review, explain, and improve WordPress plugin and theme internationalization (i18n) and localization (l10n). Use for WordPress plugin reviews, translation-ready code, gettext strings, translation context, plurals, grammatical flexibility, translator comments, and safe i18n refactoring.
---

# WordPress i18n helper

Help developers produce code that can be translated naturally into many languages, not merely code that passes automated i18n checks.

## Select an operating mode

- **REVIEW (default):** Inspect and teach. Do not modify code. Report actionable findings, explain linguistic consequences, and show representative corrections.
- **IMPROVE:** Inspect, classify, and implement changes authorized by the developer. Correct unambiguous problems; ask before making decisions about meaning, UI copy, behavior, public APIs, or compatibility.

If the user has not clearly authorized edits, use REVIEW. Respect scope, repository instructions, and developer intent. Do not silently broaden the task.

## Required reading

Read [linguistic principles](references/principles.md) before assessing translation quality. Read [WordPress implementation guidance](references/wordpress.md) when recommending or editing code. Consult [examples](references/examples.md) for representative anti-patterns. These references are normative for this skill, but do not supersede project-specific requirements or current WordPress APIs.

## Workflow

1. Identify the relevant user-visible strings, their complete rendering paths, and translation domains.
2. Inspect **callers and assembled output**, not only individual gettext calls. Search for identical source strings used with different meanings; examine sentence boundaries, markup separators, punctuation, and presentation constraints.
3. Classify findings: genuine linguistic defect; missing or misleading context; technical i18n issue; potential issue requiring more evidence.
4. Prioritize problems that prevent correct translations. Group repeated instances instead of repeating the same explanation.
5. In REVIEW, give location, observed code, linguistic reason, illustrative language-specific failure, suggested fix, and any developer decision needed.
6. In IMPROVE, first identify compatibility and intent questions. Apply minimal edits to safe cases, preserve escaping and functionality, and verify with available tests or tooling.
7. Report what changed, what remains unresolved, and which gettext keys changed (including context changes) so translation maintainers can review them.

Do not claim a check or test ran unless it actually did. Avoid overconfident universal rules about particular languages. Prefer complete, grammatically independent translation units with meaningful placeholders.

## Core guardrails

- A gettext wrapper is **not** proof of localizability.
- Prefer **one complete sentence per translatable string**. Investigate `<br>` or stronger separators as signs of oversized strings; do not split blindly.
- Check punctuation, capitalization, text expansion, and language-dependent non-gettext content where relevant.
- Never translate isolated grammatical fragments as a workaround for sentence construction.
- Use contextual keys only when identical source strings need different translations; use translator comments for explanation.
- Keep contexts short but sufficient. Avoid needless catalog fragmentation.
- Preserve public APIs, hooks, filters, and runtime behavior unless the developer authorizes a change.
- Changing msgid or msgctxt changes a lookup key. Translation editors may offer fuzzy matches requiring review; matching is tool-dependent and not guaranteed.
- Keep the developer in control of ambiguous language and product decisions.

## Suggested report

Use a concise summary, then findings ordered by impact. For each finding provide: **Location**, **Issue**, **Why translation fails**, **Suggested change**, **Confidence / decision needed**. In IMPROVE add **Files changed**, **Validation performed**, and **Translation-key impact**.
