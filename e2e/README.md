# Localhost UI automation

Standalone Playwright project covering the scenario in
[`valid-batch-sizes.feature`](../features/valid-batch-sizes.feature).
The test fills the Production planner through the browser, calls the real backend,
and checks that the UI displays 24 complete portions. It does not mock the API.
The feature is mapped to a Playwright test; this project does not execute Gherkin directly.

From the repository root (Node.js 22 or newer):

```sh
npm ci
npm --prefix web ci
npm --prefix e2e ci
npm --prefix e2e run install:browsers
npm --prefix e2e test
```

Playwright starts the backend at http://localhost:3000 and the frontend at
http://localhost:5173, waits for readiness, and stops the servers it starts.
Locally it reuses servers already running on these URLs; ensure an existing
frontend uses `VITE_API_URL=http://localhost:3000`. In CI both ports must be free.

To watch the browser or use the interactive test runner:

```sh
npm --prefix e2e run test:headed
npm --prefix e2e run test:ui
```

Results appear in the terminal. Failure screenshots and traces are stored in
`e2e/test-results/` and ignored by Git; no artifact upload is configured.

## Run a single test file

From the repository root, pass the test file after `--`:

```sh
npm --prefix e2e run test:file -- tests/valid-batch-sizes.spec.ts
```

Replace `tests/valid-batch-sizes.spec.ts` with the desired file path relative to
`e2e/`. Use forward slashes, including on Windows. Playwright treats the argument
as a path filter; all tests in the matching file run. Backend and frontend startup
works the same as when running the full suite.

To run a single file with the Playwright UI (select tests, run them, and inspect
steps), add `--ui`:

```sh
npm --prefix e2e run test:file -- tests/valid-batch-sizes.spec.ts --ui
```

Click Run in the Playwright UI to start the selected tests. The configured local
servers start automatically when the tests run.

To show the browser while a single file runs automatically, add `--headed`:

```sh
npm --prefix e2e run test:file -- tests/valid-batch-sizes.spec.ts --headed
```

If your terminal is already in the `e2e` directory, omit `--prefix e2e`:

```sh
npm run test:file -- tests/valid-batch-sizes.spec.ts
```
