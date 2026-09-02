# The Penny Post: development and architecture

## A postcard you can watch arrive

The Penny Post is a small public exhibit at
[pennypost.mechanicalcupcakes.fun](https://pennypost.mechanicalcupcakes.fun). You pick an engraved
front, write a few lines, address it to a name, and post it. A stamp lands, a cancellation mark
strikes it, and the card goes into transit. Wait about twelve seconds and it arrives: a flag drops, an
unread badge appears, and you can open the card and turn it over to read. Then you can take it home as
a picture.

It sends nothing. It stores nothing on any server. It has no accounts, no database, no API routes and
no environment variables. That isn't a limitation I worked around. It's the argument the exhibit is
making, and this document is the account of how it got built and what the decisions cost.

## The private tier is the lab; the public tier is what it spawns

This app has a parent. I built a private postcard app for myself and someone close to me, so we could
send each other good-morning and good-evening notes with a picture attached. It's still private, still
gated, and deliberately not part of the gallery. I'm not going to describe what's in it or link it,
and that boundary is the point rather than an omission.

It was a good little project and I wanted to show it off. That's the whole origin of this one. The
problem is that showing off the original would mean either handing strangers a login to a private
mailbox, or standing up something that sends real mail on behalf of anonymous people. I don't want to
own either of those. So the question became: what's the smallest version of this that a stranger can
actually use, that teaches the same thing, and that can't be turned into a spam cannon?

That question is most of the design.

There's a pattern underneath it that I follow on purpose, and it comes out of permaculture rather than
software: **patterns to details.** Nearly everything I've built started as something for my own use,
and some of them turn out to solve a problem other people have too. Working that way is a form of risk
management as much as a creative method. You spend resources you already have, on a problem you
already understand, before you spend resources you don't have on a guess. If it works for me it might
work for somebody else, and if it doesn't, the only person who lost time is me.

The other thing this one is meant to be is forkable. Somebody just starting out should be able to copy
it and make their own version, for whoever's in their life, without asking anyone's permission and
without a platform deciding that the only replies available are a heart and a thumbs up.

## Cutting the email killed 60% of the build and made the demo better

The public version was going to send real postcards by email, gated behind a CAPTCHA. I killed it, and
the reason is worth stating plainly because it wasn't a technical failure. The private original does
send mail, and it works fine.

The difference is who it sends to. The original only ever mails people who already know each other, at
addresses that were known in advance. Opening that up is a completely different piece of software: a
sending domain standing up from scratch, whose first production traffic is anonymous strangers
submitting arbitrary text, next door to the address I run a business from. That's an abuse vector with
a toy attached to it. I don't like spam, and I'm not going to build something that makes it easier for
somebody else to send.

Cutting it removed roughly 60% of the remaining build and 100% of the abuse surface.

What I didn't expect was that it produced a *better* exhibit. A real sending app can only ever show you
the sending half. You compose, you hit send, and the story ends at your screen. The simulation shows
you the card arriving, which is the half the private app is actually about and the half that makes
anyone feel anything.

## The theme is the thesis, not the decoration

The app is dressed as an 1840s broadsheet because it's named for the Uniform Penny Post, the reform
that made British postage a flat prepaid penny instead of a distance-priced charge collected from the
recipient at the door. The full history is on the [about page](https://pennypost.mechanicalcupcakes.fun/about/),
and I'm not going to repeat it here.

What matters for the architecture is that the theme and the privacy claim are the same claim. A
capable thing gets held behind a price, or a login, or a form that wants your details, and then
somebody makes it cheap and open and it turns out a lot of people were waiting. The app asks you for
nothing because that's the thing it's about. Every technical decision below comes from wanting that
sentence to be exactly true rather than roughly true.

## Three runtime dependencies, and that number is a constraint

The stack is Next.js 16, React 19 and Tailwind 4, built with `output: "export"` so the whole app
compiles to static files. `apps/pennypost/package.json` has exactly three runtime dependencies:
`next`, `react` and `react-dom`. Everything else is a build tool.

That number's a constraint, not a boast. Every dependency is code I'd be shipping to someone's browser
on the strength of somebody else's judgment, and the app's central claim is about what does and
doesn't happen in that browser. The icons and engravings are hand-written inline SVG for the same
reason, not because an icon library would've been hard to add.

The file map is small enough to read in one sitting:

```
apps/pennypost/
  app/
    page.tsx          the exhibit
    about/            why it is called that
    globals.css       the whole design system, such as it is
  components/
    PennyPost.tsx     the state machine and all five beats
    Engravings.tsx    four line engravings, drawn in code
    Stamp.tsx         the stamp and its cancellation
    PostcardFlip.tsx  the 3D flip
    LetterRack.tsx    the arrivals rack
    Masthead.tsx      the broadsheet furniture
  lib/
    types.ts          Card, and the delivery predicate
    seed.ts           the cards that exist before you write one
    session.ts        the entire persistence layer
    png.ts            the take-home encoder
```

Five beats: the counter, composing, transit, arrival, and taking it home.

## Five things that were harder than they looked

**Prerendering fights session state.** A static export prerenders every page in Node, where
`sessionStorage` doesn't exist. Read it during render and the *build* dies with
`ReferenceError: window is not defined`. What makes this genuinely nasty is that `npm run dev` passes
clean, because dev mode doesn't prerender. So the app starts from seed data with a clock of `0`, and
adopts real session state in an effect after mount, behind a `loaded` flag. Seed cards carry
`deliverAt: 0` so that `0 <= 0` marks them delivered at the very first paint, which keeps the
prerendered HTML and the first client render identical.

**The lint rule is wrong here, and saying so in the file was the fix.** React's
`react-hooks/set-state-in-effect` rule tells you to derive the value during render instead. In this
app that advice is precisely the bug: deriving it during render is the build-time crash above. The
disable comment carries the reasoning, because a bare `eslint-disable` is a decision nobody can audit
later.

**Delivery is a timestamp, not a timer.** A `setTimeout` would have been the obvious way to make a
card arrive. It's also wrong: refresh mid-flight and the timer dies with the page, stranding the card
forever. Instead each card stores a `deliverAt` epoch, a 500ms tick updates `now`, and delivery is
derived (`deliverAt <= now`). Refreshing during transit and watching the card still land on schedule
is the check that proves it.

**Dates had to be frozen at write time.** Calling `toLocaleDateString()` during render makes the build
host's timezone and the visitor's disagree, which breaks hydration in a way that's invisible until it
isn't. Every card carries a pre-formatted `dateLabel` string instead.

**Two bugs in the take-home encoder, both invisible in casual testing.** The engravings are inline SVG
styled with CSS custom properties, and those *do not resolve* once the SVG is serialised into a
standalone data URL. There's no document left for `var(--ink)` to look up, so every stroke rendered
black on black. The fix substitutes computed values before serialising. Separately,
`requestAnimationFrame` never fires in a hidden or background tab, and tabbing away while waiting for
a download is entirely ordinary. On its own it left the button stuck on "Preparing…" forever with no
recovery but a reload. It's now raced against a 150ms timer so the export always proceeds.

## The art is drawn in code because a web font would make the app lie

Fonts are system serif stacks. Not one web font, because a single request to Google Fonts would make
"nothing leaves your browser" false, and the app would be telling a lie about the exact thing it
exists to demonstrate. A claim you can check is worth more than a claim you assert, and this one is
checkable in about fifteen seconds with the network panel open.

The card fronts are line engravings drawn as SVG paths. That's period-correct for 1840 and it's also
the achievable option for one person who is not an illustrator. Both things are true, and I'd rather
say so than pretend the constraint was a preference.

## A zero-runtime app that still needs a container

The build produces `apps/pennypost/out/`, a folder of static files. That folder *is* the website. You
can open it locally, zip it, hand it to somebody.

It still ships inside a thin `nginx:alpine` container, published to GHCR by CI and deployed by compose
behind Nginx Proxy Manager. That looks like overkill for a folder of HTML, and there are two reasons
it isn't. The gallery shell embeds this app cross-origin, so something has to send a
`frame-ancestors` policy, a correct multi-page `try_files` rule and a `/health` endpoint. That's an
nginx config, and an nginx config wants a container to live in. And it keeps this app on the same
pipeline as everything else in the repo instead of inventing a second deploy path for one exception.

## A check that cannot fail is not a check

The rule I try to hold to is that a passing check only counts if I've watched it fail first.

The hydration gate is the worked example. I deliberately added a `sessionStorage` read during render
to confirm the build would abort, watched it throw, and reverted it. That's the only reason I trust a
green build here. Before that experiment, "the build passes" meant nothing, because I had no evidence
the build was looking.

The same discipline covers the rest. The zero-network claim is checked by loading the app with
DevTools open and counting non-origin requests, and the check discriminates because adding a single
remote image makes it fail. The exported PNG was opened and inspected rather than assumed. The live
deploy is verified from outside with `curl`, asserting both that the new state is present and that the
old state is gone, because only the second half can catch a deploy that silently didn't land.

## What is not finished

There aren't any unit tests. The build gate and a live walkthrough have carried the whole verification
load so far — defensible for a toy, less defensible now this app is the worked example other people
are meant to learn from.

There's no lockfile in this app, so its Docker build installs from `package.json` alone and resolves
fresh every time. That's a real supply-chain exposure and it's the reason a new dependency here gets
argued about rather than added.

The nginx config still names a `www.` host in its frame-ancestors policy that has no TLS certificate,
so that token sits inert. It's harmless and it's untidy, and it's tracked.

## What it taught me

Two things, and the first one is about design.

Good design is produced by editing. A thing you imagine doesn't have much shape at first. It can be
felt more easily than described, and most of the work is finding its edges. Constraints do that for
you, which is why every good decision in this build came from one: cutting email made the demo better,
refusing dependencies made the privacy claim checkable, and prerendering forced a state model that
survives a refresh mid-flight, which a `setTimeout` version never would have. You can't build a thing
that has everything for everybody. Working inside limits is what makes something useful to somebody in
particular.

The second is about documentation, and it took me longer to get to.

Some of the most marketable things I have ever done are undocumented. They didn't need a bureaucracy at
the time, so there isn't one, and that work is effectively invisible now. It matters more in this field
than in most: if something happened on a computer, people reasonably assume a record of it exists, and
when there isn't one the absence gets read as absence of work.

For context on why that lands hard for me: most of the last twenty years I spent doing farm work, some
disaster response, a bit of construction. I was using computers the whole time, because that's a thing
I'd do whether anybody paid me for it or not, and some of it was genuinely useful — barcoding stock
coming back from a processor so it could be tracked out through a farmers market, that kind of thing.
Almost none of it left a record anybody can read. This does.

So the writeup isn't overhead bolted onto the project. It's the part that survives. And the tools I
teach are very good at exactly this, which means there's no longer much excuse for not having one.
Documentation is also, in the plainest sense, an accessibility measure. It's how somebody who wasn't
there gets in.

## Provenance

Repo: [github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell](https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell),
in `apps/pennypost`. Written by Ernest (they/them), September 2026.

This file is also the page at `/under-the-hood/`. There is one copy of it, rendered at build time, so
the page and the repo cannot drift apart.

If you want to talk about building something like this, text 503-664-0546 or email
eog@ernestofgaia.xyz.
