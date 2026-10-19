# La Cheminee FnB

Restaurant operations application with a NestJS/Fastify API and a Vietnamese React staff interface for seating, bill estimation, kitchen planning, menu lookup, and best-selling-item reports.

## Requirements

- Node.js 22 or later (CI uses Node.js 24)
- npm

## Run locally

Run commands from the repository root. Install dependencies once:

```bash
npm install
npm --prefix web install
```

**BE** — API at `http://localhost:3000`:

```bash
npm run build
npm start
```

For automatic reload during development, use `npm run start:dev` instead.

**FE** — open a second terminal and run:

```bash
npm --prefix web run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).
Set `VITE_API_URL` if the BE runs at a different address.

## Staff workspace

- **Tổng quan:** shortcuts to everyday restaurant tasks and service connection status.
- **Bàn & chỗ ngồi:** enter tables, statuses, and permitted connections; find available groups and filter by party size.
- **Tính hóa đơn:** estimate capped discounts, service charge, VAT, and the total in VND.
- **Kế hoạch bếp:** enter recipe usage and inventory packs to calculate complete portions.
- **Món bán chạy:** enter order lines and a reporting period in Vietnam time (UTC+7).
- **Tra cứu món:** look up an existing menu ID, such as `house-coffee`.

Inputs are retained in local storage on the current browser. Sample table layouts
and order lines are opt-in examples. Calculations use the API; this workspace does
not create orders, reserve tables, or update inventory. Menu prices are displayed
without a currency because the menu API does not currently provide one.

## Available API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `GET` | `/menu/:id` | Get a menu item |
| `GET` | `/bills/estimate?subtotal=1000000` | Estimate a bill including service charge and VAT |
| `POST` | `/recipes/maximum-portions` | Calculate complete portions possible from inventory |
| `POST` | `/reports/most-ordered-menu-item` | Find the most ordered menu item in a selected shift, day, or week |
| `POST` | `/tables/available-groups` | Find connected groups of available tables and their total capacities |

Example production-planning request:

```json
{
  "ingredients": [
    { "ingredientName": "Coffee", "unitsRequiredPerPortion": 2, "packCount": 3, "unitsPerPack": 24 },
    { "ingredientName": "Milk", "unitsRequiredPerPortion": 3, "packCount": 2, "unitsPerPack": 36 }
  ]
}
```

The response is `{ "maximumPortions": 24 }`. The ingredient that can produce the fewest portions determines the result.

Example most-ordered-item request. The API accepts real order lines and filters them to the inclusive-start, exclusive-end reporting period:

```json
{
  "reportingPeriod": {
    "startsAt": "2026-09-05T18:00:00+07:00",
    "endsAt": "2026-09-05T22:00:00+07:00"
  },
  "orders": [
    { "menuItemId": "house-coffee", "orderedAt": "2026-09-05T18:10:00+07:00", "quantity": 2 },
    { "menuItemId": "iced-latte", "orderedAt": "2026-09-05T18:30:00+07:00", "quantity": 3 },
    { "menuItemId": "iced-latte", "orderedAt": "2026-09-05T20:15:00+07:00", "quantity": 2 }
  ]
}
```

The response is `{ "menuItemId": "iced-latte", "orderedQuantity": 5 }`. The report supports unbounded string IDs and order-line quantities. For equal quantities, the lexical-smaller menu ID wins so the result is deterministic.

Example available-table-group request. Supply a current table snapshot and explicit,
undirected connections identifying tables permitted to join:

```json
{
  "tables": [
    { "number": 1, "area": "Dining room", "capacity": 2, "status": "available" },
    { "number": 2, "area": "Dining room", "capacity": 4, "status": "available" },
    { "number": 3, "area": "Dining room", "capacity": 2, "status": "occupied" },
    { "number": 4, "area": "Dining room", "capacity": 2, "status": "available" }
  ],
  "connections": [{ "from": 1, "to": 2 }, { "from": 2, "to": 3 }, { "from": 3, "to": 4 }]
}
```

The response is:

```json
{
  "groups": [
    { "tableNumbers": [1, 2], "totalCapacity": 6 },
    { "tableNumbers": [4], "totalCapacity": 2 }
  ]
}
```

Occupied and reserved tables interrupt connectivity. An available table with no
connections forms its own group; an empty layout returns an empty group list.
Matching areas alone do not create connections. The calculation preserves inputs
and does not reserve tables or persist the supplied layout. Groups are candidates:
their total capacity does not guarantee all tables can be joined simultaneously.
Table numbers must be unique positive safe integers, capacities must be positive
safe integers, areas must be nonblank, and statuses must be `available`, `reserved`,
or `occupied`. Connections must reference existing tables. Invalid layouts return
HTTP 400; duplicate connections and self connections are harmless.

## Development commands

```bash
npm test                 # Run API/domain tests
npm run test:coverage    # Run tests with terminal and Cobertura coverage
npm run build            # Build the API
npm --prefix web run build # Build the React interface
```

GitHub Actions runs both builds and the tests for pushes and pull requests targeting `master`. Coverage is printed in the workflow output and job summary.

Backend source and tests use `.ts` extensions in relative imports. TypeScript's
`rewriteRelativeImportExtensions` option rewrites these to `.js` during the build.
Run the compiled backend with `npm start`; development uses `npm run start:dev`.

For localhost browser automation of `features/valid-batch-sizes.feature`, see the
[Playwright project setup and commands](e2e/README.md).

## Project structure

```text
src/
  domain/          Business rules, including billing and production capacity
  application/     Use cases and ports
  adapters/        HTTP and persistence implementations
  infrastructure/  NestJS composition
web/               React/Vite staff interface
test/              Vitest domain tests
e2e/               Standalone Playwright localhost UI tests
features/          Gherkin business scenarios
```
