# WordPress implementation guidance

## PHP translation functions

Use the project's correct text domain and WordPress gettext APIs, including `__()`, `_e()`, `_x()`, `_ex()`, `_n()`, and `_nx()` as appropriate. Prefer escaped output variants such as `esc_html__()`, `esc_attr__()`, `esc_html_x()`, or escaping at the correct output boundary. Escaping depends on output context; do not mechanically replace all calls with one escaping function.

Use literal source strings and literal text domains where required for extraction. Follow current WordPress coding standards and project conventions.

## Translator comments

Use comments beginning `translators:` immediately before the relevant translation call when placeholders, abbreviations, or unexpected meaning require explanation. A translator comment adds guidance without creating a new gettext key. Do not use a distinct `_x()` context merely to document a placeholder.

## Variables and formatting

Keep complete message templates translatable. Prefer numbered `sprintf()` placeholders when translators may need to reorder variables. Do not interpolate variables into the original string before translation. Escape dynamic values and output according to context. When placeholders contain markup or HTML, evaluate safety and translator flexibility carefully.

## Plurals are count-dependent

Use `_n()` or `_nx()` for forms selected by a **numeric count** and pass the actual number. Do not use plural APIs merely to toggle between two unrelated wordings or generic singular/plural concepts without a count. Different languages have different plural categories; do not hardcode an English two-form assumption.

## Markup and string boundaries

Prefer one complete sentence per translation call. Investigate strings containing `<br>`, paragraph tags, or stronger layout separators: these often contain multiple independently translatable sentences. Do not automatically split on tags or punctuation; confirm grammatical independence. Avoid unnecessarily embedding HTML in translation strings. Where markup is needed, keep complete and valid tag pairs and assess translator control of word order and output safety.

Keep language-dependent punctuation and quotation marks inside the relevant translatable sentence when appropriate. Avoid using CSS `text-transform` to force capitalization of translated text. Check responsive layouts for expansion and RTL behavior.

## JavaScript

For JavaScript, use the WordPress `@wordpress/i18n` APIs and ensure the script's translation catalog is correctly registered and loaded. Inspect the build pipeline and text domain. Avoid assuming PHP-only translation checks cover JS.

## Locale-sensitive UI

Check date/time, numbers, currency, names, text direction, and accessible labels. Use WordPress locale-aware formatting functions where suitable rather than manually imposing English formats. Test RTL layout where relevant. Do not confuse translated strings with full locale-aware behavior.

## Verification

Where available, use WordPress coding standards / i18n linting, string extraction, tests, and targeted searches. Automated checks find API misuse but cannot reliably judge grammatical flexibility. Inspect actual rendered messages and callers. Do not claim a successful extraction or test unless performed.

## Compatibility and catalog maintenance

Preserve public functions, hooks, filters, and stable identifiers. Refactoring a string assembly helper may require examining all callers and downstream extensions. Note changed `msgid`/`msgctxt` pairs and likely translation-review workload. Do not promise that fuzzy matching will recover every previous translation.
