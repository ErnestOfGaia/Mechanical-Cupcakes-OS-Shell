# PRD: Garage v0.1 Local Prototype

Status: draft

## Summary

Garage v0.1 proves the smallest useful Scout Protocol loop: a user can open a local Garage, ask one simulated peer node for agent recommendations, review returned candidates, save one candidate, and see the protocol activity that happened.

This is a local learning prototype, not a production network node.

## Primary User

The first user is Ernest, acting as a Scout operator learning and shaping the protocol through a local prototype.

Secondary users, later, are collaborators who need to understand the Scout concept quickly without reading the full notes archive.

## Problem

Scout Protocol has a strong long-term vision, but the product needs a small, testable interface loop that can be used locally and refined slowly. Without a bounded v0.1, work can drift into blockchain, gossip, tokenomics, or immersive UI before the basic interaction is understood.

## Goals

- Make the Garage concept tangible in a browser.
- Demonstrate one Walkie Talkie query-response interaction.
- Show agent candidates returned by a peer node.
- Let the user save a candidate to the Whiteboard.
- Show Network Activity events so the protocol is visible.
- Keep the prototype local, deterministic, and cheap to run.

## Non-Goals

- Real peer discovery.
- Real gossip propagation.
- Real blockchain settlement.
- Real GAIA token flows.
- Real agent autonomy.
- Real Mastra backend.
- VPS deployment.
- Full OS Shell integration.

## Core User Story

As a Scout operator, I want to ask a known node for agents that match a mission so that I can understand how discovery, response, and saving candidates should feel before the network is real.

## Required Screens

- Garage Home: shows local node status, current tool, saved agents, and activity summary.
- Walkie Talkie: lets the user send one query to a simulated peer node.
- Candidate Results: shows returned agents with capability, price, latency, and reputation.
- Whiteboard: shows saved candidate agents.
- Network Activity: shows raw or semi-raw message events generated during the interaction.

## Acceptance Criteria

- User can start the app locally.
- User can send a predefined or custom mission query.
- Simulated peer node returns at least three agent candidates.
- User can save one or more candidates to the Whiteboard.
- Network Activity records query sent, response received, and candidate saved events.
- Refreshing the page does not need to preserve state for v0.1 unless persistence is explicitly added later.
- The UI clearly distinguishes simulated data from real network data.

## Prototype Data

Use deterministic mock data for:

- Local Garage identity.
- Peer node identity.
- Agent candidates.
- Reputation values.
- Pricing.
- Latency.
- Message signatures.

## Success Test

A successful 5-minute demo should answer:

- What is the Garage?
- What is the Walkie Talkie?
- What kind of agents can be discovered?
- What happened at the protocol/message level?
- What would become real in the next prototype?

