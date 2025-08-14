# Copilot instructions

## General

Whenever you change code, always make sure tests, linting, and formatting pass,
unless explicitly instructed otherwise.

## Project overview

This is a TypeScript GitHub action(s) that integrates with our internal APIs to
publish attestations and to report policy results for those attestations.

There are two actions, one for attestation publishing and one for policy
evaluation:

- Publishing uses `/action.yml` and `src/publish`
- Policy uses `policy/action.yml` and `src/policy`

## Tools

- Linting - run `npm lint`
- Formatting - run `npm format:check`
- Updating format - run `npm format:write`
- Tests - run `npm test`
