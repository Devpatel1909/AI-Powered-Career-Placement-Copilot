# Career Copilot / Design Direction

## Brief

Career Copilot is a generative career intelligence workspace for students and early-career professionals. The landing page must turn uncertainty into a clear invitation to inspect the user's own evidence, then hand off to the existing product workspace.

## Concept Card

- **Idea:** Your career is a signal system, not a score.
- **Metaphor:** A radar room that triangulates experience, intent, and the market.
- **Signature:** Pick a target role and watch the signal map update its readiness, tension, and next proof point.
- **Emotion:** Curious, precise, slightly electric.
- **Motion verb:** Trace, then resolve.
- **Screenshot:** The hero's orbit map with `experience`, `intent`, and `market` converging on `signal`.

## System

- **Palette:** ink `#10120f`, paper `#f3f0e8`, acid `#c8ff52`, coral `#ff7b5c`, sky `#72d6ff`, line `#c9c8bd`.
- **Type:** Space Grotesk for display and UI, Georgia italic for the human voice. Google Fonts are currently linked from `index.html`.
- **Grid:** 12-column desktop grid with generous left alignment; the signal map is the visual anchor. Mobile composes the map below the role picker.
- **Shape:** Mostly square with one 2px radius. Rules are thin and functional.
- **Motion:** Small orbit drift at rest, role selection resolves with opacity and transform. Reduced motion keeps the map legible and static.

## Assumptions

- Product name is Career Copilot; no final brand identity or user photography was supplied.
- Product metrics and role examples in the live preview are illustrative UI data, not claims of adoption or model accuracy.
- Existing application routes remain the authenticated workspace and are not replaced.
- Role examples and readiness scores are illustrative UI states, not employment guarantees.
- The redesigned landing page adds a functional mobile menu, clearer section headings, stronger
  focus and hover states, and crawler metadata while preserving the current React/Vite stack.

## Genericness test

The first direction was intentionally moved away from a centered SaaS hero, three equal feature cards, and blue-purple AI gradients. The product's own resume/JD/RAG pipeline supplies the content and the signal map supplies the signature interaction.