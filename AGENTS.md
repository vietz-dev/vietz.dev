# vietz.dev

Personal portfolio of Justin Vietz. Readers are recruiters, hiring managers and collaborators, so every page describes a real person.

## Guardrails

- **Facts about Justin come only from Justin.** Roles, dates, employers, skills, projects and bio text must be given by the user or already be on the site. When a fact is missing, ask.
- **Profile facts are duplicated with no shared source.** When one changes, update every copy in the same change:
  - `src/pages/cv.astro`: experience and skills
  - `src/pages/index.astro`: quick facts and intro
  - `public/llms.txt`: AI-readable profile that LLMs use to describe Justin
  - `src/pages/impressum.astro`: name and address
- **Legal pages follow German law.** The site is English; `impressum.astro` and `datenschutz.astro` are German on purpose. Any new third-party request (font, script, embed, analytics, host) must be declared in `datenschutz.astro`, so self-host where possible. Confirm legal wording with the user before changing it.

## Working with Astro

- **Check Astro APIs against current docs before writing them.** This is Astro 7; models often suggest older patterns (content collections especially). Use the Astro Docs MCP server (`https://mcp.docs.astro.build/mcp`, configured in `.mcp.json`) or https://docs.astro.build.
- **Install through the CLI.** Official integrations: `pnpm astro add <name>`. Other packages: `pnpm add <name>`. This keeps `package.json` and `astro.config.mjs` consistent.
- **The dev server runs detached for agents.** `pnpm dev` returns immediately; the URL and PID are in `.astro/dev.json`, and `GET /_astro/status` returns `{"ok": true}` when it is ready.
