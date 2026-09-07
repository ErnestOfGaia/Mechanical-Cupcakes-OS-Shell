# OCHI: development and architecture

## A check-in, not a planner

OCHI stands for Oregon Coastal Hospitality Intelligence, and it lives at
[ochi.mechanicalcupcakes.fun](https://ochi.mechanicalcupcakes.fun). It shows four things about
Pacific City, Oregon, for the weekend coming up: whether Highway 6 is open, what gas costs, how many
people are searching for the place, and how the county's lodging tax is running. Each one carries the
time it was recorded. Above them sits a single number, the Master Multiplier, which folds the four
into a 0-to-1 read of how busy the weekend looks.

I want to be careful about what that is for, because it changed shape three times and only the last
shape is right. It isn't a planner. It isn't a forecast you build a
schedule around. The person it's for already heard something about the weekend, from a neighbour or
a forecast or a group chat, already made a plan, and just wants to check in on conditions before the
plan meets reality. Their baseline came from somewhere else, so OCHI can't show them change against
it. It shows conditions now, per signal, with a timestamp, and they do the comparing.

That framing settles most of the arguments below. Signals come first and the number comes last.
Freshness is the feature. And a stale or made-up reading is worse than no dashboard at all, because
the person has now confirmed a plan against fiction.

## It started as an owl

This app is older than the gallery it lives in. It began as the "Hoot Dashboard," a hospitality
report delivered by an owl mascot, and while I was working out what it should look like the
bigger question showed up: what if every one-off project I build shared a shell? That question
became Mechanical Cupcakes OS. The owl moved up a level and became the gallery's curator. The
dashboard lost its mascot, got renamed, and became the first exhibit.

It exists because I work in hospitality, on the Oregon coast, and the thing nobody has a tool for
isn't July 4. Everyone staffs up for July 4 whatever the weather does. The hard days are the shoulders: June, when the seasonal crew is still
training, and September, when they've left but the sunny weekends keep coming. That's where money
leaks, in broken dishes and forgotten tickets and lost covers, from a floor that's thin and hasn't
been trained for tight conditions. OCHI's whole job is to reduce that uncertainty on the ambiguous
days, not the obvious ones.

Pacific City is the first tenant, not the product. The product is the pattern: a handful of
"gatekeeper" signals that decide whether people can and will come, a formula that combines them, and
a calibration loop against real numbers. The second tenant is already in progress and it isn't about
tourism at all.

## Four gatekeepers and a number I don't oversell

The weights encode the strongest prior in every document I had: the highway is king. Highway 6 is
the Wilson River corridor, the main road from Portland to the coast. When it's restricted, day-trippers don't arrive, full stop,
so it carries 40% of the weight and a hard cap on top: a restricted road caps the whole score at
0.40 no matter how strong the other signals look. Search interest gets 30% because it leads foot
traffic by days. Gas gets 20%, and lodging tax gets 10% because the public source lags about a
quarter.

I locked those weights in June as a prior to be falsified, not a truth discovered from data. The
temptation was to "learn" the weights from my own memory of how busy each week was, and that would
have dressed intuition up as rigour. Instead the formula starts from a defensible position and the
calibration loop exists to try to break it. If a restricted week ever scores above 0.40 without the
cap, the cap was right. If the prior contradicts what actually happens, the weights move.

Gas deserves its own caveat, and it's why the annotation on that card is a sentence rather than a
confident number. High gas prices suppress the Portland weekender. They also make Oregon's cheaper,
tax-free gas more attractive to a Californian deciding where to drive. So the same reading can push
demand both ways depending on who's coming, and I'd rather say that on the card than pretend the
maths knows.

Weather isn't a gatekeeper. It's a modulator on the road. An open highway is permission, not demand
— a clear day converts most of that permission into cars and a cold, wet one converts less. So the
live weather from the National Weather Service scales the road's contribution before the weights
apply. That's why the dashboard and the calibration view can disagree — the week I'm writing this,
Metabase reads 0.75 and the dashboard reads 0.63, because the dashboard is looking at a cloudy Sunday
and the calibration view deliberately isn't.

## It ran on demonstration data for four months, and said so

For most of the summer OCHI computed a real formula over four constants. The weather was live, the
maths was live, and the gatekeeper readings were sample values. For a while the page said "3 of 4
signals live" over those constants, which was false, and an audit in August caught it.

The fix wasn't to hide the demo. It was to make the claim honest and then make it impossible to
drift. A single flag says whether the gatekeepers are demonstration values, the page reads that flag,
and a test asserts the flag agrees with what the data function actually returns. Flip the flag
without wiring real data and the build fails. Wire real data and forget the flag and it fails the
other way. The page apologised for sample data, plainly, for four months. I'd rather run a demo that
says it's a demo than a prototype that lies.

## Three states, and the one I refused to build

Wiring the real read meant answering a question that sounds small: what does the dashboard show when
the database can't be reached?

The natural thing to type is a fallback. Read fails, return the sample values, page keeps working.
It's three lines and it's exactly wrong: it rebuilds the lie the August audit removed, silently, at
the worst moment, because a database outage during someone's check-in would show them confident
sample numbers under a live label. So the read has exactly three states and no
fourth. Live means a row was read and is shown with its timestamps. Demo means the flag is on
and the page says so. Unavailable means the flag is off and the read failed, and every stored signal
says "Unavailable" instead of a number, the score disappears, and a banner explains why. Weather
stays live in all three, because it's a separate feed and it really is live.

I proved the fourth state doesn't exist rather than trusting that I hadn't typed it. The test suite
was run with the forbidden fallback planted, and three tests failed. Then, on the live server, I
stopped the database on purpose and read the public page from outside: every card unavailable, no
score, a reason in English. Started it again and the page recovered on its own.

## Collect forward: the twelve weeks that never existed

The plan called for seeding twelve weeks of history. Those weeks didn't exist anywhere, and
reconstructing them would have meant inventing highway statuses and search numbers from memory, then
presenting the result as a record.

So the decision was to collect forward. The first real row went in the night the read went live,
and a routine adds one a week. The honest sentence on the season deadline is "OCHI reads real data,
N weeks deep, and the routine that keeps it current is running," and I think that's a better demo
than backfilled history would have been, because you can watch the collection happen.

Storage is Monday-anchored, because the public sources are: the Energy Information Administration
publishes on Mondays and Google Trends buckets Sunday to Saturday. The database refuses any row
whose week doesn't start on a Monday. The dashboard, though, faces the weekend, because nobody
plans their week with OCHI. The row for the week of September 7 shows up as "Weekend of Sep 12–13."
That constraint earned its keep the first night: the deployment notes had the dates off by one day,
and the database refused the "Monday" insert. It was a Tuesday.

## One door in

Nothing writes to the database directly. Postgres publishes no port on the host, and the only way a
row gets in is a POST to an endpoint inside the app, gated by a shared secret. If the secret isn't
configured on the server the endpoint refuses with a 503 rather than falling open. A wrong secret is
a 401. A week that doesn't start on a Monday is a 400 with the reason in English, before the
database gets a chance to say it in SQL. A value outside its list is a 422.

The endpoint merges rather than replaces. A POST that only carries last week's observed volume
leaves last week's other readings alone, which matters because the routine writes this week's
predictors and last week's outcome on separate calls. That merge found a real bug on the first
night: Postgres checks NOT NULL on the proposed row before it resolves the conflict, so a merge that
omitted the highway status was refused as if it were a new row. The fix borrows the stored value in
the insert.

The shape is deliberately generic. Nothing in the ingest module knows about Pacific City. The second
tenant copies that file and changes the column list, and if a public Oregon data API ever grows out
of this, this is the seed.

Metabase sits beside the database for calibration. It's reachable on the internet only through a
proxy with a password prompt in front of Metabase's own login, and I checked from outside that it
answers 401 to strangers and serves zero bytes of Metabase without credentials.

## The routine fetches and asks. It never generates

The weekly routine is allowed to do two things: fetch a value from a source, and ask me. It isn't
allowed to guess, estimate, or carry a number forward. This is the same rule I use on the Oregon
public-data project, where no language model sits in the ingest path, applied here: every stored
value traces to an API response or to me typing it.

Gas comes from the Energy Information Administration's weekly retail series. There's no Oregon-only
weekly number, so it uses the West Coast except California, and stores the AAA Oregon state average
beside it when I have one, so the two can be compared later. Highway 6 comes from ODOT's TripCheck
incident feed, which is a list of incidents rather than a road status, so a script filters to the
Wilson River route and proposes open, advisory or restricted with the incidents printed beside the
verdict. The rule is a heuristic pinned by seven test cases, and a human confirms it before it's
stored. Lodging tax is quarterly from the county's own revenue summary, the Pacific City row
specifically, with the previous year's same quarter standing in until the current one publishes.
Search interest is the one signal with no honest API, so a person reads Google Trends and types the
number. And last week's observed volume, the thing the calibration is for, is my read of how busy
it actually was. Nobody is going to fetch that.

## Your data stays in your browser

The dashboard is public and it has a funnel: a page where a business can drop its own weekly
occupancy or sales CSV and see the formula run on real numbers instead of the public baseline.
That page says the file never leaves the device, and I checked the claim rather than trusting the
copy. The only network call in that whole flow is the separate booking form, and the booking form
only sends what you typed into it. The CSV is parsed and charted in the browser and nothing about it
is sent anywhere.

The booking form has its own honesty story. It used to report success and drop the request on the
floor. Now, until the upstream that receives it is configured, it says so and points you at a phone
number and an email instead.

## Seven runtime dependencies, and the one that hid

The app is Next.js 16 and React 19 with Tailwind 4, in a container. The runtime dependencies are
Next, React, React DOM, the Postgres client, two class-name helpers and an icon set. The Postgres
client is the newest and it nearly didn't ship: the app lives in a monorepo, and a dependency
declared at the workspace root is visible to a local build and invisible to the Docker build, which
installs from the app's own manifest with `npm ci` and fails loudly on any drift. So the client is
pinned to an exact version in the app's own manifest and lockfile, and the image build is the check
that proves it.

The page renders on every request rather than from a cache, because a check-in has to show the row
that exists now. Weather is cached for thirty minutes, which is about how often the source updates.

## Things that were harder than they looked

**The schema file that had already run.** Postgres runs its init scripts once, on an empty volume,
and never again. The Monday constraint was committed before the stack was first deployed for exactly
that reason. Then the stack got recreated on the server a couple of minutes before the code was
pulled, so the database initialised from the old schema and quietly accepted a Sunday. The fix was
a hand-applied migration and a hand-added constraint, and the lesson is that the file on disk and
the schema in the database are different facts. Check the database.

**A date is not a timestamp.** The Postgres client turns a DATE column into a JavaScript date in the
server's local time zone by default, which on a server west of UTC lands the evening before. A
Monday becomes a Sunday and the week label is wrong by a day, silently. The client is told to hand
dates back as plain text.

**A stopped database that nobody stopped.** The server's terminal mangles pasted commands, and a
start command that didn't take left Postgres stopped for twenty-five minutes while I looked for a
bug in the reconnect logic. The app was right the whole time. `docker ps` first.

## A check that cannot fail is not a check

Every verification here was run in a form that could fail, and most were shown failing first — the
coupling test was run with the forbidden fallback planted, and failed. The Monday constraint was fed
a Sunday and refused it. The endpoint was sent a wrong secret, a Sunday, a bad enum and a good row,
and answered 401, 400, 422 and 200 in that order. The public page was read from outside before and
after the deploy: the phrase "Demonstration data" went from three occurrences to zero, and "Weekend
of" went from zero to one. The database was stopped on purpose and the page said so.

## What is not finished

The calibration hasn't happened yet. There's one row. The formula variants sit in a view waiting
for weeks of observed volume, and the honest thing to say is that the weights are a documented prior
and nothing more until then.

The annotations on the cards state numbers, like a restricted road holding volume to 40% of normal
and a search spike leading foot traffic by three to seven days, that are hypotheses from the June
design, not measurements. They read more confidently than they've earned, and the calibration loop
is what earns them or replaces them.

The lodging figure excludes online-platform rentals, which the county pools separately. Search
interest is still typed by hand. Surf conditions, which this coast cares about and which have a live buoy feed, are a
planned indicator and not a built one. And the gallery's curator doesn't know any of this yet. Its
knowledge of the exhibits is built from these writeups, and this is the last one.

## What it taught me

The number was never the product. I spent the early design on the Master Multiplier, and every
conversation about how to make it better was really a conversation about how to make it honest:
a cap here, a two-sided caveat there, a weather term that only touches the road. The moment the
framing settled on a check-in, the number moved to the bottom of the page and the signals moved to
the top, and the app got simpler and more useful in the same edit.

The other thing is that the worst failure a data product can have is a confident wrong answer, and
the easiest code to write produces exactly that. Every honest state in this app cost more lines than
the dishonest one would have: the demo disclosure, the unavailable state, the refusing booking form,
the routine that asks instead of guessing. None of that shows up as a feature. It's the part that
makes the features worth trusting.

## Provenance

Repo: [github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell](https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell),
in `apps/ochi/ochi-app`. Written by Ernest (they/them), September 2026.

This file is also the page at `/under-the-hood`. There is one copy of it, rendered at build time, so
the page and the repo cannot drift apart.

If you run a business on the coast and want to see the formula on your own numbers, the "Add your
data" page on the dashboard does that in your browser. To talk about it, text 503-664-0546 or email
<eog@ernestofgaia.xyz>.
