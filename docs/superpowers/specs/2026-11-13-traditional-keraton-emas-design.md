# Traditional template: "Keraton Emas" redesign

Date: 2026-11-13. Status: draft for approval.

## Intent

WUMY is getting ready for its first customers, who sign up and pay on their own. The owner sees the templates as the main marketing lever, and the six current templates feel generic: "not like a real digital invitation". Compared with established Indonesian services (reference: viding.co theme 10), what is missing is rich, theme-specific background art and ornaments, and motion.

This work turns the **Traditional** template into the first "finished" template, and builds the shared motion pieces and ornament slots the other five templates will reuse later.

Direction chosen from the mockups (https://claude.ai/artifact/H3TkuxCrQVd43hkfH6dCQj): **A. Keraton Emas**. Dark wood ground, a slowly drifting kawung batik pattern, floating gold dust, a glowing gunungan, gebyok doors that swing open, and content that appears in sequence.

## Goals

- When a guest opens the link, the Traditional invitation should feel crafted and alive, on par with established Indonesian digital invitation services.
- Build shared motion building blocks in `src/templates/shared/` that the other templates can adopt one by one.
- Give the template clear **ornament slots** (corner frame, section divider, heading ornament, cover centrepiece, background pattern). Each slot uses a code-drawn SVG now, and can be swapped for a bought image asset later without touching the layout.
- Add a catalog thumbnail `public/templates/traditional.png`. It is currently missing, so the image is broken on the catalog and order pages.

## Non-goals

- Redesigning the other five templates. They come later, one at a time, using the same pieces.
- Changing invitation content, the editor, the data model, or the database. Sections stay the same: cover, opening, couple, countdown, events, story, gallery, gifts, RSVP, closing.
- Buying or commissioning image assets. There are no assets yet; this work only prepares the slots.
- The missing `romantic.png` thumbnail. It is a separate fix, noted here so it isn't forgotten.

## Anti-goals

These would make the work a failure even if it technically works:

- A heavy page. Guests open invitations from WhatsApp on mid-range Android phones. The page must not become noticeably slower to open or janky while scrolling.
- Motion that gets in the way: long blocking intros, motion that makes text hard to read, or effects that can't be turned off.
- Breaking accessibility that exists today: reduced-motion support, focus moving to the content after opening, readable contrast, and `aria-hidden` on decorative art.
- Content that stays invisible if JavaScript or IntersectionObserver fails. Everything must still end up visible.

## Constraints

- Stack: React + Tailwind in `src/templates/traditional/`. Rendered by `InvitationTemplateRenderer` on the public page `/<slug>`, in the editor preview (`embedded`, `startOpened`), and in the demo pages.
- **No new animation library.** Use CSS animations and transitions, plus one small `<canvas>` for particles. (Owner's call, see Approaches.)
- Respect `prefers-reduced-motion`: no drifting, particles, or looping animation. The doors open instantly (`useOpenGate` already handles this).
- Particles and looping animations pause when off-screen or when the tab is hidden, and are capped (for example about 40 particles, device-pixel ratio at most 2).
- The template ID stays `traditional`. No production customer uses it yet, so changing its look in place is safe (owner confirmed).
- The editor preview (`embedded`) must stay usable: no fixed-position effects that escape the preview frame, and no animation that fights the editor's live updates.
- Developer-facing text in English. Guest-facing labels come from `src/templates/labels.ts` (Indonesian and English), as today.

## Approaches

1. **Rework the existing Traditional template in place.** Picked. Keeps the ID, sections, editor, data, and tests. The only risk is that existing invitations change look, and there are none in production.
2. New "Keraton Emas" template next to the old one. Safer for existing invitations, but it adds a seventh catalog entry that is the generic look we want to drop, and duplicates code. Rejected.

Motion technique: CSS plus a small canvas (picked) versus GSAP or Framer Motion. A library adds page weight for effects CSS already covers, and the page has to stay light for WhatsApp traffic.

## Design

### Shared pieces (`src/templates/shared/`)

- **`ParticleField`**: a decorative `<canvas>` (aria-hidden, pointer-events none) that draws gently floating particles. Props: kind (gold dust now; petals or jasmine for later templates), density, colour. It pauses when off-screen or the tab is hidden, sizes to its container (works in the embedded preview), and renders nothing under reduced motion.
- **`DriftPattern`**: a full-bleed background layer that repeats an SVG pattern and drifts it slowly with a CSS transform. Renders static under reduced motion.
- **Staggered reveal**: extend the existing `useReveal` / `Section` pattern so children can appear in sequence (a small delay per child), not just the section as a whole. Content is visible by default if the observer never fires (no permanent `opacity: 0`).
- Reusable keyframes (glow, gentle float, sway, slow rotate) live in one place, so the templates don't each define their own. They can go in Tailwind theme extensions or a small CSS file imported by the shared index; the builder decides which.

### Traditional template

- **Palette and type**: keep the current family (dark wood `#2b1d14`, gold `#c9a45c`, Cinzel and Cormorant Garamond). Deepen it with a warm gold gradient for buttons and highlights, and add a script face for the couple's names on the cover and opening, as in the mockup. The builder picks the script face from Google Fonts; it must render Indonesian names well.
- **Ornament slots** (`ornaments.tsx`): `CornerFrame`, `SectionDivider`, `HeadingOrnament`, `CoverCentrepiece` (rotating mandala/kawung medallion), `Gunungan`, `KawungPattern`. Each is an SVG component now. A later swap to an image asset is a change inside the slot only.
- **Cover**: two gebyok door panels with carved-frame detail and the kawung pattern swing open in 3D (`rotateY`) when the guest taps *Buka undangan*. The medallion turns slowly behind the names, and gold dust floats over everything. The guest name ("Kepada Yth.") stays as today.
- **After opening**: the opening section's gunungan glows and floats, and its lines (kicker, names, date, place) appear one after another. The kawung background keeps drifting behind the whole invitation, and the gold dust keeps going at a lower density.
- **Sections**: each section title gets the heading ornament and the new divider. Section content reveals in a stagger on scroll. Cards (events, gifts, RSVP) get corner-frame ornaments.
- **Timing**: the door open replaces the current 900 ms slide (`OPEN_ANIMATION_MS`); the target is about 1.2–1.4 s. Content starts appearing as the doors finish. The constant is shared, so check the other templates if it changes.

### Catalog thumbnail

- Add `public/templates/traditional.png`, the same size and framing as the existing thumbnails (for example `minimal.png`), showing the new cover. A screenshot of the demo page is fine.

### Testing

- Unit tests for any new pure logic (particle step and recycle bounds, stagger delay computation, reduced-motion branches), next to the source, as the repo does for `countdown.ts` and `motion.ts`.
- Existing tests, type check, and lint stay green.
- Manual check on dev.wumy.my.id on a real mid-range Android phone via a WhatsApp link: opening smoothness, scroll smoothness, reduced-motion setting, and the editor preview.

## Left to the builder

- Exact SVG artwork for the ornaments, within the Keraton Emas direction.
- Where the shared keyframes live (Tailwind config versus a CSS file).
- Exact timings, densities, and opacities, within the constraints above.
- The script font choice.
