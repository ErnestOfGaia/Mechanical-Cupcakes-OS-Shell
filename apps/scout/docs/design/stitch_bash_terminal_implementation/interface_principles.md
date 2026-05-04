# Scout Interface Principles

Status: draft

## Product Feeling

Scout should feel like a working Garage before it feels like a crypto dashboard. The interface should make agent infrastructure approachable, visible, and testable.

## Principles

1. Start with the tool in the user's hand.

The first useful object is the Walkie Talkie. The user should be able to do something immediately.

2. Show the network as activity, not lore.

Network Activity should show concrete events. Avoid long explanatory panels when a log or state change can teach the concept.

3. Simulated data must be honest.

The prototype can be playful, but fake network data should be labeled as simulated.

4. Keep the local prototype quiet and functional.

Use the Garage metaphor, but do not overbuild game progression before the first loop works.

5. Prefer visible state over hidden magic.

Queries, responses, saved agents, and errors should be inspectable.

6. Treat the OS Shell as wrapper context.

Mechanical Cupcakes OS Shell can provide branding and domain framing later. Scout v0.1 should first work as a local prototype inside that workspace.

## Initial Layout

- Left or top area: Garage status and tool navigation.
- Main area: current tool, starting with Walkie Talkie.
- Side or bottom area: Network Activity.
- Secondary area: Whiteboard saved agents.

## Visual Direction For v0.1

Use a practical dashboard with subtle Garage/Mission Control cues. Save immersive 3D, Synaptic Universe, and game progression for later once the core loop is useful.

