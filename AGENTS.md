# Morass Contributor Notes

Morass is the reusable UI foundation intended to serve Webbery first and become a public React framework later.

- Keep public exports stable and typed from `src/index.ts`.
- Prefer small composable primitives over app-specific components.
- Prefix CSS classes with `m-` and expose customization through CSS variables.
- Do not add Webbery product copy or domain behavior to this repo.
- Run `npm run check` before publishing or opening a PR.
- `.repo/contract.json` declares the existing Node/TypeScript checks, CI contexts,
  and release boundary. `npm run contract:check` validates it and the bundled
  policy offline; it never runs declared commands or retrieves schemas.
- Keep `.repo/policy/` byte-identical to its reviewed source and digest lock.
  The pin uses reviewed merged source; source availability is not default fleet
  policy adoption or current fleet health.
  Update the contract, public policy data, and lock together through review.
- Owner and risk declarations are proposals with sources in `.repo/README.md`,
  not proof of approved ownership, access, live enforcement, or waivers. Preserve
  the vendored public lint workflow and its July 7 ADR explanation.
