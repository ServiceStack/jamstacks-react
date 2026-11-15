# jamstacks

Shared React components for Jamstacks templates. The initial library provides a dark-mode switch and a shared theme API. It works with React 18.2+ and React 19, including Next.js App Router and static exports, with no Next.js or Tailwind runtime dependency.

## Install in a template

```sh
npm install jamstacks
```

For local development, build and install a release archive:

```sh
# In this repository
npm ci
npm pack

# In the consuming React template (replace with the archive's actual path)
npm install /absolute/path/to/jamstacks-0.1.0.tgz
```

Consumers can also install a pinned Git commit:

```sh
npm install github:ServiceStack/jamstacks-react#COMMIT_SHA
```

The Git installation's `prepare` step builds the library. Prefer a versioned npm release or a pinned Git commit for shared templates. A `file:` folder dependency is useful locally, but a packed archive tests the same files an npm release will ship and avoids linked duplicate React installations.

The package ships ESM JavaScript, TypeScript declarations, source maps with embedded sources, and component styles encapsulated inline. React and React DOM are peer dependencies supplied by the template.

## Basic React usage

```tsx
import { DarkModeToggle, ThemeProvider } from 'jamstacks';

export default function App() {
  return (
    <ThemeProvider>
      <header><DarkModeToggle /></header>
      <main>Your template content</main>
    </ThemeProvider>
  );
}
```

Use one provider per document and place all switches inside it. Multiple switches share the same state. `DarkModeToggle` is a native keyboard-accessible button with `role="switch"`, a default accessible name of "Dark mode", and a live `aria-checked` value. It supports a forwarded button ref and ordinary button props, including `className`, `style`, `disabled`, `aria-label`, and `onClick`. Calling `event.preventDefault()` in `onClick` cancels the theme change. It stays disabled until hydration finishes so a click cannot overwrite a saved preference before it has loaded.

## Next.js App Router

Import the early theme script from the separate **server-safe** entry point. Client entry points retain their `'use client'` directives, so a Server Component can import the provider or toggle directly.

```tsx
// app/layout.tsx (a Server Component)
import type { ReactNode } from 'react';
import { ThemeProvider } from 'jamstacks';
import { ThemeScript } from 'jamstacks/server';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
```

```tsx
// A header or page, including a Server Component
import { DarkModeToggle } from 'jamstacks';

export default function Header() {
  return <header><DarkModeToggle aria-label="Dark mode" /></header>;
}
```

The early script applies the preference before the page paints; `suppressHydrationWarning` on `<html>` accounts for that intentional change to the root attributes. The provider itself renders consistently on the server and during hydration. Without `ThemeScript`, the provider still works, but the default page palette may appear briefly before hydration. No request-time rendering, cookies, or server routes are required.

For another SSR framework, inline `getThemeScript()` from `jamstacks/server` in the document head before page content. For a Content Security Policy, pass the permitted `nonce` to `ThemeScript` (or authorize the generated script with a CSP hash). Inline scripts blocked by a policy cannot prevent the initial theme flash.

## Connect the template's palette

The provider sets `html.dark` or `html.light`, `data-theme="dark|light"`, and the root's `color-scheme` style. These attributes select the template's own palette; the library does not overwrite page design tokens.

An existing template that uses only `@media (prefers-color-scheme: dark)` needs explicit class overrides so a visitor can choose light mode on a dark device, or dark mode on a light device:

```css
:root {
  --page-background: #f5f5f0;
  --page-ink: #202b26;
}

/* Device preference remains useful before hydration and without JavaScript. */
@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --page-background: #151c18;
    --page-ink: #e5ede7;
  }
}

:root.dark {
  --page-background: #151c18;
  --page-ink: #e5ede7;
}

body { background: var(--page-background); color: var(--page-ink); }
```

Apply the same pattern to all of the template's dark palette variables, including inherited `--jamstacks-*` component fallbacks. With Tailwind, configure its dark variant to use the `.dark` class rather than a media query. The toggle carries its own inline styles and needs no stylesheet import or global CSS rules. Its colours can be customized through `--jamstacks-toggle-background`, `--jamstacks-toggle-dark-background`, `--jamstacks-toggle-border`, `--jamstacks-toggle-color`, `--jamstacks-toggle-dark-color`, and `--jamstacks-toggle-thumb`. The `style` prop overrides the button's defaults; `className` remains available for template selectors. It preserves the browser's native keyboard-focus outline. Theme changes are instantaneous, with no animation that needs reduced-motion handling.

