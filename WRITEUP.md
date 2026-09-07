# Mechanical Cupcakes OS: development and architecture

## A gallery that has to tell the truth about itself

Mechanical Cupcakes OS is a shell that wraps several small independent apps under one
top bar and one agent. You land on it, you see a few exhibits, you open one, and it
runs inside the frame with the bar still there. Each app also runs perfectly well on
its own subdomain without the shell existing at all.

It's a hobby project. A mix of personal things and work-adjacent things, built on
nights and days off around a restaurant job, and nobody's paying for it. It's also
the public project gallery for the last-mile work I do for other people, which means
strangers look at it. Both of those are true at once, and the rule that falls out of holding them together is the most useful thing in this document:

**The hobbyist framing excuses unfinished. It never excuses untrue.**

Uptime, polish and completeness are things a hobby project gets to relax. Claims made to a stranger aren't. Most of what follows is that distinction being applied, usually after finding somewhere it
hadn't been.

## The shape: one bar, many canvases

The shell owns a fixed 48-pixel top bar and nothing else. Apps own everything below it.

Integration is an iframe pointed at the app's own subdomain. That's a deliberately boring
choice and it buys the thing I care about most: every app keeps working if the
shell breaks, and none of them can be broken by a change to the shell's layout. There's no
shared JavaScript, no shared CSS, no component library reaching across the boundary. An app
is a URL.

The cost is real and it's worth stating. Cross-origin iframes mean each app has to send its
own `frame-ancestors` policy or refuse to be embedded, the shell can't read anything inside
the frame, and deep links into an app don't survive the wrapper. I've taken that trade
every time, because the alternative is a monorepo where a shell refactor
can break five apps at once.

## One registry, after learning why

There's a single `APP_REGISTRY` that says what apps exist, where they live, what state
they're in, and what Hoot should say about each. Everything reads from it: the landing
grid, the directory, Hoot's greeting, the top bar title.

That's a recent repair rather than a design. Until very recently the landing page had
its own hardcoded copy of the app list, and the two had drifted apart in every field
that could drift: different ids for the same app, different names, different icons,
different descriptions, and different statuses, including one status string that wasn't
a member of the registry's own type union. The directory and the landing page
disagreed in public about what state an app was in.

Nobody introduced that on purpose. It happened because adding an app was two edits and one
of them was easy to forget, and every individual forgetting was small. Registering
an app is now one edit, and the list has three tiers:

- **Featured**, exactly three, on the landing grid
- **Directory**, everything else that's real: parked, deprecating, client-owned,
  guest exhibits, and briefs with no build yet
- **Private**, login-gated apps listed openly so the people who do have logins can find
  them. Listed isn't reachable.

The count of three is fixed on purpose. A featured list that grows to fit whatever exists
stops meaning anything; the point is that promoting one thing demotes another.

## Placards, or: the honest way to show something that doesn't exist

Some cards in the directory don't have an app behind them. A campaign tool that's finished and
deliberately never deployed. A dashboard whose data layer is built and whose interface
isn't. A show. A book.

These get placards: a card and a page that say what the thing is and why there's nothing
to open. Both alternatives were worse. Leaving them off the gallery makes it quietly incomplete,
and giving them a link makes it lie about being a door.

There's a rule underneath this that took a wrong turn to find. The first version was
"a placard never becomes a build". Clean, easy to enforce, and it bought scope
discipline by making the gallery lie about intent. The version that survived is that a placard
*may* become a build, just not before the work ahead of it is finished. The
status label for that is `queued`, and it's the honest public face of a queue rather than
a promise or a denial.

## Hoot explains; Hoot doesn't operate

There's an agent in the top bar. It knows what the apps are and how they were built, and
it's deliberately not wired to do anything. It can't deploy, edit, publish or navigate on your behalf.

That boundary has held since the first day and it's the single most important thing about
this part of the system. An agent that explains can be wrong and waste your time. An agent that operates can be
wrong and cost you something — which is the whole of the argument.

**Hoot currently has no knowledge base, and the gallery says so out loud.** The retrieval index
is a JSON file that's gitignored, which means CI builds from a checkout that has
never contained it, which means the published image has always shipped without one. In
production Hoot answers from the model alone.

That isn't a regression, it's the actual plan: the knowledge base is supposed to be
built *from* these writeups, so it can't exist until they do. What matters is that the gap
is externally provable rather than a claim in a commit message. `/health` reports
the state and the footer displays it, so "no knowledge base" is visible to anyone who
looks, and it will flip to a real chunk count on its own when the work lands.

## Five things that were harder than they looked

