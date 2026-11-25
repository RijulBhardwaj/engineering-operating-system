# Wan2GP low-VRAM diffusion video test (2026-11-25)

Tests whether local diffusion-model video generation is genuinely feasible on this machine's
RTX 3050 Laptop GPU (6GB VRAM, confirmed via `nvidia-smi`), as the unexplored alternative to the
three failed deterministic-rendering attempts at a "moving painting" painterly look (SVG filters,
Blender Grease Pencil -- see `../blender-grease-pencil/README.md` -- and the animated-short-film
skill's own design). All three failed the same way: code-driven rendering cannot reproduce
diffusion-model texture (brush-stroke variance, organic silhouette noise).

## What was tested

[Wan2GP](https://github.com/deepbeepmeep/Wan2GP) (`deepbeepmeep/Wan2GP`), a "GPU poor" fork/wrapper
around Wan 2.1/2.2 with a custom memory-management layer (`mmgp`) that streams model weights
block-by-block into VRAM instead of loading the whole model at once. Chosen over LTX-Video and
AnimateDiff after a real web-research pass (not assumption): Wan2GP's own docs state a genuine
6GB floor for its smallest model (Wan 2.1 Text2Video 1.3B); LTX-Video's *original* 2B model has a
similar community-reported 6GB floor but the current LTX-2 line officially needs 32GB+; AnimateDiff
(SD1.5) has mixed 6-24GB reports depending on source and wasn't tested given Wan2GP's more
concrete, repo-documented number.

## Result: it runs, real VRAM budget confirmed

- **Model**: Wan2.1 Text2Video 1.3B (`t2v_1.3B`), the lightest model in the family, fp16/bf16
  weights (`wan2.1_text2video_1.3B_mbf16.safetensors`, 2.7GB) + VAE (485MB) + umt5-xxl text
  encoder (int8-quantized, ~6.3GB on disk) + a CLIP/xlm-roberta checkpoint (2.3GB) the pipeline
  also pulls in -- all downloaded automatically on first run, ~12GB total.
- **Install**: `git clone`, Python venv (not conda -- none installed), PyTorch 2.10.0+cu130
  (the version Wan2GP's own install docs recommend for RTX 30XX-50XX; an initial attempt with
  PyTorch 2.5.1+cu121 installed fine and loaded the full model but failed at the first denoising
  step with `TypeError: disable() got an unexpected keyword argument 'reason'` -- a real
  `torch._dynamo.disable()` API mismatch between Wan2GP's startup shim and anything older than the
  torch version it's built against. Switching to the documented 2.10/cu130 combo fixed it cleanly;
  this is a genuine version-pinning requirement, not a workaround).
- **Headless run**: `python wgp.py --process test_painterly_settings.json --output-dir ./test_output`
  (CLI queue mode, no Gradio UI needed) with the project's own matching test prompt: *"a seed
  breaking through soil toward sunlight, painterly brushwork, flat color planes"*, 832x480,
  33 frames, 20 inference steps, seed 42.
- **Real VRAM usage**: peaked around **680-850MB** during the denoising loop (`nvidia-smi` polled
  live), nowhere near the 6GB ceiling -- the model-poor block-streaming architecture (loading/
  unloading individual transformer and text-encoder blocks one at a time, visible in the verbose
  log) is doing exactly what it claims. This machine's 6GB card has large headroom for this
  specific 1.3B model.
- **Real generation time**: **5m 23s** total for the denoising + VAE decode of a 33-frame,
  832x480, 20-step clip (plus ~13 minutes one-time cost the first run only, for downloading and
  loading ~12GB of model weights from HuggingFace -- not part of steady-state generation time).
- **Output**: `wan2gp-painterly-test.mp4` in this folder -- real, valid h264 video, 832x480,
  16fps, 2.06s (33 frames), confirmed via `ffprobe`.

## Honest visual verdict: VRAM gap closed, style gap is NOT

Extracted frames (first/middle/last) show a coherent, prompt-following diffusion output: soil
cracks open, a white seed/sprout shape grows across frames, consistent lighting and soft
anti-aliased color blending -- this is a real diffusion result, not a vector render pretending to
be one. But the actual look is **flat, clean vector/cutout-illustration style** (hard shape edges,
flat color fills, a stippled-texture grass band) -- not painterly brushwork. No visible
brush-stroke variance or organic paint texture of the kind the prior deterministic attempts were
rejected for lacking.

This is a different, more specific finding than "diffusion can't run here": **the hardware
constraint is solved** (6GB is genuinely sufficient, with room to spare, for Wan2.1 1.3B) **but
the model/prompt combination available at this VRAM budget does not produce the painterly look
this genre needs.** The larger Wan models (14B) that might render a more painting-like style
need 12GB+ per Wan2GP's own docs -- out of reach on this card. Whether a different prompt, a
LoRA, or a different sampler/style preset on the *same* 1.3B model gets closer to painterly was
not tested in this pass (out of scope -- the brief asked to establish feasibility, not exhaust
every style knob).

## Bottom line

A genuine local, free, zero-cloud-cost path to run short diffusion video generation on this
machine's 6GB GPU now exists and is verified working -- this was previously an open question,
now answered yes. It is **not yet a drop-in fix for the painterly-short-film gap**: more
prompt/style iteration on this same install would be the next step for that specific goal, not
a hardware blocker. See `harness/video-generation/animation-styles.md` for how this is folded
into the style-routing doc (as a second content engine for non-accuracy-critical stylized video,
explicitly separate from the deterministic Manim/Three.js/Remotion pipeline CAT-prep content
still uses).

## Reproduction

```bash
git clone https://github.com/deepbeepmeep/Wan2GP.git
cd Wan2GP
python -m venv .venv
.venv/Scripts/python.exe -m pip install torch==2.10.0 torchvision==0.25.0 torchaudio==2.10.0 --index-url https://download.pytorch.org/whl/cu130
.venv/Scripts/python.exe -m pip install -r requirements.txt
# requirements.txt pulls in a CPU-only torch as a transitive dep on some package versions --
# reinstall the CUDA build again after this step if `torch.cuda.is_available()` comes back False.
.venv/Scripts/python.exe -m pip install torch==2.10.0 torchvision==0.25.0 torchaudio==2.10.0 --index-url https://download.pytorch.org/whl/cu130
.venv/Scripts/python.exe wgp.py --process ../test_painterly_settings.json --output-dir ./test_output
```
