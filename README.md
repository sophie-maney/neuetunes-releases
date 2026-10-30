# neueTunes releases

Builds of neueTunes, the appcast its in-app updates read (`releases/latest/download/appcast.xml`), and the download site.

First install: download the DMG from the latest release, drag neueTunes to Applications, then open it once through System Settings → Privacy & Security → Open Anyway. Later updates install themselves.

## Site

An Astro page in the style of apple.com's iTunes 8 pages (2008), deployed on Vercel (framework preset Astro, no settings needed).

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # static output in dist/
```

- Download buttons point at `releases/latest/download/neueTunes.dmg`, which the app repo's `scripts/release.sh` uploads with every release, so they never go stale between deploys.
- Version, date, and release notes come from the GitHub API at build time, and the page reads them again in the browser, so a new release and its notes show before the next deploy. Set `GITHUB_TOKEN` in Vercel if builds hit the API's rate limit.
- Screenshots in `src/assets/shots` are real captures of the app, light and dark (`-Appearance light|dark`); the page swaps them with the system appearance. Install screenshots come from the app repo's `assets/install-guide`.