**A build-time environment variable isn't a runtime one, and the comment said it was.**
The iframe pages read their destination from an environment variable. Three of them had
a comment saying the value was "evaluated at runtime on the server" while the page had
no dynamic directive at all, so Next prerendered them during the image build, where no
environment file exists, and baked the fallback in. The variables were inert and the
comments said otherwise. It went unnoticed for months because every fallback happened to equal its production URL,
so the pages worked.

The version of that bug that *did* get noticed is worse and more instructive: the
postcards route used a `NEXT_PUBLIC_` variable, which Next inlines into the client
bundle at build time. It shipped a dead `localhost:3001` iframe to every visitor for
weeks. Nothing errored — the page rendered, the frame was empty, and no check existed that could
tell the difference.

**A container crash-looped every six seconds for two months and nothing said a word.**
It was found because a deploy happened to list every container on the box rather than
only the ones being deployed. It had never served a request and nothing depended on it, so nothing complained. Restart policies cover a crash. They don't cover a thing that crashes,
restarts, and crashes again forever, and neither does anything else here yet.

**The health check had the bug it existed to catch.** It tested whether the knowledge file existed. But the ingest script's real failure mode is writing a well-formed *empty*
array, because every content path is one rename away from producing zero documents, and
an existence check reports that as healthy. It counts chunks now, and the ingest script
exits non-zero rather than writing an empty index.

**A guard inside a dynamically-rendered page isn't a build-time guard.** I wrote a
check that threw if the featured count was ever not three, with a comment explaining
that the landing page imports it so a bad registry would fail the build. It doesn't:
that page is rendered per request, never prerendered, so a planted fourth featured app
built completely clean. Worse, at request time the throw would have taken the public
gallery down over a registry typo. It's a script wired to `prebuild` now.

**The fabricated chrome was the last thing to go, and it was the worst.** The footer
displayed a system uptime that was a hardcoded string rather than a counter, an agent
version number corresponding to nothing, and the words "Access Level: Administrator" on
a public unauthenticated page. Theme flavour, all of it, and none of it true. The third one
bothered me most: a page that pretends the visitor is signed in as an admin is lying about
the system on the one surface that's supposed to be honest.

## How it ships

Push to `main`, GitHub Actions builds the images and publishes them, then a human
pulls and restarts named services on the VPS behind a reverse proxy. The deploy is
deliberately manual, because an automated deploy from a compromised repository is a much
worse day than a manual one.

Two things about that are worth knowing, because both have bitten. Deploying by naming
services matters, because a bare `up -d` would create a database and a dashboard that
were declared but deliberately never deployed. And pulling immediately after a push can
fetch the *previous* image if the build has not finished, which reports complete success
and changes nothing. Confirming the image digest actually moved is the only way to tell those apart.

## The checks, and how I know they can fail

The rule is that a check only counts once I've watched it fail for the right reason.

That isn't a slogan here, it's the thing that caught the worst defects. A denylist
scan across a whole tree reported it clean; it was using a flag combination that silently
matches nothing, and it would've reported clean forever. A registry guard
passed every build; it was never running. In both cases the code was fine and the
instrument was broken, and a passing result is exactly what a broken instrument produces.

So: plant the defect, watch the check go red, remove it, watch it go green. The alternative
is trusting a green result that's never been shown capable of being red.

## What is not finished

Nothing alerts on drift. Healthchecks exist and a hung container is detectable, but
nothing compares what is running to what was published and nothing pages anyone when a
container starts flapping. That's the gap that let the two-month crash loop happen and it's still open.

Hoot doesn't have a knowledge base, by sequencing rather than neglect. It gets built from these
writeups once enough of them exist.

There's one app on the gallery that's being deprecated rather than finished, and the
deprecation itself is the deliverable: assess it, harvest what was useful, verify the
backups on disk, delete it, and document the cleanup as it happens. Ending a project on purpose
and in public is a thing almost nobody demonstrates.

## What it taught me

Every serious defect in this project was invisible rather than loud. A dead iframe that
rendered fine. A container restarting forever with nobody depending on it. A health
check that reported healthy. A scan that found nothing because it was searching for
nothing. A guard that never ran.

None of them threw an error. All of them were caught by going and asking a question whose
answer could have been embarrassing: reading the whole container list instead of mine, planting a string to see whether the scanner noticed, breaking a thing on purpose
to see whether the check screamed.

That's the actual method, and it's the part worth copying: **build the check so it can
fail, then make it fail once, so that when it passes you have learned something.**

## Provenance

Repository:
[github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell](https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell).
Written by Ernest (they/them), September 2026.

This file is also the page at `/under-the-hood`. There's one copy of it.

If you want to talk about building something like this, text 503-664-0546 or email
<eog@ernestofgaia.xyz>.
