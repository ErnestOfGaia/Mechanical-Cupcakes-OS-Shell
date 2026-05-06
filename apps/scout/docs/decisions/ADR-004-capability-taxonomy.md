# ADR-004: Capability Taxonomy For Garage v0.1

Status: draft

## Context

Scout discovery depends on describing what agents can do. The full protocol may eventually need a shared registry or ontology. The local prototype only needs enough consistency to test query matching and candidate display.

## Proposed Decision

Use simple namespaced capability strings for v0.1.

Examples:

- `code.review`
- `code.security_audit`
- `data.validation`
- `research.web`
- `tourism.eco_guide`

## Consequences

- Capability filters are easy to implement.
- The taxonomy remains human-readable.
- The prototype avoids a premature global registry.
- A future ADR can decide whether capability strings become registered, guild-scoped, or ontology-backed.

## Rules For v0.1

- Lowercase only.
- Dot-separated namespace and capability.
- Use underscores inside a capability name when needed.
- Avoid spaces.
- Unknown strings are allowed in mock data but should be visible in the UI.

