# Traditional "Keraton Emas" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `traditional` invitation template in the "Keraton Emas" direction (gebyok doors, drifting kawung, gold dust, glowing gunungan, staggered reveals) and add shared motion pieces the other templates can reuse.

**Architecture:** Pure motion logic (particle physics, stagger delays) lives in `src/templates/shared/*.ts` with Vitest tests. Thin React components (`ParticleField`, `DriftPattern`) wrap that logic. Shared keyframes go in `src/styles.css`. The Traditional template keeps its ID, sections, and data flow; only `index.tsx`, `parts.tsx`, `sections.tsx`, and `ornaments.tsx` change.

**Tech Stack:** React 19, TanStack Start, Tailwind v4 (`src/styles.css`), Vitest (node environment, `src/**/*.test.ts` only).

**Spec:** `docs/superpowers/specs/2026-11-13-traditional-keraton-emas-design.md`

## Global Constraints

- No new runtime dependency (no GSAP, Framer Motion, etc.). CSS animations plus one `<canvas>`.
- Under `prefers-reduced-motion: reduce`: no drift, no particles, no looping animation; doors open instantly; all content visible.
- Particles: at most 40 on the cover and 18 after opening; device-pixel ratio capped at 2; the loop pauses when the canvas is off-screen or `document.hidden`.
- Content must never stay hidden: anything revealed by an observer is visible if the observer is unavailable (existing `useReveal` behaviour).
- Decorative SVG and canvas elements get `aria-hidden` and `pointer-events-none`.
- `embedded` mode (editor preview): use `absolute` instead of `fixed` for every full-screen layer, as the cover already does.
- Template ID stays `traditional`. Other templates must look and time exactly as before.
- Commit directly on `dev` with Conventional Commits; run `npx tsc --noEmit`, `npm test`, `npm run lint` before each push. No emoji in commit messages.

## Review Focus

1. Guest with reduced motion enabled: cover opens instantly, no canvas is mounted, every section is visible without scrolling tricks. Covered by `particles.test.ts` (`particleCount` returns 0) and the manual check in Task 6.
2. Editor preview (`embedded`, `startOpened`): no door animation runs, no layer escapes the preview frame, particles size to the preview container. Manual check in Task 6.
3. Very long names (for example `Raden Ajeng Kusumawardhani`) in the script font on a 360 px wide phone: names wrap, never overflow the doors or the screen. Manual check in Task 5 with the demo URL query `?a=`/`?b=` if supported, otherwise the editor.
4. Couple without greeting and quote: `Opening` returns `null` today; the gunungan and stagger must not leave an empty gap. Manual check in Task 5.
5. Opening the gate twice quickly (double tap): `useOpenGate` ignores the second tap during the longer 1300 ms animation. Existing guard (`if (open || opening) return`); verify manually in Task 4.

---

### Task 1: Shared keyframes and per-template open duration

**Files:**
- Modify: `src/styles.css` (add keyframes and utilities near the existing reduced-motion block, around line 654)
- Modify: `src/templates/shared/useOpenGate.ts`

**Interfaces:**
- Produces: CSS utilities `animate-wumy-drift`, `animate-wumy-glow`, `animate-wumy-float`, `animate-wumy-spin`; all disabled under reduced motion.
- Produces: `useOpenGate(opts: { startOpened?: boolean; durationMs?: number })`. `durationMs` defaults to `OPEN_ANIMATION_MS` (900, unchanged).

- [ ] **Step 1:** Add keyframes and utility classes in `src/styles.css`:
  - `wumy-drift`: translate from `0,0` to `48px,48px`, 48 s linear infinite (pattern tile is 48 px, so the loop is seamless).
  - `wumy-glow`: `filter: drop-shadow(0 0 2px rgb(240 200 110 / .3))` to `drop-shadow(0 0 10px rgb(240 200 110 / .85))` and back, 3.6 s ease-in-out infinite.
  - `wumy-float`: `translateY(0)` to `translateY(-6px)` and back, 6 s ease-in-out infinite.
  - `wumy-spin`: rotate 360 deg, 80 s linear infinite.
  - Add the four `.animate-wumy-*` classes to the existing `@media (prefers-reduced-motion: reduce)` list.
- [ ] **Step 2:** Add the optional `durationMs` to `useOpenGate` and use it for the timeout instead of the constant.
- [ ] **Step 3:** Run `npx tsc --noEmit && npm test && npm run lint`. Expected: pass, 0 errors.
- [ ] **Step 4:** Commit: `feat(templates): add shared motion keyframes and configurable open duration`.

### Task 2: Particle logic and `ParticleField`

**Files:**
- Create: `src/templates/shared/particles.ts`
- Create: `src/templates/shared/particles.test.ts`
- Create: `src/templates/shared/ParticleField.tsx`
- Modify: `src/templates/shared/index.ts` (export the new names)

