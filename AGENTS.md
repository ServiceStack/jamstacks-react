# jamstacks

Shared React library for Jamstacks templates. Keep page content and framework-specific integrations in the consuming templates.

- Work on the current branch; preserve existing work. Commit, push, publish or deploy only when requested.
- Preserve React 18.2 and 19 compatibility. React and React DOM are peers, not bundled runtime dependencies.
- Ship ESM and TypeScript declarations through the explicit package exports. Retain `'use client'` in interactive entry points; keep `jamstacks/server` free of client imports.
- Do not require Tailwind or Next.js. Encapsulate component styles inline; do not require a global stylesheet. Keep `jamstacks-` class hooks and `--jamstacks-` customization tokens.
- Theme initialization must remain safe during SSR/hydration and when storage is unavailable. Keep the head script and provider contracts aligned.
- Run `npm run typecheck`, `npm test`, and `npm pack --dry-run`. New interactive behavior needs meaningful browser coverage. When changing exports or packaging, install a packed archive into a separate consumer and check it there.
- Use `npm ci` for reproducible installs. Do not commit generated `dist/`, dependencies, package archives or test reports.
