# Emotion Concepts in Qwen3: Q1 presentation

```
python3 -m http.server 8000
```

Open http://localhost:8000.

| Key | Action |
| --- | --- |
| → / Space / click | next slide |
| ← / Shift+Space / click left edge | previous slide |
| `f` | fullscreen |
| `s` | speaker view (notes, next slide, timer) |
| `r` | replay the current slide's animation |
| number + Enter | jump to slide |
| Home / End | first / last slide |

Slides live in `index.html`, one `<section>` each. Speaker notes are the `<aside>` inside each section.
Figures are in `img/`, animations in `video/`.
Slides marked `data-skip` (e.g. the LoRA slide, `m7`) are hidden; remove the attribute to show them again.