**Interfaces:**
- Produces (`particles.ts`):
  - `type Particle = { x: number; y: number; r: number; vx: number; vy: number; phase: number }`
  - `type ParticleKind = "gold-dust"` (union, so later templates add `"petal"`, `"jasmine"`)
  - `particleCount(kind: ParticleKind, density: "cover" | "ambient", reducedMotion: boolean): number` returns 40 / 18, or 0 when `reducedMotion`.
  - `spawnParticle(kind: ParticleKind, width: number, height: number, rand: () => number, initial: boolean): Particle`. Gold dust rises: `vy` in [-0.33, -0.08], `r` in [0.4, 2.0]; `initial` places it anywhere in the box, otherwise just below the bottom edge (`y = height + 10`).
  - `stepParticle(p: Particle, width: number, height: number, rand: () => number, kind: ParticleKind): Particle` moves by `vx + sin(phase) * 0.3`, `vy`; advances `phase` by 0.02; returns a fresh `spawnParticle(..., false)` once `y < -10`.
- Produces (`ParticleField.tsx`): `ParticleField({ kind, density, color, className }: { kind: ParticleKind; density: "cover" | "ambient"; color: string; className?: string })`. Renders an `aria-hidden` absolutely positioned `<canvas>` filling its parent; renders `null` when `prefersReducedMotion()`.

- [ ] **Step 1: Write failing tests** in `particles.test.ts` with a seeded `rand` (for example a linear congruential generator):
  - `particleCount("gold-dust", "cover", false) === 40`, `("gold-dust", "ambient", false) === 18`, `(…, true) === 0`.
  - `spawnParticle` with `initial: true` stays inside `[0,width] x [0,height]`; with `initial: false` has `y === height + 10`; `vy` always in `[-0.33, -0.08]`, `r` in `[0.4, 2.0]` over 1000 samples.
  - `stepParticle` moves `y` by exactly `vy`, and a particle with `y = -11` after the step is replaced by one with `y === height + 10`.
- [ ] **Step 2:** Run `npx vitest run src/templates/shared/particles.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement `particles.ts` with the signatures above.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5:** Implement `ParticleField.tsx`: size the canvas from `clientWidth/clientHeight` with `ResizeObserver` and DPR capped at 2; one `requestAnimationFrame` loop; skip drawing while an `IntersectionObserver` reports off-screen or `document.hidden`; cancel the frame and disconnect observers on unmount. Draw each particle as a circle with alpha `0.45 + sin(phase * 2) * 0.35` in `color`.
- [ ] **Step 6:** Export from `index.ts`; run `npx tsc --noEmit && npm test && npm run lint`. Expected: pass.
- [ ] **Step 7:** Commit: `feat(templates): add shared particle field`.

### Task 3: `DriftPattern` and staggered reveal

**Files:**
- Create: `src/templates/shared/stagger.ts`
- Create: `src/templates/shared/stagger.test.ts`
- Create: `src/templates/shared/DriftPattern.tsx`
- Modify: `src/templates/shared/index.ts`

**Interfaces:**
- Produces: `staggerDelayMs(index: number, opts?: { baseMs?: number; stepMs?: number; maxMs?: number }): number` = `min(baseMs + index * stepMs, maxMs)`, defaults `baseMs = 0`, `stepMs = 120`, `maxMs = 900`; negative or non-finite `index` is treated as 0.
- Produces: `DriftPattern({ children, className }: { children: React.ReactNode; className?: string })`. A decorative `aria-hidden` layer, `absolute -inset-12`, with class `animate-wumy-drift`. `children` is the SVG `<pattern>`-filled element; the tile must be 48 px for a seamless loop.

- [ ] **Step 1: Write failing tests** in `stagger.test.ts`: `staggerDelayMs(0) === 0`, `(3) === 360`, `(50) === 900`, `(2, { baseMs: 1000, stepMs: 200, maxMs: 2000 }) === 1400`, `(-1) === 0`, `(NaN) === 0`.
- [ ] **Step 2:** Run `npx vitest run src/templates/shared/stagger.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `staggerDelayMs` and `DriftPattern`.
- [ ] **Step 4:** Run tests, then `npx tsc --noEmit && npm run lint`. Expected: pass.
- [ ] **Step 5:** Commit: `feat(templates): add drift pattern and stagger helper`.

### Task 4: Keraton Emas ornaments and cover

**Files:**
- Modify: `src/templates/traditional/ornaments.tsx`
- Modify: `src/templates/traditional/index.tsx`
- Modify: `src/templates/traditional/parts.tsx` (palette tokens and `FONTS_HREF`)

**Interfaces:**
- Consumes: `ParticleField`, `DriftPattern`, `useOpenGate({ startOpened, durationMs })` from Tasks 1–3.
- Produces (`ornaments.tsx`, all `aria-hidden`, gold `#c9a45c` / highlight `#e8c674`):
  - `KawungPattern({ id }: { id: string })`: an `<svg>` filling its box with a 48 px kawung `<pattern>` at stroke opacity 0.16.
  - `CoverMedallion({ className })`: eight-petal rosette inside two rings (dashed inner ring).
  - `GebyokPanel({ side }: { side: "left" | "right" })`: carved door face (inner frame, kawung field, vertical `SideFlourish`).
  - `HeadingOrnament({ className })`: small gunungan-crown flourish above section titles.
  - `SectionDivider({ className })`: replaces `DiamondDivider` usages (keep the export name `DiamondDivider` as an alias so nothing else breaks).
  - `CornerFrame` replaces `Corner`; `Corners` keeps its name and API.
  - Keep `Gunungan` and `SideFlourish`.