## Theme API

```tsx
'use client';

import { useTheme } from 'jamstacks';

export function FollowDeviceButton() {
  const { theme, resolvedTheme, mounted, setTheme } = useTheme();
  return (
    <button disabled={!mounted} onClick={() => setTheme('system')}>
      Follow device (preference: {theme}, appearance: {resolvedTheme})
    </button>
  );
}
```

| API | Default / behavior |
| --- | --- |
| `ThemeProvider.defaultTheme` | `'system'`; also accepts `'light'` or `'dark'` |
| `ThemeProvider.storageKey` | `'color-scheme'`, compatible with the original toggle's saved choices |
| `ThemeScript.defaultTheme`, `.storageKey` | Must match the provider when customized |
| `ThemeScript.nonce` | Optional CSP nonce |
| `useTheme().theme` | Preference: `'light'`, `'dark'`, or `'system'` |
| `useTheme().resolvedTheme` | Applied appearance: `'light'` or `'dark'` |
| `useTheme().mounted` | `false` on the server and initial hydration render; `true` after initialization |
| `useTheme().setTheme(value)` | Applies and saves the preference; `'system'` resumes following the device |

Valid saved preferences override the default. Invalid values fall back to the default. Device changes apply while using `'system'`; explicit light/dark choices remain fixed. Changes in another tab synchronize automatically; removing the key or clearing storage there returns other tabs to the default. If storage is blocked, switching still works for the current visit. Until mounted, the hook's resolved theme is the stable SSR fallback `'light'`; use `mounted` for any theme-dependent content you add yourself.

## Local component playground

```sh
npm ci
npm run dev
```

Open [http://localhost:4173](http://localhost:4173). The page has light/dark/system controls, live theme and device state, shared toggle instances, colour and inline-style examples, and disabled/cancelled variants. Use the on-page checks to test persistence after reloading, synchronization between tabs, and keyboard operation. The playground uses the real component source without any library stylesheet.

Edit `demo/` or `src/` and refresh the browser to see changes. The early initialization script is rebuilt when the server starts; restart after changing that script. Stop with Ctrl+C, or select another port with `npm run dev -- --port 4300`. The server listens only on this computer and needs no external service. Demo page styles live in `demo/demo.css` and are not included in the published library.

## Develop and validate

Use Node 24 (see `.nvmrc`).

```sh
npm ci
npx playwright install chromium
npm run typecheck
npm test
npm pack --dry-run
```

`npm test` builds the package, checks its public imports and server rendering, then exercises real-browser hydration, first-paint initialization, storage failures, persistence, cross-tab changes, keyboard operation and system overrides. On Linux, local tests use `/usr/bin/chromium` when available; override it with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. CI installs Playwright's Chromium and validates React 18.2 and React 19.3 compatibility on pushes and pull requests. Nothing is automatically published.

Add future reusable components under `src/components/` and export their public props from `src/index.ts`. Keep browser-interactive entry points marked `'use client'`, server utilities under `src/server.ts`, template content outside the package, and component styling encapsulated inline with `--jamstacks-` customization tokens.

## Release

Publishing runs in `.github/workflows/npm-publish.yml` when a GitHub release is published, matching the ServiceStack React release flow. It checks both React versions, verifies the release tag matches the package version, builds the package and publishes to npm with provenance. Ordinary pushes and pull requests only validate; drafts and prereleases do not publish an npm version.

With a clean working tree on `main`:

```sh
npm run bump          # patch: update package + lockfile, commit, tag, and push
# Or: npm run bump:minor / npm run bump:major
npm run release       # create the GitHub release; its Action publishes to npm
```

`npm run release -- --dry-run` prints the release commands without creating or pushing tags or releases. The release command requires GitHub CLI authentication and refuses uncommitted, unpushed or mismatched-tag code. For the initial `0.1.0` release, it creates the missing version tag automatically; no bump is needed.

Configure npm trusted publishing for package `jamstacks`: GitHub organization `ServiceStack`, repository `jamstacks-react`, workflow filename `npm-publish.yml`, and permission to publish directly. No npm token is stored in the workflow. npm requires the package to exist before adding a trusted publisher; first-package registration must be completed once before running this Action. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Commit the reproducible lockfile. `dist/`, browser reports, dependencies and package archives are generated files.

BSD-3-Clause. See [LICENSE](LICENSE).
