# Getting Started video — known issues

Working notes for the `getting-started` screencast. It is built and wired into the
docs. Everything below is measured, not estimated.

Built: **148.885 s (2:28.9)**, 7,224,144 bytes (6.89 MB), 7 caption cues,
poster check mean Δ 5.1, 0 request-guard violations.

The cut opens on the finished public Map, then reveals the Editor, so the first
thing a visitor sees is the product rather than an empty admin list.

## 1. Long pauses between scenes (accepted)

| transition          |        gap |
| ------------------- | ---------: |
| hero → popup        |     1.38 s |
| popup → types       | **3.40 s** |
| types → depth       | **5.13 s** |
| depth → collection  |     2.76 s |
| collection → editor | **5.77 s** |
| editor → shortcode  |     1.39 s |

min 1.38 s, max 5.77 s, spread 4.18×. The audit flags every gap above 1.5 s and
the 1.8× spread target.

Two of the long gaps are deliberate silent beats, not missing content:

- **popup → types** covers `popup-hold` (0.8 s still) and `popup-close` (closing
  the popup before the layers control).
- **types → depth** covers the `basemap` scene: a 2.8 s hold while the tiles
  redraw, with the switch explained by the previous line.

The remaining two are page loads:

- **collection → editor** — 4.8 s for the WordPress admin Map Editor. It loads
  the block editor, TinyMCE and the full admin stack; the front end loads none
  of it and arrives in about 0.6 s. The recorder correctly waits for the map to
  paint before speaking; speaking earlier is what produced the empty-panel
  defects fixed in earlier videos.
- **depth → collection** — 1.5 s for the Collection archive.

Measured on the recording instance: Editor DOMContentLoaded 3.55 s, load
3.56 s, 173 requests / 3.6 MB. The slowest scripts are `block-editor.js` 2.05 s,
`components.js` 1.92 s, `tinymce.min.js` 1.76 s. This is WordPress, not the
plugin and not the recorder.

`audioAfterActionMax` is 30 s so narration follows the true action end rather
than a cap; an earlier build capped at 0.9 s and spoke over the previous screen.

## 2. Host contention changes the take

Takes of identical code measured the Editor action end at 4.8 s, 5.9 s, 8.3 s
and 9.99 s depending on machine load (load averages 190–411 while an unrelated
Playwright suite ran). The take is selected on that number: record again if the
Editor action end exceeds 8 s. A contended take is not a pipeline defect, but it
does lengthen the `collection → editor` gap.

## 3. Poster marker must land in a still frame

A poster scene's marker is recorded at the **end of that scene's hold**, so if
the next scene moves the viewport the marker lands on the first frame of that
movement. The first build marked the poster at the end of `popup` and measured
mean Δ 35.6 against the replay.

Fixed by following the poster scene with a silent still beat (`popup-hold`,
0.8 s). Poster check then measured 2.3–5.1 on every take. The rule: a poster
scene needs a silent scene after it, or it must be the last narrated scene
before the closing card.

## 4. Pipeline defects found and fixed during this video

All four are fixed in the recorder, not worked around in the scenario.

1. **Anonymous scenes kept the admin bar.** The public `goto` used a URL with a
   fragment (`…/map/cape-scott-trail/#waymark-shortcode-810d6e`), the same URL
   the authenticated pre-warm had already loaded. `page.goto()` to a
   fragment-only change is a same-document navigation: no request, so the
   cleared cookies never reached the document and every public scene was filmed
   logged in. The recorder now navigates to the bare URL first and restores the
   hash in-page, and it fails the take if an anonymous scene still shows
   `#wpadminbar`. The card pre-warm also loads the page in that page's own
   cookie state, so no authenticated document is visible during the reload.
2. **The poster replay lost the scene highlight.** A missing or still
   transparent outline was treated as success, so the poster shipped without the
   green ring the video had. It is now a hard failure when the scene expects a
   highlight, and the timeline records `expected`, `highlightOpacity` and
   `highlightRect`.
3. **`trackHighlight` could stall a take.** It passed `:has-text()` to
   `document.querySelector`, which throws inside the animation loop. Targets now
   resolve through a Playwright locator with a hard timeout.
4. **A zero-height anchor cannot be scrolled to.** The `depth` scene targeted
   `#waymark-elevation-810d6e`, which has zero height, so the visibility check
   judged it on screen and never scrolled; the export control stayed below the
   fold. It now targets `.waymark-meta-export_data` with `block: "end"`, which
   puts the chart and the export block in one frame.

## 5. Narration stamp and silent beats

Adding a silent scene to the scenario changed the narration file, and the
recorder refused the take with `Narration audio is stale: the narration file
changed since it was generated.` The stamp compared a raw file hash as well as
the spoken text. The spoken-text hash is authoritative — it ignores silent
scenes — so the file hash is now recorded for diagnostics only. Adding or
removing a beat without changing a word no longer invalidates cached audio.

## 6. "live" as a verb and as an adjective

The original shortcode line ended "from editing to live" — the adjective
(/laɪv/), which Flux reads as the verb (/lɪv/). The lexicon matches whole words,
not senses, so an IPA entry would have broken the four legitimate verb uses
across other videos ("Basemaps live in Settings"). The line was reworded to
"from editing the Map to the page your visitors read." Phrase-level matching
(`going live`, `from editing to live`) is the alternative if the idiom is wanted.

## 7. Known cosmetic points

- The poster's crop is the map's 16:9 box, so the Leaflet attribution is outside
  it. The same is true of the `markers` poster.
- The poster's highlight ring is flush with the top edge of the frame: the whole
  6 px band is present, but the rounded corners are shaved. Moving the map down
  before capture would give it a margin.
- The layers panel has a 300 px internal scroll cap, so its last row is always
  clipped by the product, not by the outline.
- Articulation warnings for `depth` (213.6 wpm) and `shortcode` (227.5 wpm) are
  inherent to the single continuous Deepgram performance; the overall pace is
  178 wpm.

## 8. Ideas not taken

- Pre-warming the next admin page in the background would save HTTP time only,
  not the parse and execute cost that dominates the Editor load.
- Dropping the Editor scene would remove the long gap but also the payoff: the
  public Map is the hook, the Editor is where the work happens.
- A fixed `audioOffset` on the Editor scene would hide the load on a quiet
  machine and speak over a blank panel on a busy one.
