# The Penny Post

A small public exhibit: write a postcard, watch it get stamped and posted, watch it **arrive**, open
it, flip it, and take it home as a picture. Live at
[pennypost.mechanicalcupcakes.fun](https://pennypost.mechanicalcupcakes.fun).

It's also a homework project. It's deliberately small, deliberately boring in its choice of tools, and
documented past the point most side projects ever reach, because it's the worked example I point
people at when they ask what a codebase actually is and how a repo is managed. The code is part of the
exhibit. Poke at it.

If you want the story of *why* it was built this way, that's in
[`WRITEUP.md`](./WRITEUP.md), which is also the live page at
[/under-the-hood/](https://pennypost.mechanicalcupcakes.fun/under-the-hood/). This file is the
practical half: what to type, and what the standards are.

---

## ⛔ The one rule that matters most

**Nothing leaves your browser, and you're supposed to check.**

There's no server, no database, no accounts, no analytics and no API routes. Everything you make lives
in one browser tab and is gone when you close it. That's not a limitation, it's the thing the app is
demonstrating, and a claim like that is worthless if you can't verify it.

So verify it:

1. Open the site, press **F12**, go to the **Network** tab.
2. Tick "Preserve log" and reload.
3. Use the whole app. Write a card, post it, wait for it, open it, download it.
4. Every request should be to `pennypost.mechanicalcupcakes.fun`. Nothing else.

**This is why there are no web fonts.** A single `<link>` to Google Fonts would be a request to Google
on every page load, and the app's central claim would be false. The fonts are system stacks
(Palatino, Book Antiqua, Georgia). This is also why there are no image files: the engravings and the
stamp are SVG paths written by hand in `components/`.

If you add anything to this app, that's the rule it has to survive.

### The sub-rule that will actually break your build

**Never touch `sessionStorage` at module scope or during render.**

This app is a static export, which means every page is rendered in Node during the build, where
`sessionStorage` doesn't exist. Read it during render and the *build* dies with
`ReferenceError: window is not defined`.

The nasty part: `npm run dev` passes clean, because dev mode doesn't prerender. You'll find out at
build time, or in production. Read session state inside a `useEffect`, after mount, only. The pattern
is in `components/PennyPost.tsx:78-113` and the reasoning is in `lib/session.ts`.

---

## Run it

⚠️ **`npm install` goes in the repo root, not in this folder.** This is an npm *workspace*, so
dependencies get installed once at the top and shared. Running `npm install` in here will look like it
worked and leave you in a confusing state.

```bash
# from the repo root, once
npm install

# then, from this folder
npm run dev      # http://localhost:3006
npm run build    # writes out/
npm run start    # serves the built out/ on :3006
npx eslint .     # must exit 0
```

**`out/` *is* the website.** After `npm run build` you have a folder of plain HTML, CSS and
JavaScript. Open `out/index.html` in a browser. Zip it and email it to somebody. Drop it on any static
host. There's no runtime to install and no server to keep alive, and that's the whole point of the
setup this app uses.

---

## What's in here

```
apps/pennypost/
├── WRITEUP.md          the development + architecture story; ALSO the /under-the-hood/ page
├── README.md           this file
├── app/
│   ├── page.tsx        the exhibit
│   ├── about/          why it is called The Penny Post (history, sourced)
│   ├── under-the-hood/ renders WRITEUP.md at build time
│   ├── layout.tsx      fonts, metadata, the html shell
│   └── globals.css     the entire design system
├── components/
│   ├── PennyPost.tsx   the state machine and all five beats
│   ├── Engravings.tsx  four line engravings, drawn as SVG paths
│   ├── Stamp.tsx       the stamp and its cancellation mark
│   ├── PostcardFlip.tsx the 3D flip
│   ├── LetterRack.tsx  the arrivals rack
│   └── Masthead.tsx    the broadsheet furniture
├── lib/
│   ├── types.ts        Card, TRANSIT_MS, and the delivery predicate
│   ├── seed.ts         the cards that exist before you write one
│   ├── session.ts      the entire persistence layer (one sessionStorage key)
│   ├── png.ts          the take-home PNG encoder
│   └── writeup.ts      reads WRITEUP.md at build time
├── next.config.ts      output: "export" and why
├── Dockerfile          two stages: build with node, serve with nginx
└── nginx.conf          headers, /health, and the try_files rule
```

---

## What "static export" means

`next.config.ts` sets three things, and each one buys something specific:

| Setting | What it does |
|---|---|
| `output: "export"` | Renders every page to HTML at build time and writes them to `out/`. No Node server at runtime. |
| `trailingSlash: true` | Emits `about/index.html` rather than `about.html`, so a plain file server resolves `/about/` correctly. |
| `images: { unoptimized: true }` | Turns off Next's image optimizer, which needs a server. There are no raster images here anyway. |

The trade is real and worth understanding rather than memorising: you give up anything that needs to
run per-request (API routes, server-side rendering, reading a database) and you get a site that can't
leak data, can't be hacked at runtime, costs nothing to host, and will still work in ten years. For
this app that trade is obviously correct. For a shop with a checkout it would be obviously wrong.

---

## How this repo is managed

This is the part most tutorials skip.

**One branch per change.** Work on a branch, not on `main`. `main` is what ships.

**Commit messages say why, not what.** The diff already says what changed. A good message explains the
decision, and names the thing that would otherwise get rediscovered painfully in six months. Format
used here:

```
fix(pennypost): source every historical claim on /about, correct four
docs(pennypost): add WRITEUP.md, the first per-app writeup
```

**Pushing to `main` publishes production images.** `.github/workflows/docker-publish.yml` builds this
app into a container and pushes it to GitHub's registry. That's not a staging step. Push carefully.

**⚠️ The build context is `./apps/pennypost`, and it constrains where files can live.** CI builds this
image with:

```yaml
context: ./apps/pennypost
```

Docker can't see a single byte above that folder. So `WRITEUP.md` lives *inside* this app rather than
in a shared `docs/` tree at the repo root, because the page that renders it has to be able to read it
at build time. That's a real constraint that decided a real filing question. If you put a file
somewhere and the container build can't find it, this is why.

**Deploy names its services.** Never a bare `docker compose up -d` on this stack. The compose file
declares services that are deliberately not deployed, and a bare `up -d` would start them:

```bash
docker compose -f docker-compose.prod.yml up -d mcos-pennypost
```

---

## Verified, with dates

Claims in this README that could be false, and when they were last actually checked:

| Claim | Checked | How |
|---|---|---|
| `npm run build` exits 0 | 2026-09-01 | run, exit code read |
| `npx eslint .` exits 0 | 2026-09-01 | run, exit code read |
| The build fails if `WRITEUP.md` is missing | 2026-09-01 | renamed the file, build aborted with `ENOENT`, exit 1 |
| Zero non-origin requests at runtime | 2026-08-04 | DevTools network panel against the shipped bundle |
| One `sessionStorage` key, `localStorage` empty | 2026-08-01 | DevTools Application tab |
| The exported PNG is a real 1200×1010 image | 2026-08-01 | exported, opened, inspected |
| The hydration gate can actually fail | 2026-08-01 | planted a `sessionStorage` read during render, build aborted, reverted |

That last row is the important one. **A check that can't fail isn't a check.** A green build only means
something if you've watched it go red for the right reason.

---

## Bugs the build caught, or should have (don't reintroduce)

- **`requestAnimationFrame` never fires in a background tab.** The PNG export waited on rAF, so tabbing
  away while a download prepared left the button stuck on "Preparing…" forever. It's now raced against
  a 150ms timer.
- **CSS custom properties don't resolve in a serialised SVG.** The engravings are styled with
  `var(--ink)`. Serialise that SVG into a standalone data URL and there's no document left to resolve
  against, so every stroke rendered black on black. Computed values are substituted before serialising.
- **The PNG canvas was too short.** At 470px the signature rendered below the canvas and the footer rule
  cut through it. It's 505 now, and the comment in `lib/png.ts` says why so nobody "tidies" it back.
- **`eslint .` reported 10,193 problems.** It was linting minified build output: the root config's
  ignore paths resolve relative to the repo root, so `apps/pennypost/.next/**` was never covered. Fixed
  with a local `eslint.config.mjs`.
- **Reading `sessionStorage` during render aborts the build.** See the sub-rule above.

---

## Deliberately NOT built yet

- **No unit tests.** The build gate and a live walkthrough have carried the whole load. If you add
  tests, start with `lib/session.ts` (the version-mismatch discard path) and `isDelivered` in
  `lib/types.ts`, because those are the two places where a silent wrong answer is possible.
- **No lockfile in this app.** The Docker build installs from `package.json` alone and resolves fresh
  every time. That's a genuine supply-chain exposure, and it's why adding a dependency here gets
  argued about instead of just done. Runtime dependencies: **three**. `next`, `react`, `react-dom`.
- **No accounts, no sending, no analytics.** Not missing features. See the one rule.

---

## Where the full story lives

- [`WRITEUP.md`](./WRITEUP.md) — how it was built and why, including what broke. Same file as the
  [/under-the-hood/](https://pennypost.mechanicalcupcakes.fun/under-the-hood/) page, rendered at build
  time, so the repo and the site can't drift apart.
- [The About page](https://pennypost.mechanicalcupcakes.fun/about/) — the 1840 Uniform Penny Post, and
  why a postcard toy is named after it. Every date on it is sourced.
- Built by Ernest (they/them). I teach people to use AI tools without the hype, mostly small businesses
  and people who've been told they aren't technical: [ernestofgaia.xyz](https://ernestofgaia.xyz), or
  text 503-664-0546.