- Produces (`parts.tsx`): `T.script` (script font class), `T.goldButton` (gradient `linear-gradient(#e9c977,#b98c3a)`, text `#2b1d14`); `T.button` uses it. `FONTS_HREF` adds the script face (builder picks from Google Fonts, for example Great Vibes; check that `Ā`, `é`, and apostrophes render).
- `TraditionalInvitation` constant: `TRADITIONAL_OPEN_MS = 1300`, passed as `durationMs`.

- [ ] **Step 1:** Implement the ornament components above.
- [ ] **Step 2:** Rebuild `Cover`/`GatePanel` in `index.tsx`: two `GebyokPanel` doors (`transform-origin` at the outer edge) that rotate to `perspective(900px) rotateY(∓100deg)` over 1300 ms while `opening`; `CoverMedallion` with `animate-wumy-spin` behind the names; names in `T.script`; `ParticleField kind="gold-dust" density="cover"` above the doors; whole cover `absolute` when `embedded`, else `fixed` (unchanged).
- [ ] **Step 3:** Wrap `<main>` content with a `DriftPattern` holding `KawungPattern`, and an ambient `ParticleField density="ambient"`, both rendered only when `open`.
- [ ] **Step 4:** Run `npx tsc --noEmit && npm test && npm run lint`. Expected: pass.
- [ ] **Step 5:** Run the dev server with a local `.env` (dev Supabase keys) and open `/demo/traditional`: doors swing open, double tap during the animation does nothing (Review Focus 5), reduced motion (DevTools rendering emulation) opens instantly with no canvas in the DOM.
- [ ] **Step 6:** Commit: `feat(traditional): Keraton Emas cover with gebyok doors and gold dust`.

### Task 5: Sections: ornaments and staggered reveals

**Files:**
- Modify: `src/templates/traditional/parts.tsx` (`Section`, `SectionTitle`)
- Modify: `src/templates/traditional/sections.tsx`

**Interfaces:**
- Consumes: `staggerDelayMs`, `HeadingOrnament`, `SectionDivider`, `Corners`, `T.script`.
- Produces: `Section` gains `stagger?: boolean`. When true, each direct child gets `transition-delay: staggerDelayMs(i)` and the same fade-and-lift as the section (visible state is the resting state). `RevealItem` is not needed; apply the delay with `React.Children.map` and a wrapping `<div>`.

- [ ] **Step 1:** `SectionTitle`: `HeadingOrnament` above the kicker, `SectionDivider` below the title.
- [ ] **Step 2:** `Opening`: gunungan gets `animate-wumy-glow animate-wumy-float` (combine via a wrapper, since both set different properties: glow on the SVG, float on the wrapper); `Section stagger`. Keep the `return null` when there is no greeting and no quote, and check that no empty gap appears (Review Focus 4).
- [ ] **Step 3:** `Couple`, `Events`, `Gifts`, `Rsvp`, `Closing`: use `Section stagger`; cards keep `Corners` (now `CornerFrame`); `Couple` names stay Cinzel, cover/opening names use `T.script`.
- [ ] **Step 4:** Run `npx tsc --noEmit && npm test && npm run lint`. Expected: pass.
- [ ] **Step 5:** In the demo and the editor, check a 360 px viewport with long names (Review Focus 3) and an invitation without greeting/quote (Review Focus 4).
- [ ] **Step 6:** Commit: `feat(traditional): ornamented section titles and staggered reveals`.

### Task 6: Catalog thumbnail and final checks

**Files:**
- Create: `public/templates/traditional.png` (780 x 1560 RGB PNG, same as `minimal.png`)

- [ ] **Step 1:** Take a 390 x 780 viewport screenshot at device scale factor 2 of `/demo/traditional` showing the closed cover. Without a local browser: `npx playwright@1.48.2 install chromium` into the scratchpad and `npx playwright@1.48.2 screenshot --viewport-size=390,780 --device-scale-factor=2 http://localhost:5173/demo/traditional out.png`; if that is not possible, ask the owner for a phone screenshot of dev.wumy.my.id.
- [ ] **Step 2:** Verify with `file public/templates/traditional.png`. Expected: `PNG image data, 780 x 1560`.
- [ ] **Step 3:** Editor preview check (Review Focus 2): open the editor for a Traditional invitation; no door animation, no layer outside the preview, particles sized to the preview.
- [ ] **Step 4:** Run `npx tsc --noEmit && npm test && npm run lint`, then commit `feat(traditional): add catalog thumbnail` and push `dev`.
- [ ] **Step 5:** Ask the owner to check on a mid-range Android phone through a WhatsApp link on dev.wumy.my.id: opening smoothness, scroll smoothness, reduced-motion setting.
