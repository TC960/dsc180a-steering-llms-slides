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

## Figures to add

These slides are text-only until the figure arrives. Drop the PNG into `img/` and add it to the slide.

| Figure | Slide | Owner |
| --- | --- | --- |
| `fig5_layer_geometry.png` | 03 Emotion Vector Geometry, slide 4 (`j4`) | Jiahe |
| `fig1_cosine_heatmap_layer23.png`, `fig3_pca_emotion_vectors_layer23.png` (higher-res originals; current copies are ~520 px) | `j2`, `j3` | Jiahe |
| `context_tokens.png` | 04 Context and Token Position, slide 4 (`dn4`) | Daniel |
