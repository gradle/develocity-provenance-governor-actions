# GitHub Action Attestation Publisher

---

## Getting Started

TODO

## Development

### Prerequisites

- Node.js (version specified in `.node-version` file)
  - We recommend using a Node version manager like `nvm` or `nodenv` to automatically pick up the correct version from the `.node-version` file

### Setup

1. Install the correct Node.js version:
   ```bash
   # If using nvm
   nvm install
   nvm use

   # If using nodenv
   nodenv install
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Building and Testing

To build, lint, test, and package the project:

```bash
npm run all
```

### Testing the Report Generator

You can test the report generator using the following command:

```bash
npm run render <http-status-code> <path-to-response-payload-file>
```

Example:

```bash
npm run render 200 ./src/__fixtures__/success.json
```

This will generate a successful publish report.


