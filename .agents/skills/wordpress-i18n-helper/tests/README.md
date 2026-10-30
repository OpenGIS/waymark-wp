# Evaluation cases (planned)

This directory will contain small WordPress-oriented fixtures and expected review findings, covering:

1. Isolated article or preposition concatenated with country names.
2. Identical short strings with different grammatical meanings.
3. Unnecessary `_x()` contexts that should be translator comments.
4. Plural and count handling.
5. Complete-message placeholders and word-order flexibility.
6. Public API and hook compatibility when refactoring.

Tests should assess both REVIEW explanations and IMPROVE changes. Do not treat the presence of gettext wrappers as proof of a passing result.
