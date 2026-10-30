# Teaching examples (genericized)

These examples illustrate principles, not drop-in fixes for an unknown codebase. Always inspect call sites and output context.

## 1. Ambiguous short strings

```php
// Ambiguous when used for both a transaction and an action.
__( 'Refund', 'plugin-slug' );
```

If the same English source has genuinely different meanings, distinguish them:

```php
_x( 'Refund', 'noun', 'plugin-slug' );
_x( 'Refund', 'verb', 'plugin-slug' );
```

Do not add context if the UI has only one unambiguous meaning. For explanation without a new key, use a translator comment.

## 2. An English-specific country prefix

Problematic design:

```php
function estimated_for_prefix( $country_code ) {
    $countries = array( 'GB', 'US', 'AE', 'CZ', 'DO', 'NL', 'PH' );
    return in_array( $country_code, $countries, true )
        ? __( 'the', 'plugin-slug' ) . ' '
        : '';
}
```

This assumes English article rules and forces translators to combine an isolated article with a country name. German case, French contractions, Russian inflection, and Swedish naming conventions cannot be fixed by translating `the` in isolation. A complete message might work, but first inspect the caller, intended output, localized country names, and compatibility implications. **Do not prescribe a blind replacement for this helper.**

## 3. Fragmented sentences

```php
// Problem: translators cannot freely restructure the whole message.
echo esc_html__( 'Showing', 'plugin-slug' ) . ' ' . $count . ' ' .
    esc_html__( 'results', 'plugin-slug' );
```

A better direction is a full plural-aware template with a count placeholder, using the appropriate WordPress plural function and escaping for the actual output context. The exact implementation depends on the surrounding code.

## 4. Comments versus context

```php
/* translators: %s: name of the course. */
$message = sprintf( __( 'Course: %s', 'plugin-slug' ), $course_name );
```

A comment helps explain a placeholder; it does not needlessly create a separate translation key.

## 5. Oversized translation strings

```php
// Suspicious: two independent sentences separated by a layout break.
__( 'Your profile is saved.<br>Check your email for confirmation.', 'plugin-slug' );
```

A `<br>` or paragraph boundary should prompt inspection. Here, each sentence can likely be translated independently, with layout handled outside the translation. But do **not** automatically split a deliberate line break within one grammatical sentence. Ask whether the sentences depend on each other grammatically, and preserve intended rendering and escaping.

## 6. Punctuation and capitalization

```php
// Suspicious: translated text is placed inside fixed English quotation marks.
echo '&quot;' . esc_html__( 'Example', 'plugin-slug' ) . '&quot;';
```

Quotation marks and spacing vary across languages. Inspect the full displayed message before deciding whether quotation marks belong in the translatable string. Likewise, CSS `text-transform: uppercase` is not a substitute for appropriate localized capitalization.

## 7. Plural APIs are for counts

Do not use `_n()` as a generic switch between unrelated strings. Check that the selection is controlled by a number and that the number passed is the one being displayed or described. Where counts are used, translators may need more than the two forms apparent in English.

## 8. Review questions

- Is each translatable unit roughly one complete sentence, neither a fragment nor a multi-paragraph block?
- Do `<br>` tags or other structural separators indicate an oversized string?
- Can the translator reorder and inflect the complete message?
- Does a one-word label have different meanings elsewhere in the project?
- Would a comment suffice instead of context?
- Is a plural API used with the actual count?
- Are there external callers or hooks that constrain the proposed change?
- Are punctuation, capitalization, layout expansion, RTL, URLs, fonts, or keyword lists imposing English-only assumptions?
- Will changed keys create translation maintenance work?
