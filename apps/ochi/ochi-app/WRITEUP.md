# OCHI: development and architecture

## A check-in, not a planner

OCHI stands for Oregon Coastal Hospitality Intelligence, and it lives at
[ochi.mechanicalcupcakes.fun](https://ochi.mechanicalcupcakes.fun). It shows four things about
Pacific City, Oregon, for the weekend coming up: whether Highway 6 is open, what gas costs, how many
people are searching for the place, and how the county's lodging tax is running, each with the time
it was recorded. Above them sits one number, the Master Multiplier, a 0-to-1 read of how busy the
weekend looks.

It isn't a planner. The person it's for already heard something about the weekend, from a neighbour
or a forecast, already made a plan, and just wants to check in on conditions before the plan meets
reality. Their baseline came from somewhere else, so OCHI can't show them change against it. It shows
conditions now, per signal, with a timestamp, and they do the comparing. Signals come first and the
number comes last. Freshness is the feature. A stale or made-up reading is worse than no dashboard,
because the person has now confirmed a plan against fiction.

## It started as an owl

This app is older than the gallery it lives in. It began as the "Hoot Dashboard," a hospitality
report delivered by an owl mascot, and it was the first side product I thought of. It was also a
test of a second coding tool on something small. As with most of my ideas, one idea turned into
another, and the question that showed up was what to do with the rather large pile of projects I
knew was coming. Not a link tree. A directory built my own way, on my own infrastructure. That became
Mechanical Cupcakes OS. The owl moved up a level and became the gallery's curator, and the dashboard
lost its mascot, got renamed, and became the first exhibit.

OCHI doesn't need an agent, for any reason. Its whole thing is giving you what you need on one
screen with minimal scrolling. Hoot knows about the projects and can walk you through why I built
them. It doesn't operate them.

The product model is simple. A small app that's easy to rebrand and gets more accurate the more data
you give it. You buy it, or I build it for you, and it runs on your own data, self-hosted, behind a
login or out in public. The second tenant is already in progress, and it isn't about tourism at all.

## The shoulders, and an honest word about who this is for

I work in hospitality, on the Oregon coast, and the thing nobody has a tool for isn't July 4.
Everyone staffs up for July 4 whatever the weather does. The hard days are the shoulders: June, when
the seasonal crew is still training, and September, when they've left but the sunny weekends keep
coming. That's where money leaks, in broken dishes and forgotten tickets and lost covers, from a
floor that's thin and hasn't been trained for tight conditions.

Here's the honest part. The places I've worked write schedules three or four weeks out, so "a better
read the day before" isn't how a tool like this would get used there. Right now this is a check-in: a
small tool, portable, ownable, improvable with your own numbers. Whether that's useful to a business
is a thing to find out, which is one reason I want to get involved with the state's small business
development network. Community groups might want a personalised dashboard too, so they aren't relying
on social media to reach their own people. And behind all of it is a longer story about a hyper-local
food system and whether data and a decent interface can improve how healthy food moves through a
community. That's a lot more than traffic. This is where it starts.

## Four gatekeepers and a number I don't oversell

The weights encode the strongest prior in every document I had: the highway is king. Highway 6 is
the Wilson River corridor, the main road from Portland to the coast. When it's restricted,
day-trippers don't arrive, so it carries 40% of the weight and a hard cap: a restricted road holds
the whole score at 0.40 no matter what the other signals say. Search interest gets 30% because it
leads foot traffic by days. Gas gets 20%, and lodging tax gets 10% because the public source lags
about a quarter.

I locked those weights in June as a prior to be falsified, not a truth discovered from data. Learning
them from my own memory of how busy each week was would have dressed intuition up as rigour. So the
formula starts from a defensible position and the calibration loop exists to try to break it. That's
how I start most things: not the perfect way, but a measurable one.

Gas gets a sentence on its card rather than a confident number. The price of gas where you're going
drives behaviour, and I make decisions on it myself. But it works both ways here: high prices
suppress the Portland weekender and make Oregon's cheaper, tax-free gas more attractive to a
Californian deciding where to drive. And the state average and the local average are two different
things. The people checking in are local, so accurate first, and if accurate means two prices instead
of one, I'd like to see that.

Weather isn't a gatekeeper. It's a modulator on the road. An open highway is permission, not demand
— a clear day converts most of that permission into cars and a cold, wet one converts less. So live
weather from the National Weather Service scales the road's contribution before the weights apply,
which is why the dashboard read 0.63 this week while the calibration view read 0.75. The dashboard
was looking at a cloudy Sunday and the calibration view deliberately wasn't.

## It ran on demonstration data for four months, and said so

For most of the summer OCHI computed a real formula over four constants. The weather was live, the
maths was live, and the gatekeeper readings were sample values. For a while the page said "3 of 4
signals live" over those constants, which was false, and an audit in August caught it.

The fix was to make the claim honest and then make it impossible to drift. A single flag says whether
the gatekeepers are demonstration values, the page reads that flag, and a test asserts the flag
agrees with what the data function actually returns. Flip it without wiring real data and the build
fails. Wire real data and forget it and the build fails the other way. The page apologised for sample
data, plainly, for four months.

I'd rather run a demo that says it's a demo than a prototype that lies, and that isn't a hard call,
because I don't work in versions and publishing cycles. If I'm doing something, I do it as it
happens, starting with what I've got. I'm first and foremost my own best audience. As long as it
works for me, or I'm finding out what doesn't, there's nobody to disappoint. That's the relief.

## Three states, and the fourth one that never got built

Wiring the real read meant answering a question that sounds small: what does the dashboard show when
the database can't be reached?

The natural thing to type is a fallback. Read fails, return the sample values, page keeps working.
It's three lines and it's exactly wrong: it rebuilds the lie the August audit removed, silently, at
the worst moment, because an outage during someone's check-in would show them confident sample
numbers under a live label. So the read has three states and no fourth. Live means a row was read and
is shown with its timestamps. Demo means the flag is on and the page says so. Unavailable means the
read failed: every stored signal says "Unavailable," the score disappears, and a banner explains why.
Weather stays live in all three, because it really is.

"Three states" is the engineer's phrase. My version is older and simpler: everything has a
beginning, a middle and an end, and honesty is knowing which one you're in and saying so. The same
goes for the tools. If a tool doesn't share your understanding of where things are, it'll do
something crazy with complete confidence.

I proved the fourth state doesn't exist rather than trusting I hadn't typed it. The test suite was run
with the forbidden fallback planted, and three tests failed. Then, on the live server, I stopped the
database on purpose and read the public page from outside: every card unavailable, no score, a reason
in English. Started it again and the page recovered.

## Collect forward: the twelve weeks that never existed

The plan called for seeding twelve weeks of history. Those weeks didn't exist anywhere, and
reconstructing them would have meant inventing highway statuses from memory and presenting the
result as a record. I couldn't have kept a back history current even if I'd made one. Learn how to
collect the data first. Then find the time to fetch it routinely and present it.

That's what finally happened this week: the first real row went in the night the read went live, and
a routine adds one a week. The honest sentence on the season deadline is "OCHI reads real data, N
weeks deep, and the routine that keeps it current is running," and you can watch the collection
happen. It's also how I work: meandering in a general direction, mostly out of curiosity.

Storage is Monday-anchored, because the public sources are: the Energy Information Administration
publishes on Mondays and Google Trends buckets Sunday to Saturday. The database refuses any row whose
week doesn't start on a Monday, and the dashboard faces the weekend, because nobody plans their week
with OCHI. The row for the week of September 7 shows up as "Weekend of Sep 12–13." That constraint
earned its keep the first night: the deployment notes had the dates off by one, and the database
refused the "Monday" insert. It was a Tuesday.

## One door in

Nothing writes to the database directly. Postgres publishes no port on the host, and the only way a
row gets in is a POST to an endpoint inside the app, gated by a shared secret. No secret configured
is a 503, never falling open. A wrong secret is a 401. A week that doesn't start on a Monday is a 400
with the reason in English. A value outside its list is a 422.

The endpoint merges rather than replaces, because the routine writes this week's predictors and last
week's outcome on separate calls. That merge found a real bug the first night: Postgres checks NOT
NULL on the proposed row before it resolves the conflict, so a merge that omitted the highway status
was refused as if it were a new row. The fix borrows the stored value in the insert.

The shape is deliberately generic. Nothing in the ingest module knows about Pacific City, and the
second tenant copies that file and changes the column list. Metabase sits beside the database for
calibration, behind a proxy with a password prompt in front of Metabase's own login. I checked from
outside that it answers 401 to strangers and serves nothing without credentials.

## The routine fetches and asks. It never generates

The weekly routine may do two things: fetch a value from a source, and ask me. It may not guess,
estimate, or carry a number forward. Every stored value traces to an API response or to me typing it.

Gas comes from the Energy Information Administration's weekly retail series, West Coast except
California, with the AAA Oregon average stored beside it. Highway 6 comes from ODOT's TripCheck
incident feed, which is a list of incidents rather than a road status, so a script filters to the
Wilson River route and proposes open, advisory or restricted with the incidents printed beside the
verdict. The rule is a heuristic pinned by seven test cases, and a human confirms it. Lodging tax is
quarterly from the county's own revenue summary, the Pacific City row, with last year's same quarter
standing in until the current one publishes. Search interest has no honest API, so a person reads
Google Trends and types the number. And last week's observed volume, the thing the calibration is
for, is my read of how busy it actually was.

## Your data stays in your browser

The dashboard is public and it has a funnel: a page where a business can drop its own weekly
occupancy or sales CSV and see the formula run on real numbers. That page says the file never leaves
the device, and I checked the claim rather than trusting the copy. The only network call in that flow
is the separate booking form, which sends only what you typed into it. The CSV is parsed and charted
in the browser and sent nowhere. The booking form itself used to report success and drop the request
on the floor. Now, until its upstream is configured, it says so and points you at a phone number.

## Seven runtime dependencies, and the one that hid

The app is Next.js 16 and React 19 with Tailwind 4, in a container, with seven runtime dependencies.
The Postgres client nearly didn't ship: in a monorepo, a dependency declared at the workspace root is
visible to a local build and invisible to the Docker build, which installs from the app's own
manifest and fails loudly on drift. So it's pinned in the app's own manifest, and the image build is
the check. The page renders on every request rather than from a cache, because a check-in has to
show the row that exists now.

## Things that were harder than they looked

**The schema file that had already run.** Postgres runs its init scripts once, on an empty volume.
The Monday constraint was committed before the first deploy for exactly that reason. Then the stack
got recreated on the server minutes before the code was pulled, so the database initialised from the
old schema and quietly accepted a Sunday. The file on disk and the schema in the database are
different facts.

**A date is not a timestamp.** The Postgres client turns a DATE column into a JavaScript date in the
server's local time zone, which west of UTC lands the evening before. A Monday becomes a Sunday,
silently. The client is told to hand dates back as plain text.

**A stopped database that nobody stopped.** The server's terminal mangles pasted commands, and a start
that didn't take left Postgres stopped for twenty-five minutes while I looked for a bug in the
reconnect logic. The app was right the whole time.

## What is not finished

The calibration hasn't happened yet. There's one row, and the weights are a documented prior until
there are weeks of observed volume beside them. The annotations on the cards state numbers, like a
restricted road holding volume to 40% of normal, that are hypotheses from the June design, not
measurements. They read more confidently than they've earned.

The lodging figure excludes online-platform rentals, which the county pools separately. Search
interest is still typed by hand. Surf conditions, which this coast cares about and which have a live
buoy feed, are planned and not built. And the gallery's curator doesn't know any of this yet. Its
knowledge of the exhibits is built from these writeups, and this is the last one.

## What it taught me

I've been building for about six months, and I'm starting to close loops: defining business
functions, budgeting for them, getting the legal paperwork in place. What OCHI taught me sits
underneath that.

A product has to be one specific thing. But what's been most useful to me isn't the product, it's the
relationship I have with using what I make. None of these projects are simply for the number. They're
small pieces of things I'm trying to figure out, like whether a simpler design helps me produce more
useful things in a world that keeps changing. I remember the first time our household got a computer,
and a pager, and a cell phone with an antenna, and some of the design that's in me comes out through
this. The second half of a life is shaped differently from the first. Risk management is the name of
the game there, and it doesn't have to be a scary one.

The other thing is the one this whole document circles: AI tools give you confident wrong answers,
and so do dependencies in general. So I have to learn how to check them. It's like a car. If you want
to fix it you have to learn how it works, take things apart, put them together, test. Only after
you've checked something can you rule it out. I'm not sure I know how to do that well yet. But I'm
learning, and I'd like to help other people learn it, because it's a marketable skill that saves a
business time and money, especially now, when nobody can say where these tools will be in six months.

Patterns to details, then. I build a frame, which is really a template, and it lets me do small things
and big things and things I don't know I want to do yet. When I find something that works and I can
reuse it, I do.

## Provenance

Repo: [github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell](https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell),
in `apps/ochi/ochi-app`. Written by Ernest (they/them), September 2026.

This file is also the page at `/under-the-hood`. There is one copy of it, rendered at build time, so
the page and the repo cannot drift apart.

To see the formula on your own numbers, the "Add your data" page does that in your browser. To talk
about it, text 503-664-0546 or email <eog@ernestofgaia.xyz>.
